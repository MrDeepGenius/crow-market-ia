// =============================================================================
// Nucleo compartido del Bot Engine. Una sola evaluacion (tick) de una instancia.
// Usado por:
//   - runBotTick (manual / admin, con usuario)
//   - runAllActiveBots (workflow programado, sin usuario, service role)
//
// Garantias:
//   * Lock atomico por instancia (locked_until) -> no dos ticks simultaneos.
//   * Idempotencia: BotOrder con client_order_id unico; si hay orden pendiente
//     sin confirmar, NO se envia otra orden.
//   * Circuit breaker: consecutive_errors >= 3 -> status = paused.
//   * Sin conexion Binance = evaluacion solo lectura (NO es error).
//   * Toda la I/O de entidades usa asServiceRole (funciona sin usuario).
// =============================================================================

import { fetchKlines } from "./backtest.js";
import { evaluateSignal } from "./botEngine.js";
import { executeOrder } from "./executionGateway.js";

const PAST = "1970-01-01T00:00:00.000Z";
const LOCK_MS = 5 * 60 * 1000;
const MAX_ERRORS = 3;

function uuidv4() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
}

export async function executeTick({ base44, instance }) {
  const now = new Date();
  const nowIso = now.toISOString();
  const lockUntilIso = new Date(now.getTime() + LOCK_MS).toISOString();

  // --- 1. Adquirir lock atomico ---
  let lockRes;
  try {
    lockRes = await base44.asServiceRole.entities.BotInstance.updateMany(
      { id: instance.id, status: "running", locked_until: { $lt: nowIso } },
      { $set: { locked_until: lockUntilIso } }
    );
  } catch (e) {
    return { instance_id: instance.id, skipped: "lock_error", error: e.message };
  }
  if (!lockRes || !lockRes.updated) {
    return { instance_id: instance.id, skipped: "locked" };
  }

  const log = async (level, message, data = {}) => {
    try {
      await base44.asServiceRole.entities.BotLog.create({
        instance_id: instance.id, user_id: instance.user_id, level, message, data,
      });
    } catch (e) {}
  };

  let errored = false;
  let errMsg = "";
  const result = { instance_id: instance.id };

  try {
    const config = instance.config || {};
    const symbol = instance.symbol || (Array.isArray(config.assets) ? config.assets[0] : config.pair) || "BTC/USDT";
    const timeframe = instance.timeframe || config.timeframe || "15m";
    const isFutures = String(config.market || "Spot").toUpperCase().includes("FUTURE");

    await log("info", "Tick iniciado (server)", { symbol, timeframe });

    // --- 2. Idempotencia: orden pendiente sin confirmar? ---
    let pendingOrder = null;
    try {
      const pendings = await base44.asServiceRole.entities.BotOrder.filter(
        { bot_instance_id: instance.id, status: "pending" }, "-created_date", 5
      );
      pendingOrder = (pendings && pendings[0]) || null;
    } catch (e) {}

    // --- 3. Velas reales ---
    let candles;
    try {
      candles = await fetchKlines(symbol, timeframe, 300);
    } catch (e) {
      errored = true; errMsg = "velas: " + e.message;
      await log("error", "Error obteniendo velas: " + e.message);
      return result;
    }
    if (!candles || candles.length < 60) {
      await log("warn", "Velas insuficientes para evaluar", { count: candles?.length || 0 });
      result.skipped = "velas insuficientes";
      return result;
    }

    // --- 4. Evaluar estrategia ---
    const signal = evaluateSignal({ candles, config, currentPosition: instance.position || null });
    // Log legible: Bot + indicador + valor + condicion + resultado (formato solicitado).
    const strat = signal.strategy || {};
    const condDetails = strat.conditions
      ? Object.values(strat.conditions).flatMap((c) => c.details || [])
      : [];
    const stratLine = condDetails.length ? ` | Estrategia: ${condDetails.join(" Y ")}` : "";
    await log("signal", `Bot: ${instance.bot_name || "—"} | Senal: ${signal.action} - ${signal.reason}${stratLine}`, {
      bot_name: instance.bot_name || null,
      action: signal.action, reason: signal.reason,
      strategy_type: strat.type || null,
      conditions: strat.conditions || null,
      sl: signal.sl, tp: signal.tp, riskPct: signal.riskPct,
      ...signal.indicators,
    });
    result.signal = { action: signal.action, reason: signal.reason, strategy: strat };

    const update = { last_tick: new Date().toISOString() };

    // --- 6. Entrada ---
    if (signal.action === "BUY" || signal.action === "SELL") {
      if (pendingOrder) {
        await log("warn", "Orden pendiente sin confirmar, no se envia nueva orden (idempotencia)", {
          pending_order_id: pendingOrder.id, client_order_id: pendingOrder.client_order_id,
        });
      } else if (instance.position) {
        await log("warn", "Senal de entrada ignorada: ya hay posicion abierta (anti-duplicado)");
      } else if (signal.action === "SELL" && !isFutures) {
        await log("warn", "Short no soportado en Spot");
      } else {
        const side = signal.action === "BUY" ? "BUY" : "SELL";
        const riskPct = Number(signal.riskPct) || 1;
        const cap = Number(instance.capital) || 100;
        const notional = Math.max(10, Math.min(cap, cap * riskPct / 100));
        const clientOrderId = uuidv4();
        const lastPrice = Number(signal.indicators?.price) || candles[candles.length - 1].c;
        // Order Intent: el engine decide, el gateway ejecuta.
        const intent = {
          bot_instance_id: instance.id, user_id: instance.user_id,
          exchange: isFutures ? "binance_futures_testnet" : "binance_spot_testnet",
          symbol, side, order_type: "MARKET",
          quantity: side === "SELL" ? notional : null,
          quote_order_qty: side === "BUY" ? notional : null,
          price: null, client_order_id: clientOrderId, intent: "entry",
        };
        await log("info", "ORDER_INTENT_CREATED", { intent });
        // Registrar orden pendiente ANTES de ejecutar (idempotencia)
        let botOrder;
        try {
          botOrder = await base44.asServiceRole.entities.BotOrder.create({
            bot_instance_id: instance.id, user_id: instance.user_id,
            symbol, side, order_type: "MARKET",
            quantity: side === "SELL" ? notional : null,
            requested_price: lastPrice, status: "pending",
            client_order_id: clientOrderId, intent: "entry",
          });
        } catch (e) {
          errored = true; errMsg = "botorder create: " + e.message;
          await log("error", "EXECUTION_ERROR: No se pudo registrar orden pendiente: " + e.message);
          return result;
        }
        try {
          const res = await executeOrder(intent, { lastPrice });
          if (res.accepted && res.status === "filled") {
            const qty = Number(res.executed_quantity) || 0;
            const entryPrice = Number(res.executed_price) || lastPrice;
            await base44.asServiceRole.entities.BotOrder.update(botOrder.id, {
              status: "filled", exchange_order_id: String(res.exchange_order_id),
              executed_price: Math.round(entryPrice * 100) / 100, executed_at: new Date().toISOString(),
            });
            update.position = {
              side: side.toLowerCase(), entryPrice: Math.round(entryPrice * 100) / 100, qty,
              sl: signal.sl, tp: signal.tp, orderId: String(res.exchange_order_id),
              clientOrderId, entryTime: new Date().toISOString(),
            };
            await log("order", "ORDER_FILLED", {
              orderId: res.exchange_order_id, clientOrderId, side, qty, entryPrice: update.position.entryPrice, notional, mode: res.mode,
            });
            await log("info", "POSITION_UPDATED", { position: update.position });
          } else {
            errored = true; errMsg = "orden rechazada: " + (res.error || res.status);
            await base44.asServiceRole.entities.BotOrder.update(botOrder.id, {
              status: "rejected", error_message: String(res.error || res.status),
              executed_at: new Date().toISOString(),
            });
            await log("error", "EXECUTION_ERROR: Orden rechazada: " + (res.error || res.status));
          }
        } catch (e) {
          errored = true; errMsg = "excepcion orden: " + e.message;
          await base44.asServiceRole.entities.BotOrder.update(botOrder.id, {
            status: "error", error_message: e.message, executed_at: new Date().toISOString(),
          });
          await log("error", "EXECUTION_ERROR: Excepcion enviando orden: " + e.message);
        }
      }
    }
    // --- 7. Salida ---
    else if (signal.action === "EXIT" && instance.position) {
      const pos = instance.position;
      const exitSide = pos.side === "long" ? "SELL" : "BUY";
      const clientOrderId = uuidv4();
      const lastPrice = Number(signal.indicators?.price) || candles[candles.length - 1].c;
      const intent = {
        bot_instance_id: instance.id, user_id: instance.user_id,
        exchange: isFutures ? "binance_futures_testnet" : "binance_spot_testnet",
        symbol, side: exitSide, order_type: "MARKET",
        quantity: pos.qty, quote_order_qty: null, price: null,
        client_order_id: clientOrderId, intent: "exit",
      };
      await log("info", "ORDER_INTENT_CREATED", { intent });
      let botOrder;
      try {
        botOrder = await base44.asServiceRole.entities.BotOrder.create({
          bot_instance_id: instance.id, user_id: instance.user_id,
          symbol, side: exitSide, order_type: "MARKET", quantity: pos.qty,
          requested_price: lastPrice, status: "pending",
          client_order_id: clientOrderId, intent: "exit",
        });
      } catch (e) {
        errored = true; errMsg = "botorder exit create: " + e.message;
        await log("error", "EXECUTION_ERROR: No se pudo registrar orden de cierre: " + e.message);
        return result;
      }
      try {
        const res = await executeOrder(intent, { lastPrice });
        if (res.accepted && res.status === "filled") {
          const exitPrice = Number(res.executed_price) || lastPrice;
          const pnl = pos.side === "long"
            ? (exitPrice - pos.entryPrice) * pos.qty
            : (pos.entryPrice - exitPrice) * pos.qty;
          const stats = instance.stats || { trades: 0, wins: 0, losses: 0, pnl: 0 };
          stats.trades = (stats.trades || 0) + 1;
          if (pnl > 0) stats.wins = (stats.wins || 0) + 1; else stats.losses = (stats.losses || 0) + 1;
          stats.pnl = Math.round(((stats.pnl || 0) + pnl) * 100) / 100;
          await base44.asServiceRole.entities.BotOrder.update(botOrder.id, {
            status: "filled", exchange_order_id: String(res.exchange_order_id),
            executed_price: Math.round(exitPrice * 100) / 100, executed_at: new Date().toISOString(),
          });
          update.position = null;
          update.stats = stats;
          await log("order", "ORDER_FILLED", {
            orderId: res.exchange_order_id, clientOrderId, side: exitSide, exitPrice: Math.round(exitPrice * 100) / 100,
            pnl: stats.pnl, reason: signal.reason, mode: res.mode,
          });
          await log("info", "POSITION_UPDATED", { position: null, stats });
        } else {
          errored = true; errMsg = "cierre rechazado: " + (res.error || res.status);
          await base44.asServiceRole.entities.BotOrder.update(botOrder.id, {
            status: "rejected", error_message: String(res.error || res.status),
            executed_at: new Date().toISOString(),
          });
          await log("error", "EXECUTION_ERROR: Orden de cierre rechazada: " + (res.error || res.status));
        }
      } catch (e) {
        errored = true; errMsg = "excepcion cierre: " + e.message;
        await base44.asServiceRole.entities.BotOrder.update(botOrder.id, {
          status: "error", error_message: e.message, executed_at: new Date().toISOString(),
        });
        await log("error", "EXECUTION_ERROR: Excepcion cerrando posicion: " + e.message);
      }
    }

    // --- 8. Commit exitoso + liberar lock ---
    const commit = { ...update, consecutive_errors: 0, locked_until: PAST };
    await base44.asServiceRole.entities.BotInstance.update(instance.id, commit);
    result.position = update.position !== undefined ? update.position : instance.position;
    result.stats = update.stats || instance.stats;
    return result;
  } catch (e) {
    errored = true; errMsg = e.message;
    try { await log("error", "Excepcion en tick: " + e.message); } catch (ee) {}
    result.error = e.message;
    return result;
  } finally {
    // --- 9. Circuit breaker + liberar lock en caso de error ---
    if (errored) {
      try {
        const cur = await base44.asServiceRole.entities.BotInstance.get(instance.id);
        const errs = (cur.consecutive_errors || 0) + 1;
        const patch = { consecutive_errors: errs, locked_until: PAST, last_error: errMsg };
        if (errs >= MAX_ERRORS) patch.status = "paused";
        await base44.asServiceRole.entities.BotInstance.update(instance.id, patch);
        if (errs >= MAX_ERRORS) {
          await log("error", `Circuit breaker: bot pausado tras ${errs} errores consecutivos.`);
        }
      } catch (e) {}
    }
  }
}