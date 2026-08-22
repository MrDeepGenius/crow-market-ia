// =============================================================================
// Capa de interpretacion de estrategias declarativas.
// El Bot Builder produce config.rules = { entryLong, entryShort, exitLong, exitShort }
// cada uno es una lista de condiciones (AND) sobre indicadores.
// El Bot Engine (botEngine.js) llama a evalConditions para decidir entrada/salida
// sin logica hardcodeada: la estrategia vive en la config, no en el codigo.
//
// Indicadores soportados en condiciones:
//   RSI:        { indicator:"RSI", period?:14, op:"<"|">"|"<="|">=", value:30 }
//   EMA_CROSS:  { indicator:"EMA_CROSS", fast?:20, slow?:50, op:"cross_up"|"cross_down" }
//   EMA:        { indicator:"EMA", period?:20, op, value }   (compara EMA(period) vs value)
//   PRICE:      { indicator:"PRICE", op, value }             (compara precio vs value)
//
// Multiples condiciones en una lista = AND (todas deben cumplirse).
// =============================================================================

import { ema, rsi } from "./backtest.js";

function round(v, d = 2) {
  const f = 10 ** d;
  return Math.round(v * f) / f;
}
function compare(a, op, b) {
  switch (op) {
    case "<": return a < b;
    case "<=": return a <= b;
    case ">": return a > b;
    case ">=": return a >= b;
    case "==": return a === b;
    default: return false;
  }
}

// Evalua una sola condicion contra el contexto de indicadores ya calculados.
// Devuelve { met: bool, detail: string, value: any }.
function evalCondition(cond, ctx) {
  const name = String(cond?.indicator || "").toUpperCase();
  const op = cond?.op || "<";
  const i = ctx.i;
  const closes = ctx.closes;
  if (i < 1) return { met: false, detail: "Datos insuficientes", value: null };

  if (name === "RSI") {
    const period = Number(cond.period) || ctx.ind.rsiPeriod;
    let arr = ctx.rsiCache[period];
    if (!arr) { arr = rsi(closes, period); ctx.rsiCache[period] = arr; }
    const v = arr[i];
    if (v == null) return { met: false, detail: `RSI(${period}) no disponible`, value: null };
    const target = Number(cond.value);
    const met = compare(round(v, 2), op, target);
    return { met, detail: `RSI(${period}) ${round(v, 1)} ${op} ${target}`, value: round(v, 2) };
  }

  if (name === "EMA_CROSS") {
    const fast = Number(cond.fast) || ctx.ind.emaFast;
    const slow = Number(cond.slow) || ctx.ind.emaSlow;
    let fArr = ctx.emaCache[fast];
    if (!fArr) { fArr = ema(closes, fast); ctx.emaCache[fast] = fArr; }
    let sArr = ctx.emaCache[slow];
    if (!sArr) { sArr = ema(closes, slow); ctx.emaCache[slow] = sArr; }
    const f = fArr[i], s = sArr[i], fP = fArr[i - 1], sP = sArr[i - 1];
    if (f == null || s == null || fP == null || sP == null)
      return { met: false, detail: `EMA(${fast}/${slow}) no disponible`, value: null };
    let met = false;
    let detail = "";
    if (op === "cross_up") {
      met = fP <= sP && f > s;
      detail = `EMA${fast} (${round(f, 2)}) cruza sobre EMA${slow} (${round(s, 2)})`;
    } else if (op === "cross_down") {
      met = fP >= sP && f < s;
      detail = `EMA${fast} (${round(f, 2)}) cruza bajo EMA${slow} (${round(s, 2)})`;
    } else {
      met = compare(round(f - s, 6), op, 0);
      detail = `EMA${fast} (${round(f, 2)}) ${op} EMA${slow} (${round(s, 2)})`;
    }
    return { met, detail, value: { fast: round(f, 4), slow: round(s, 4) } };
  }

  if (name === "EMA") {
    const period = Number(cond.period) || ctx.ind.emaFast;
    let arr = ctx.emaCache[period];
    if (!arr) { arr = ema(closes, period); ctx.emaCache[period] = arr; }
    const v = arr[i];
    if (v == null) return { met: false, detail: `EMA(${period}) no disponible`, value: null };
    const target = Number(cond.value);
    const met = compare(round(v, 4), op, target);
    return { met, detail: `EMA(${period}) ${round(v, 2)} ${op} ${target}`, value: round(v, 4) };
  }

  if (name === "PRICE") {
    const v = ctx.price;
    const target = Number(cond.value);
    const met = compare(round(v, 4), op, target);
    return { met, detail: `Precio ${round(v, 2)} ${op} ${target}`, value: round(v, 4) };
  }

  return { met: false, detail: `Indicador desconocido: ${name}`, value: null };
}

// Evalua una lista de condiciones (AND). Devuelve { met, details[], values{} }.
export function evalConditions(conditions, ctx) {
  if (!Array.isArray(conditions) || conditions.length === 0)
    return { met: false, details: [], values: {} };
  const details = [];
  const values = {};
  let met = true;
  for (const cond of conditions) {
    const r = evalCondition(cond, ctx);
    if (r.detail) details.push(r.detail);
    if (r.value != null) values[String(cond.indicator)] = r.value;
    if (!r.met) met = false;
  }
  return { met, details, values };
}

// Evalua reglas de entrada. Devuelve { entry: "BUY"|"SELL"|null, reason, strategy }.
export function evalEntryRules(rules, allowShort, ctx) {
  const strategy = { type: "rules", conditions: {} };
  if (rules.entryLong && rules.entryLong.length) {
    const r = evalConditions(rules.entryLong, ctx);
    strategy.conditions.entryLong = { details: r.details, met: r.met };
    if (r.met) return { entry: "BUY", reason: "Entrada LONG: " + r.details.join(" Y "), strategy };
  }
  if (allowShort && rules.entryShort && rules.entryShort.length) {
    const r = evalConditions(rules.entryShort, ctx);
    strategy.conditions.entryShort = { details: r.details, met: r.met };
    if (r.met) return { entry: "SELL", reason: "Entrada SHORT: " + r.details.join(" Y "), strategy };
  }
  return { entry: null, reason: "Sin senal de entrada (reglas no cumplidas)", strategy };
}

// Evalua reglas de salida para la posicion actual. Devuelve { exit: bool, reason, strategy }.
export function evalExitRules(rules, side, allowShort, ctx) {
  const strategy = { type: "rules", conditions: {} };
  const key = side === "long" ? "exitLong" : "exitShort";
  if (!rules[key] || !rules[key].length) {
    return { exit: false, reason: `Sin regla de salida para ${side}`, strategy };
  }
  const r = evalConditions(rules[key], ctx);
  strategy.conditions[key] = { details: r.details, met: r.met };
  if (r.met) return { exit: true, reason: `Salida ${side.toUpperCase()}: ` + r.details.join(" Y "), strategy };
  return { exit: false, reason: "En posicion, regla de salida no cumplida", strategy };
}