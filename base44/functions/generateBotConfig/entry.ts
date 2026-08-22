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
      'IMPORTANTE - Reglas ejecutables: además de los campos descriptivos, genera el objeto "rules" con',
      'condiciones declarativas que el motor de ejecución interpretará directamente. Cada lista es AND.',
      'Indicadores soportados en rules:',
      '  RSI:       { indicator:"RSI", period:14, op:"<", value:30 }   (op: <, <=, >, >=)',
      '  EMA_CROSS: { indicator:"EMA_CROSS", fast:20, slow:50, op:"cross_up" | "cross_down" }',
      '  EMA:       { indicator:"EMA", period:20, op:">", value:precio }',
      '  PRICE:     { indicator:"PRICE", op:"<", value:precio }',
      'entryLong/entryShort = condiciones para abrir LONG/SHORT. exitLong/exitShort = condiciones para cerrar.',
      'Ejemplo RSI puro: entryLong=[{indicator:"RSI",period:14,op:"<",value:30}], entryShort=[{indicator:"RSI",period:14,op:">",value:70}], exitLong=[{indicator:"RSI",period:14,op:">",value:70}], exitShort=[{indicator:"RSI",period:14,op:"<",value:30}].',
      'Ejemplo EMA cross: entryLong=[{indicator:"EMA_CROSS",fast:20,slow:50,op:"cross_up"}], entryShort=[{indicator:"EMA_CROSS",fast:20,slow:50,op:"cross_down"}], exitLong=[{indicator:"EMA_CROSS",fast:20,slow:50,op:"cross_down"}], exitShort=[{indicator:"EMA_CROSS",fast:20,slow:50,op:"cross_up"}].',
      'Traduce fielmente la intención del creador a estas reglas.',
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
        rules: {
          type: 'object',
          description: 'Reglas ejecutables que el motor interpreta directamente. Cada condicion es un objeto con indicator, op y params.',
          properties: {
            entryLong: {
              type: 'array',
              description: 'Condiciones AND para abrir LONG',
              items: {
                type: 'object',
                properties: {
                  indicator: { type: 'string', description: 'RSI | EMA_CROSS | EMA | PRICE' },
                  op: { type: 'string', description: '< | <= | > | >= | cross_up | cross_down' },
                  period: { type: 'number', description: 'Periodo del indicador (RSI/EMA)' },
                  fast: { type: 'number', description: 'EMA rapida (EMA_CROSS)' },
                  slow: { type: 'number', description: 'EMA lenta (EMA_CROSS)' },
                  value: { type: 'number', description: 'Valor de comparacion (RSI/EMA/PRICE)' },
                },
                required: ['indicator', 'op'],
              },
            },
            entryShort: {
              type: 'array',
              description: 'Condiciones AND para abrir SHORT',
              items: {
                type: 'object',
                properties: {
                  indicator: { type: 'string' }, op: { type: 'string' },
                  period: { type: 'number' }, fast: { type: 'number' }, slow: { type: 'number' }, value: { type: 'number' },
                },
                required: ['indicator', 'op'],
              },
            },
            exitLong: {
              type: 'array',
              description: 'Condiciones AND para cerrar LONG',
              items: {
                type: 'object',
                properties: {
                  indicator: { type: 'string' }, op: { type: 'string' },
                  period: { type: 'number' }, fast: { type: 'number' }, slow: { type: 'number' }, value: { type: 'number' },
                },
                required: ['indicator', 'op'],
              },
            },
            exitShort: {
              type: 'array',
              description: 'Condiciones AND para cerrar SHORT',
              items: {
                type: 'object',
                properties: {
                  indicator: { type: 'string' }, op: { type: 'string' },
                  period: { type: 'number' }, fast: { type: 'number' }, slow: { type: 'number' }, value: { type: 'number' },
                },
                required: ['indicator', 'op'],
              },
            },
          },
        },
      },
      required: ['name', 'description', 'market', 'timeframe', 'entry', 'exit', 'stopLoss', 'takeProfit', 'riskManagement', 'rules'],
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