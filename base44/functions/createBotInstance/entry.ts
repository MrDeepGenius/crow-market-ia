import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// =============================================================================
// Crea una BotInstance: la instancia independiente de un comprador sobre un
// bot publicado. Snapshot de la config + capital + conexion Binance.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const productId = body?.productId;
    const capital = Number(body?.capital) || 0;
    const connectionId = body?.connectionId || "";
    if (!productId) return Response.json({ error: 'productId requerido.' }, { status: 400 });
    if (!capital || capital <= 0) return Response.json({ error: 'Capital invalido.' }, { status: 400 });

    const product = await base44.entities.Product.get(productId);
    if (!product) return Response.json({ error: 'Bot no encontrado.' }, { status: 404 });

    const config = product.config || {};
    const symbol = (Array.isArray(config.assets) ? config.assets[0] : config.pair) || "BTC/USDT";
    const instance = await base44.entities.BotInstance.create({
      bot_id: productId,
      bot_name: product.name,
      user_id: user.id,
      connection_id: connectionId,
      capital,
      config,
      symbol,
      timeframe: config.timeframe || "15m",
      status: "idle",
      position: null,
      stats: { trades: 0, wins: 0, losses: 0, pnl: 0 },
    });

    await base44.asServiceRole.entities.BotLog.create({
      instance_id: instance.id,
      user_id: user.id,
      level: "info",
      message: `Instancia creada para "${product.name}" (${symbol} ${config.timeframe || "15m"})`,
      data: { capital, connection_id: connectionId },
    });

    return Response.json({ success: true, instance });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}