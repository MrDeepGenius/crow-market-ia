import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Generates a structured trading-bot configuration from a natural-language description.
// The AI never publishes or activates the bot — it only returns config for the creator to review.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const description = (body?.description || '').toString().trim();
    if (!description) {
      return Response.json({ error: 'Se requiere una descripción del bot.' }, { status: 400 });
    }
    if (description.length > 2000) {
      return Response.json({ error: 'La descripción es demasiado larga (máx. 2000 caracteres).' }, { status: 400 });
    }

    const prompt = [
      'Eres un ingeniero cuantitativo experto en bots de trading.',
      'Transforma la siguiente descripción en lenguaje natural en una configuración estructurada y realista de un bot de trading.',
      'No garantices rentabilidad. Devuelve parámetros técnicos coherentes y seguros.',
      'Usa timeframes válidos: 1m, 3m, 5m, 15m, 30m, 1H, 4H, 1D.',
      'Usa indicadores estándar: EMA, SMA, RSI, MACD, Bollinger Bands, ATR, VWAP, ADX, Stochastic, Volumen.',
      'Incluye gestión de riesgo obligatoria (stop loss, take profit, riesgo por operación).',
      '',
      'Descripción del creador:',
      description,
    ].join('\n');

    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nombre comercial del bot' },
        description: { type: 'string', description: 'Descripción clara de qué hace el bot' },
        market: { type: 'string', description: 'Mercado, ej. Spot o Futures' },
        exchange: { type: 'string', description: 'Exchange sugerido, ej. Binance, Bybit, OKX' },
        assets: { type: 'array', items: { type: 'string' }, description: 'Pares, ej. BTC/USDT' },
        timeframe: { type: 'string' },
        indicators: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              params: { type: 'string', description: 'Parámetros configurables' },
            },
          },
        },
        entry: { type: 'string', description: 'Reglas de entrada' },
        exit: { type: 'string', description: 'Reglas de salida' },
        stopLoss: { type: 'string' },
        takeProfit: { type: 'string' },
        trailingStop: { type: 'string' },
        riskManagement: { type: 'string', description: 'Riesgo por operación, tamaño de posición, límites' },
        filters: { type: 'string', description: 'Filtros de horario, volatilidad, tendencia' },
      },
      required: ['name', 'description', 'market', 'timeframe', 'entry', 'exit', 'stopLoss', 'takeProfit', 'riskManagement'],
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
    });

    return Response.json({ bot: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}