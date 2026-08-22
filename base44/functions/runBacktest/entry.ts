import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { fetchKlines, runBacktest } from '../../shared/backtest.js';

// =============================================================================
// Backtest ultra-rapido in-memory.
// Pre-carga velas reales (Binance/Bybit, una sola peticion) y simula la
// estrategia del bot en memoria. Devuelve metricas para el marketplace.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const config = body?.config || {};
    const asset = body?.asset || (Array.isArray(config.assets) ? config.assets[0] : config.pair) || "BTC/USDT";
    const timeframe = body?.timeframe || config.timeframe || "15m";
    const capital = Number(body?.capital || 1000);
    const leverage = Math.max(1, Number(body?.leverage || 1));
    const commission = Number(body?.commission || 0.075);
    const limit = Math.min(Number(body?.limit || 1000), 1000);

    const t0 = Date.now();
    const candles = await fetchKlines(asset, timeframe, limit);
    if (!candles || candles.length < 50) {
      return Response.json({ error: 'No hay suficientes velas historicas para el par/timeframe.' }, { status: 422 });
    }
    const result = runBacktest({ candles, config, capital, leverage, commission });
    const durationMs = Date.now() - t0;

    return Response.json({
      success: true,
      ...result,
      symbol: String(asset).toUpperCase(),
      timeframe,
      candles: candles.length,
      durationMs,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}