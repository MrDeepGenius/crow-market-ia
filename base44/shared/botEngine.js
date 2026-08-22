// =============================================================================
// Bot Engine: evalua la estrategia de un bot sobre velas reales en vivo.
// Reusa los mismos indicadores del backtest (backtest.js) para que el
// comportamiento en vivo coincida con el backtest. Devuelve una decision:
// BUY | SELL | EXIT | HOLD + razon + SL/TP/qty sugeridos.
// =============================================================================

import { ema, rsi, atr, bollinger, parseIndicators } from "./backtest.js";

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
  const ef = emaFastArr[i], es = emaSlowArr[i];
  const efP = emaFastArr[i - 1], esP = emaSlowArr[i - 1];
  const r = rsiArr[i];
  const atrVal = atrArr[i] || 0;
  const price = closes[i];

  const indicators = {
    price: round(price, 4),
    emaFast: ef ? round(ef, 4) : null,
    emaSlow: es ? round(es, 4) : null,
    rsi: r ? round(r, 2) : null,
    atr: round(atrVal, 6),
    mode,
    allowShort,
  };

  // --- Si hay posicion abierta: evaluar salida primero ---
  if (currentPosition && currentPosition.side) {
    let exit = false;
    let exitReason = "";
    if (mode === "reversion" && bb) {
      const mb = bb.middle[i];
      if (mb != null) {
        if (currentPosition.side === "long" && price >= mb) { exit = true; exitReason = "Precio alcanzo media (reversion)"; }
        if (currentPosition.side === "short" && price <= mb) { exit = true; exitReason = "Precio alcanzo media (reversion)"; }
      }
    }
    if (!exit && efP != null && esP != null) {
      if (currentPosition.side === "long" && efP >= esP && ef < es) { exit = true; exitReason = "Cruce EMA bajista"; }
      if (currentPosition.side === "short" && allowShort && efP <= esP && ef > es) { exit = true; exitReason = "Cruce EMA alcista"; }
    }
    if (!exit && currentPosition.sl) {
      if (currentPosition.side === "long" && price <= currentPosition.sl) { exit = true; exitReason = "Stop Loss"; }
      if (currentPosition.side === "short" && price >= currentPosition.sl) { exit = true; exitReason = "Stop Loss"; }
    }
    if (!exit && currentPosition.tp) {
      if (currentPosition.side === "long" && price >= currentPosition.tp) { exit = true; exitReason = "Take Profit"; }
      if (currentPosition.side === "short" && price <= currentPosition.tp) { exit = true; exitReason = "Take Profit"; }
    }
    if (exit) return { action: "EXIT", reason: exitReason, indicators };
    return { action: "HOLD", reason: "En posicion, sin senal de salida", indicators };
  }

  // --- Sin posicion: buscar entrada ---
  if (ef == null || es == null || r == null) {
    return { action: "HOLD", reason: "Indicadores no listos", indicators };
  }
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
  if (!entry) return { action: "HOLD", reason: "Sin senal de entrada", indicators };

  // SL / TP / riesgo
  const slStr = String(config.stopLoss ?? "");
  const tpStr = String(config.takeProfit ?? "");
  const slIsAtr = /atr/i.test(slStr);
  const tpIsAtr = /atr/i.test(tpStr);
  const slVal = parseNum(slStr, 2);
  const tpVal = parseNum(tpStr, 4);
  const riskPct = parseNum(config.riskPerOp ?? config.riskPerTrade, 1);
  let slPrice, tpPrice;
  if (entry === "BUY") {
    slPrice = slIsAtr ? price - slVal * atrVal : price * (1 - slVal / 100);
    tpPrice = tpIsAtr ? price + tpVal * atrVal : price * (1 + tpVal / 100);
  } else {
    slPrice = slIsAtr ? price + slVal * atrVal : price * (1 + slVal / 100);
    tpPrice = tpIsAtr ? price - tpVal * atrVal : price * (1 - tpVal / 100);
  }
  return {
    action: entry,
    reason: entryReason,
    sl: round(slPrice, 4),
    tp: round(tpPrice, 4),
    riskPct,
    atr: round(atrVal, 6),
    indicators,
  };
}