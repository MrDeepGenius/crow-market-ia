import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { fetchKlines } from '../../shared/backtest.js';
import { evaluateSignal } from '../../shared/botEngine.js';
import { placeOrder, toBinanceSymbol } from '../../shared/binanceTestnet.js';

// =============================================================================
// Bot Engine tick: una evaluacion del motor sobre la instancia.
// 1. Carga config del bot + conexion Binance
// 2. Fetch velas reales (reusa fetchKlines)
// 3. evaluateSignal -> BUY/SELL/EXIT/HOLD
// 4. Si hay senal y no hay posicion abierta -> envia orden MARKET a Testnet
// 5. Si EXIT -> cierra posicion
// 6. Registra cada decision en BotLog y actualiza posicion/stats
// Proteccion anti-duplicados: solo opera si no hay posicion abierta.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const instanceId = body?.instanceId;
    if (!instanceId) return Response.json({ error: 'instanceId requerido.' }, { status: 400 });

    const instance = await base44.entities.BotInstance.get(instanceId);
    if (!instance || instance.user_id !== user.id) {
      return Response.json({ error: 'Instancia no encontrada.' }, { status: 404 });
    }
    if (instance.status !== "running") {
      return Response.json({ skipped: true, reason: 'La instancia no esta corriendo.' });
    }

    const config = instance.config || {};
    const symbol = instance.symbol || (Array.isArray(config.assets) ? config.assets[0] : config.pair) || "BTC/USDT";
    const timeframe = instance.timeframe || config.timeframe || "15m";

    const log = async (level, message, data = {}) => {
      try {
        await base44.asServiceRole.entities.BotLog.create({
          instance_id: instance.id, user_id: user.id, level, message, data,
        });
      } catch (e) {}
    };

    await log("info", "Tick iniciado", { symbol, timeframe });

    let candles;
    try {
      candles = await fetchKlines(symbol, timeframe, 300);
    } catch (e) {
      await log("error", "Error obteniendo velas: " + e.message);
      return Response.json({ error: 'No se pudieron obtener velas: ' + e.message }, { status: 502 });
    }
    if (!candles || candles.length < 60) {
      await log("warn", "Velas insuficientes para evaluar", { count: candles?.length || 0 });
      return Response.json({ skipped: true, reason: 'Velas insuficientes.' });
    }

    const signal = evaluateSignal({ candles, config, currentPosition: instance.position || null });
    await log("signal", `Senal: ${signal.action} - ${signal.reason}`, {
      action: signal.action, reason: signal.reason,
      sl: signal.sl, tp: signal.tp, riskPct: signal.riskPct,
      ...signal.indicators,
    });

    let connection = null;
    if (instance.connection_id) {
      try { connection = await base44.entities.BinanceConnection.get(instance.connection_id); } catch (e) {}
    }

    const update = { last_tick: new Date().toISOString() };
    let orderResult = null;
    const binanceSymbol = toBinanceSymbol(symbol);
    const isFutures = String(config.market || "Spot").toUpperCase().includes("FUTURE");

    // --- Entrada ---
    if (signal.action === "BUY" || signal.action === "SELL") {
      if (!connection) {
        await log("error", "Senal de entrada pero sin conexion Binance configurada");
      } else if (instance.position) {
        await log("warn", "Senal de entrada ignorada: ya hay posicion abierta (anti-duplicado)");
      } else if (signal.action === "SELL" && !isFutures) {
        await log("warn", "Short no soportado en Spot testnet");
      } else {
        const riskPct = Number(signal.riskPct) || 1;
        const cap = Number(instance.capital) || 100;
        const notional = Math.max(10, Math.min(cap, cap * riskPct / 100));
        const side = signal.action === "BUY" ? "BUY" : "SELL";
        try {
          const params = {
            apiKey: connection.api_key, apiSecret: connection.api_secret,
            symbol: binanceSymbol, side, type: "MARKET",
          };
          if (side === "BUY") params.quoteOrderQty = notional;
          else params.quantity = notional;
          const res = await placeOrder(params);
          orderResult = res;
          if (res.ok && res.data && !res.data.code) {
            const qty = Number(res.data.executedQty) || 0;
            const quote = Number(res.data.cummulativeQuoteQty) || 0;
            const entryPrice = qty ? quote / qty : candles[candles.length - 1].c;
            update.position = {
              side: side.toLowerCase(),
              entryPrice: Math.round(entryPrice * 100) / 100,
              qty,
              sl: signal.sl,
              tp: signal.tp,
              orderId: res.data.orderId,
              entryTime: new Date().toISOString(),
            };
            await log("order", `Orden ${side} ejecutada en Testnet`, {
              orderId: res.data.orderId, qty, entryPrice: update.position.entryPrice, notional,
            });
          } else {
            await log("error", `Orden rechazada: ${res.data?.msg || res.data?.code || res.status}`, res.data);
          }
        } catch (e) {
          await log("error", "Excepcion enviando orden: " + e.message);
        }
      }
    }
    // --- Salida ---
    else if (signal.action === "EXIT" && instance.position) {
      if (!connection) {
        await log("error", "Senal de salida pero sin conexion Binance");
      } else {
        const pos = instance.position;
        const exitSide = pos.side === "long" ? "SELL" : "BUY";
        try {
          const res = await placeOrder({
            apiKey: connection.api_key, apiSecret: connection.api_secret,
            symbol: binanceSymbol, side: exitSide, type: "MARKET", quantity: pos.qty,
          });
          orderResult = res;
          if (res.ok && res.data && !res.data.code) {
            const quote = Number(res.data.cummulativeQuoteQty) || 0;
            const exitPrice = pos.qty ? quote / pos.qty : candles[candles.length - 1].c;
            const pnl = pos.side === "long"
              ? (exitPrice - pos.entryPrice) * pos.qty
              : (pos.entryPrice - exitPrice) * pos.qty;
            const stats = instance.stats || { trades: 0, wins: 0, losses: 0, pnl: 0 };
            stats.trades = (stats.trades || 0) + 1;
            if (pnl > 0) stats.wins = (stats.wins || 0) + 1; else stats.losses = (stats.losses || 0) + 1;
            stats.pnl = Math.round(((stats.pnl || 0) + pnl) * 100) / 100;
            update.position = null;
            update.stats = stats;
            await log("order", `Posicion cerrada (${exitSide})`, {
              orderId: res.data.orderId, exitPrice: Math.round(exitPrice * 100) / 100,
              pnl: stats.pnl, reason: signal.reason,
            });
          } else {
            await log("error", `Orden de cierre rechazada: ${res.data?.msg || res.data?.code}`, res.data);
          }
        } catch (e) {
          await log("error", "Excepcion cerrando posicion: " + e.message);
        }
      }
    }

    const updated = await base44.entities.BotInstance.update(instance.id, update);
    return Response.json({
      success: true,
      signal: { action: signal.action, reason: signal.reason, sl: signal.sl, tp: signal.tp },
      position: updated.position,
      stats: updated.stats,
      order: orderResult,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}