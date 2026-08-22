// =============================================================================
// Motor de backtesting in-memory + indicadores técnicos + fetcher de klines reales.
// Compartido por runBacktest. Las velas se pre-cargan (una sola peticion HTTP) y
// luego la simulacion corre 100% en memoria (< 2s para 1.000 velas).
// =============================================================================

// ---------- helpers ----------
function parseNum(str, def) {
  const m = String(str ?? "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : def;
}
function round(v, d = 2) {
  const f = 10 ** d;
  return Math.round(v * f) / f;
}
function sample(arr, n) {
  if (!arr.length) return [];
  if (arr.length <= n) return arr.map((v) => round(v, 2));
  const out = [];
  const step = (arr.length - 1) / (n - 1);
  for (let i = 0; i < n; i++) out.push(round(arr[Math.round(i * step)], 2));
  return out;
}
function periodsPerYearFromTf(tf) {
  const t = String(tf || "").trim().toLowerCase();
  const map = { "1m": 525600, "3m": 175200, "5m": 105120, "15m": 35040, "30m": 17520, "1h": 8760, "4h": 2190, "1d": 365 };
  return map[t] || 35040;
}

// ---------- indicadores ----------
export function sma(values, period) {
  const out = new Array(values.length).fill(null);
  for (let i = period - 1; i < values.length; i++) {
    let s = 0;
    for (let j = i - period + 1; j <= i; j++) s += values[j];
    out[i] = s / period;
  }
  return out;
}

export function ema(values, period) {
  const out = new Array(values.length).fill(null);
  const k = 2 / (period + 1);
  let prev = null;
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) continue;
    if (prev === null) {
      let s = 0;
      for (let j = i - period + 1; j <= i; j++) s += values[j];
      prev = s / period;
    } else {
      prev = values[i] * k + prev * (1 - k);
    }
    out[i] = prev;
  }
  return out;
}

export function rsi(closes, period) {
  const out = new Array(closes.length).fill(null);
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i < closes.length; i++) {
    const ch = closes[i] - closes[i - 1];
    const gain = ch > 0 ? ch : 0;
    const loss = ch < 0 ? -ch : 0;
    if (i < period) {
      avgGain += gain; avgLoss += loss;
    } else if (i === period) {
      avgGain = (avgGain + gain) / period;
      avgLoss = (avgLoss + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      out[i] = 100 - 100 / (1 + rs);
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      out[i] = 100 - 100 / (1 + rs);
    }
  }
  return out;
}

export function atr(highs, lows, closes, period) {
  const tr = new Array(closes.length).fill(0);
  for (let i = 0; i < closes.length; i++) {
    if (i === 0) { tr[i] = highs[i] - lows[i]; continue; }
    tr[i] = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
  }
  const out = new Array(closes.length).fill(null);
  let prev = null;
  for (let i = 0; i < closes.length; i++) {
    if (i < period) continue;
    if (prev === null) {
      let s = 0;
      for (let j = 1; j <= period; j++) s += tr[j];
      prev = s / period;
    } else {
      prev = (prev * (period - 1) + tr[i]) / period;
    }
    out[i] = prev;
  }
  return out;
}

export function bollinger(closes, length, mult) {
  const upper = new Array(closes.length).fill(null);
  const lower = new Array(closes.length).fill(null);
  const middle = new Array(closes.length).fill(null);
  for (let i = length - 1; i < closes.length; i++) {
    let s = 0;
    for (let j = i - length + 1; j <= i; j++) s += closes[j];
    const mean = s / length;
    let v = 0;
    for (let j = i - length + 1; j <= i; j++) v += (closes[j] - mean) ** 2;
    const sd = Math.sqrt(v / length);
    middle[i] = mean;
    upper[i] = mean + mult * sd;
    lower[i] = mean - mult * sd;
  }
  return { upper, middle, lower };
}

// ---------- parsing de config ----------
export function parseIndicators(indicators) {
  const arr = Array.isArray(indicators) ? indicators : [];
  const find = (name) => arr.find((x) => String(x?.name || "").toUpperCase().includes(name));
  let emaFast = 20, emaSlow = 50, rsiPeriod = 14, rsiOverbought = 70, rsiOversold = 30, atrPeriod = 14, bbLength = 20, bbMult = 2;
  const em = find("EMA") || find("SMA");
  if (em) {
    const nums = String(em.params || "").match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
    if (nums.length >= 2) { emaFast = nums[0]; emaSlow = nums[1]; }
    else if (nums.length === 1) { emaFast = nums[0]; }
  }
  const r = find("RSI");
  if (r) {
    const nums = String(r.params || "").match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
    if (nums.length >= 1) rsiPeriod = nums[0];
    if (nums.length >= 2) rsiOverbought = nums[1];
    if (nums.length >= 3) rsiOversold = nums[2];
  }
  const a = find("ATR");
  if (a) atrPeriod = parseNum(a.params, atrPeriod);
  const bb = find("BOLLINGER") || find("BOLL");
  if (bb) {
    const nums = String(bb.params || "").match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
    if (nums.length >= 1) bbLength = nums[0];
    if (nums.length >= 2) bbMult = nums[1];
  }
  return { emaFast, emaSlow, rsiPeriod, rsiOverbought, rsiOversold, atrPeriod, bbLength, bbMult, hasBB: !!bb };
}

// ---------- fetcher de klines reales ----------
function normalizeSymbol(asset) {
  return String(asset || "BTC/USDT").toUpperCase().replace(/[\/\s_-]/g, "");
}
function normalizeInterval(tf) {
  const t = String(tf || "15m").trim().toLowerCase();
  const map = { "1m": "1m", "3m": "3m", "5m": "5m", "15m": "15m", "30m": "30m", "1h": "1h", "4h": "4h", "1d": "1d" };
  return map[t] || "15m";
}
function bybitInterval(interval) {
  const map = { "1m": "1", "3m": "3", "5m": "5", "15m": "15", "30m": "30", "1h": "60", "4h": "240", "1d": "D" };
  return map[interval] || "15";
}

function okxBar(interval) {
  const map = { "1m": "1m", "3m": "3m", "5m": "5m", "15m": "15m", "30m": "30m", "1h": "1H", "4h": "4H", "1d": "1D" };
  return map[interval] || "15m";
}
function coinbaseGranularity(interval) {
  const sec = { "1m": 60, "3m": 180, "5m": 300, "15m": 900, "30m": 1800, "1h": 3600, "4h": 14400, "1d": 86400 };
  return sec[interval] || 900;
}

export async function fetchKlines(asset, timeframe, limit = 1000) {
  const symbol = normalizeSymbol(asset);
  const interval = normalizeInterval(timeframe);
  const cap = Math.max(50, Math.min(limit, 1000));
  const okxSym = String(asset || "BTC/USDT").toUpperCase().replace("/", "-");

  // Todos los proveedores se consultan EN PARALELO: gana el mas rapido que devuelva velas validas.
  // Evita que un proveedor bloqueado/colgado (Binance/Bybit en algunas regiones) retrase todo el backtest.
  const providers = [
    { label: "Binance", url: `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${cap}`,
      map: async (res) => (await res.json()).map((k) => ({ t: Number(k[0]), o: Number(k[1]), h: Number(k[2]), l: Number(k[3]), c: Number(k[4]), v: Number(k[5]) })) },
    { label: "Bybit", url: `https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=${bybitInterval(interval)}&limit=${cap}`,
      map: async (res) => (await res.json())?.result?.list?.reverse().map((k) => ({ t: Number(k[0]), o: Number(k[1]), h: Number(k[2]), l: Number(k[3]), c: Number(k[4]), v: Number(k[5]) })) },
    { label: "OKX", url: `https://www.okx.com/api/v5/market/candles?instId=${okxSym}&bar=${okxBar(interval)}&limit=300`,
      map: async (res) => (await res.json())?.data?.reverse().map((k) => ({ t: Number(k[0]), o: Number(k[1]), h: Number(k[2]), l: Number(k[3]), c: Number(k[4]), v: Number(k[5]) })) },
    { label: "Coinbase", url: `https://api.exchange.coinbase.com/products/${okxSym}/candles?granularity=${coinbaseGranularity(interval)}`,
      map: async (res) => (await res.json()).reverse().map((k) => ({ t: Number(k[0]) * 1000, o: Number(k[3]), h: Number(k[2]), l: Number(k[1]), c: Number(k[4]), v: Number(k[5]) })) },
  ];

  const tryOne = (p) => new Promise((resolve, reject) => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 6000);
    fetch(p.url, { signal: ctrl.signal })
      .then(async (res) => {
        clearTimeout(to);
        if (!res.ok) return reject(new Error(`${p.label} ${res.status}`));
        const rows = await p.map(res);
        if (Array.isArray(rows) && rows.length) return resolve(rows);
        reject(new Error(`${p.label} vacio`));
      })
      .catch((e) => { clearTimeout(to); reject(new Error(`${p.label} ${e.message || e.name}`)); });
  });

  try {
    return await Promise.any(providers.map(tryOne));
  } catch (agg) {
    const msgs = (agg?.errors || []).map((e) => e?.message || String(e));
    throw new Error("No se pudieron obtener velas reales: " + (msgs.length ? msgs.join(" | ") : "todos los proveedores fallaron"));
  }
}

// ---------- motor de simulacion ----------
export function runBacktest({ candles, config = {}, capital = 1000, leverage = 1, commission = 0.075 }) {
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

  const slStr = String(config.stopLoss ?? "");
  const tpStr = String(config.takeProfit ?? "");
  const trailStr = String(config.trailingStop ?? "");
  const slIsAtr = /atr/i.test(slStr);
  const tpIsAtr = /atr/i.test(tpStr);
  const slVal = parseNum(slStr, 2);
  const tpVal = parseNum(tpStr, 4);
  const trailVal = parseNum(trailStr, 0);
  const riskPct = parseNum(config.riskPerOp ?? config.riskPerTrade, 1);
  const commRate = commission / 100;
  const periodsPerYear = periodsPerYearFromTf(config.timeframe);

  let balance = capital;
  let peak = capital;
  let maxDD = 0;
  const equityCurve = [];
  const trades = [];
  let position = null;
  let pendingEntry = null;

  function entrySignal(i) {
    if (i < 1) return null;
    const ef = emaFastArr[i], es = emaSlowArr[i], efP = emaFastArr[i - 1], esP = emaSlowArr[i - 1];
    const r = rsiArr[i];
    if (ef == null || es == null || r == null) return null;
    if (mode === "reversion" && bb) {
      const lb = bb.lower[i], ub = bb.upper[i];
      if (lb != null && ub != null) {
        if (closes[i] < lb && r < ind.rsiOversold) return "long";
        if (allowShort && closes[i] > ub && r > ind.rsiOverbought) return "short";
      }
    }
    if (efP != null && esP != null && efP <= esP && ef > es && r < ind.rsiOverbought) return "long";
    if (allowShort && efP != null && esP != null && efP >= esP && ef < es && r > ind.rsiOversold) return "short";
    return null;
  }
  function exitSignal(i) {
    const ef = emaFastArr[i], es = emaSlowArr[i], efP = emaFastArr[i - 1], esP = emaSlowArr[i - 1];
    if (ef == null || es == null) return false;
    if (mode === "reversion" && bb) {
      const mb = bb.middle[i];
      if (mb != null) {
        if (position?.side === "long" && closes[i] >= mb) return true;
        if (position?.side === "short" && closes[i] <= mb) return true;
      }
    }
    if (position?.side === "long" && efP != null && esP != null && efP >= esP && ef < es) return true;
    if (position?.side === "short" && efP != null && esP != null && efP <= esP && ef > es) return true;
    return false;
  }
  function openTrade(side, price, i) {
    if (balance <= 0) return;
    const atrVal = atrArr[i] || 0;
    let slPrice, tpPrice;
    if (side === "long") {
      slPrice = slIsAtr ? price - slVal * atrVal : price * (1 - slVal / 100);
      tpPrice = tpIsAtr ? price + tpVal * atrVal : price * (1 + tpVal / 100);
    } else {
      slPrice = slIsAtr ? price + slVal * atrVal : price * (1 + slVal / 100);
      tpPrice = tpIsAtr ? price - tpVal * atrVal : price * (1 - tpVal / 100);
    }
    const riskPerUnit = Math.abs(price - slPrice);
    if (riskPerUnit <= 0) return;
    let qty = (balance * riskPct / 100) / riskPerUnit;
    const maxNotional = balance * leverage;
    if (qty * price > maxNotional) qty = maxNotional / price;
    if (qty <= 0) return;
    const comm = qty * price * commRate;
    balance -= comm;
    position = {
      side, entryPrice: price, qty, sl: slPrice, tp: tpPrice, trail: trailVal,
      highest: price, lowest: price, entryIndex: i, entryTime: candles[i].t, commission: comm,
    };
  }
  function closeTrade(pos, price, i, reason) {
    const gross = pos.side === "long" ? (price - pos.entryPrice) * pos.qty : (pos.entryPrice - price) * pos.qty;
    const comm = price * pos.qty * commRate;
    const net = gross - comm;
    balance += net;
    trades.push({
      side: pos.side, entry: round(pos.entryPrice, 4), exit: round(price, 4), qty: round(pos.qty, 6),
      pnl: round(net, 2), reason, entryTime: pos.entryTime, exitTime: candles[i].t, bars: i - pos.entryIndex,
    });
    position = null;
  }

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    if (pendingEntry && !position) {
      openTrade(pendingEntry.side, c.o, i);
      pendingEntry = null;
    } else {
      pendingEntry = null;
    }
    if (position && position.entryIndex < i) {
      if (position.side === "long") {
        if (c.h > position.highest) position.highest = c.h;
        if (position.trail && position.highest) {
          const ts = position.highest * (1 - position.trail / 100);
          if (ts > position.sl) position.sl = ts;
        }
        if (c.l <= position.sl) closeTrade(position, position.sl, i, "SL");
        else if (c.h >= position.tp) closeTrade(position, position.tp, i, "TP");
        else if (exitSignal(i)) closeTrade(position, c.c, i, "Signal");
      } else {
        if (c.l < position.lowest) position.lowest = c.l;
        if (position.trail && position.lowest) {
          const ts = position.lowest * (1 + position.trail / 100);
          if (ts < position.sl) position.sl = ts;
        }
        if (c.h >= position.sl) closeTrade(position, position.sl, i, "SL");
        else if (c.l <= position.tp) closeTrade(position, position.tp, i, "TP");
        else if (exitSignal(i)) closeTrade(position, c.c, i, "Signal");
      }
    }
    if (!position && !pendingEntry) {
      const sig = entrySignal(i);
      if (sig) pendingEntry = { side: sig };
    }
    const unreal = position ? ((position.side === "long" ? c.c - position.entryPrice : position.entryPrice - c.c) * position.qty) : 0;
    const eq = balance + unreal;
    equityCurve.push(eq);
    if (eq > peak) peak = eq;
    const dd = peak > 0 ? (peak - eq) / peak * 100 : 0;
    if (dd > maxDD) maxDD = dd;
  }
  if (position) closeTrade(position, candles[candles.length - 1].c, candles.length - 1, "End");

  const winners = trades.filter((t) => t.pnl > 0);
  const losers = trades.filter((t) => t.pnl < 0);
  const grossWin = winners.reduce((a, t) => a + t.pnl, 0);
  const grossLoss = Math.abs(losers.reduce((a, t) => a + t.pnl, 0));
  const winRate = trades.length ? (winners.length / trades.length) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : (grossWin > 0 ? 999 : 0);
  const totalReturn = capital > 0 ? ((balance - capital) / capital) * 100 : 0;
  const rets = [];
  for (let i = 1; i < equityCurve.length; i++) {
    if (equityCurve[i - 1] > 0) rets.push((equityCurve[i] - equityCurve[i - 1]) / equityCurve[i - 1]);
  }
  const meanR = rets.length ? rets.reduce((a, b) => a + b, 0) / rets.length : 0;
  const stdR = rets.length ? Math.sqrt(rets.reduce((a, b) => a + (b - meanR) ** 2, 0) / rets.length) : 0;
  const downside = rets.filter((r) => r < 0);
  const dStd = downside.length ? Math.sqrt(downside.reduce((a, b) => a + b * b, 0) / downside.length) : 0;
  const sharpe = stdR > 0 ? (meanR / stdR) * Math.sqrt(periodsPerYear) : 0;
  const sortino = dStd > 0 ? (meanR / dStd) * Math.sqrt(periodsPerYear) : 0;
  const years = equityCurve.length / periodsPerYear;
  const annualized = years > 0 && capital > 0 && balance > 0 ? (Math.pow(balance / capital, 1 / years) - 1) * 100 : 0;

  return {
    winRate: round(winRate, 1),
    totalTrades: trades.length,
    winners: winners.length,
    losers: losers.length,
    profitFactor: isFinite(profitFactor) ? round(profitFactor, 2) : 999,
    maxDrawdown: round(maxDD, 2),
    totalReturn: round(totalReturn, 2),
    annualizedReturn: round(annualized, 2),
    sharpe: round(sharpe, 2),
    sortino: round(sortino, 2),
    finalBalance: round(balance, 2),
    capital: round(capital, 2),
    equity: sample(equityCurve, 60),
    trades: trades.slice(-200),
  };
}