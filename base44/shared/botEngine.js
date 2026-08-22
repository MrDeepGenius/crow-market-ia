// =============================================================================
// Bot Engine: evalua la estrategia de un bot sobre velas reales en vivo.
// Reusa los mismos indicadores del backtest (backtest.js) para que el
// comportamiento en vivo coincida con el backtest. Devuelve una decision:
// BUY | SELL | EXIT | HOLD + razon + SL/TP/qty sugeridos.
//
// La estrategia se lee de la config del bot (NO hardcodeada):
//   * Si config.rules existe -> evaluacion declarativa via strategyRules.js
//     (soporta RSI, EMA_CROSS, EMA, PRICE). Es el formato que produce el Builder.
//   * Si no -> fallback a la logica clasica EMA+RSI / Bollinger (backward compat).
// =============================================================================

import { ema, rsi, atr, bollinger, parseIndicators } from "./backtest.js";
import { evalEntryRules, evalExitRules } from "./strategyRules.js";

function parseNum(str, def) {
  const m = String(str ?? "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : def;
}
function round(v, d = 2) {
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

export function evaluateSignal({ candles, config, currentPosition = null }) {
  if (!candles || candles.length < 60) {
    return { action: "HOLD", reason: "Datos insuficientes", indicators: {} };
  }
  const closes = candles.map((c) => c.c);
  const highs = candles.map((c) => c.h);
  const lows = candles.map((c) => c.l);
  const ind = parseIndicators(config.indicators);
  const emaFastArr = ema(closes, ind.emaFast);
  const emaSlowArr = ema(closes, ind.emaSlow);
  const rsiArr = rsi(closes, ind.rsiPeriod);
  const atrArr = atr(highs, lows, closes, ind.atrPeriod);
  const bb = ind.hasBB ? bollinger(closes, ind.bbLength, ind.bbMult) : null;
  const market = String(config.market || "Spot").toUpperCase();
  const allowShort = market.includes("FUTURE");
  const mode = ind.hasBB ? "reversion" : "trend";

  const i = closes.length - 1;
  const price = closes[i];
  const atrVal = atrArr[i] || 0;

  const indicators = {
    price: round(price, 4),
    emaFast: emaFastArr[i] ? round(emaFastArr[i], 4) : null,
    emaSlow: emaSlowArr[i] ? round(emaSlowArr[i], 4) : null,
    rsi: rsiArr[i] ? round(rsiArr[i], 2) : null,
    atr: round(atrVal, 6),
    mode,
    allowShort,
  };

  const ctx = {
    closes, highs, lows, i, price, ind,
    emaCache: { [ind.emaFast]: emaFastArr, [ind.emaSlow]: emaSlowArr },
    rsiCache: { [ind.rsiPeriod]: rsiArr },
  };

  const hasRules = config.rules && (config.rules.entryLong || config.rules.entryShort || config.rules.exitLong || config.rules.exitShort);

  // --- Si hay posicion abierta: evaluar salida primero ---
  if (currentPosition && currentPosition.side) {
    let exitResult;
    if (hasRules) {
      exitResult = evalExitRules(config.rules, currentPosition.side, allowShort, ctx);
    } else {
      exitResult = evalExitFixed(currentPosition, { emaFastArr, emaSlowArr, bb, ind, i, price, mode });
    }
    if (exitResult.exit) return { action: "EXIT", reason: exitResult.reason, indicators, strategy: exitResult.strategy };
    return { action: "HOLD", reason: exitResult.reason || "En posicion, sin senal de salida", indicators, strategy: exitResult.strategy };
  }

  // --- Sin posicion: buscar entrada ---
  let entryResult;
  if (hasRules) {
    entryResult = evalEntryRules(config.rules, allowShort, ctx);
  } else {
    entryResult = evalEntryFixed({ emaFastArr, emaSlowArr, rsiArr, bb, ind, i, price, mode, allowShort });
  }
  if (!entryResult.entry) return { action: "HOLD", reason: entryResult.reason || "Sin senal de entrada", indicators, strategy: entryResult.strategy };

  // SL / TP / riesgo (comun para ambos caminos)
  const slStr = String(config.stopLoss ?? "");
  const tpStr = String(config.takeProfit ?? "");
  const slIsAtr = /atr/i.test(slStr);
  const tpIsAtr = /atr/i.test(tpStr);
  const slVal = parseNum(slStr, 2);
  const tpVal = parseNum(tpStr, 4);
  const riskPct = parseNum(config.riskPerOp ?? config.riskPerTrade, 1);
  let slPrice, tpPrice;
  if (entryResult.entry === "BUY") {
    slPrice = slIsAtr ? price - slVal * atrVal : price * (1 - slVal / 100);
    tpPrice = tpIsAtr ? price + tpVal * atrVal : price * (1 + tpVal / 100);
  } else {
    slPrice = slIsAtr ? price + slVal * atrVal : price * (1 + slVal / 100);
    tpPrice = tpIsAtr ? price - tpVal * atrVal : price * (1 - tpVal / 100);
  }
  return {
    action: entryResult.entry,
    reason: entryResult.reason,
    sl: round(slPrice, 4),
    tp: round(tpPrice, 4),
    riskPct,
    atr: round(atrVal, 6),
    indicators,
    strategy: entryResult.strategy,
  };
}

// --- Logica clasica (fallback cuando el bot no tiene config.rules) ---
function evalExitFixed(pos, { emaFastArr, emaSlowArr, bb, ind, i, price, mode }) {
  let exit = false;
  let exitReason = "";
  if (mode === "reversion" && bb) {
    const mb = bb.middle[i];
    if (mb != null) {
      if (pos.side === "long" && price >= mb) { exit = true; exitReason = "Precio alcanzo media (reversion)"; }
      if (pos.side === "short" && price <= mb) { exit = true; exitReason = "Precio alcanzo media (reversion)"; }
    }
  }
  if (!exit) {
    const ef = emaFastArr[i], es = emaSlowArr[i], efP = emaFastArr[i - 1], esP = emaSlowArr[i - 1];
    if (efP != null && esP != null) {
      if (pos.side === "long" && efP >= esP && ef < es) { exit = true; exitReason = "Cruce EMA bajista"; }
      if (pos.side === "short" && efP <= esP && ef > es) { exit = true; exitReason = "Cruce EMA alcista"; }
    }
  }
  if (!exit && pos.sl) {
    if (pos.side === "long" && price <= pos.sl) { exit = true; exitReason = "Stop Loss"; }
    if (pos.side === "short" && price >= pos.sl) { exit = true; exitReason = "Stop Loss"; }
  }
  if (!exit && pos.tp) {
    if (pos.side === "long" && price >= pos.tp) { exit = true; exitReason = "Take Profit"; }
    if (pos.side === "short" && price <= pos.tp) { exit = true; exitReason = "Take Profit"; }
  }
  return { exit, reason: exitReason, strategy: { type: "fixed", mode } };
}

function evalEntryFixed({ emaFastArr, emaSlowArr, rsiArr, bb, ind, i, price, mode, allowShort }) {
  const ef = emaFastArr[i], es = emaSlowArr[i], efP = emaFastArr[i - 1], esP = emaSlowArr[i - 1];
  const r = rsiArr[i];
  if (ef == null || es == null || r == null) return { entry: null, reason: "Indicadores no listos", strategy: { type: "fixed", mode } };
  let entry = null;
  let entryReason = "";
  if (mode === "reversion" && bb) {
    const lb = bb.lower[i], ub = bb.upper[i];
    if (lb != null && ub != null) {
      if (price < lb && r < ind.rsiOversold) { entry = "BUY"; entryReason = `Precio bajo banda inferior + RSI ${round(r, 1)} < ${ind.rsiOversold}`; }
      else if (allowShort && price > ub && r > ind.rsiOverbought) { entry = "SELL"; entryReason = `Precio sobre banda superior + RSI ${round(r, 1)} > ${ind.rsiOverbought}`; }
    }
  }
  if (!entry && efP != null && esP != null) {
    if (efP <= esP && ef > es && r < ind.rsiOverbought) { entry = "BUY"; entryReason = `Cruce EMA alcista (EMA${ind.emaFast}>EMA${ind.emaSlow}) + RSI ${round(r, 1)}`; }
    else if (allowShort && efP >= esP && ef < es && r > ind.rsiOversold) { entry = "SELL"; entryReason = `Cruce EMA bajista + RSI ${round(r, 1)}`; }
  }
  return { entry, reason: entryReason || "Sin senal de entrada", strategy: { type: "fixed", mode } };
}