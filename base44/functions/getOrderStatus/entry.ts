import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getOrder, toBinanceSymbol } from '../../shared/binanceTestnet.js';

// Consulta el estado de una orden en Binance Testnet.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const conn = await base44.entities.BinanceConnection.get(body?.connectionId);
    if (!conn || conn.user_id !== user.id) {
      return Response.json({ error: 'Conexion no encontrada.' }, { status: 404 });
    }

    const res = await getOrder({
      apiKey: conn.api_key,
      apiSecret: conn.api_secret,
      symbol: toBinanceSymbol(body?.symbol),
      orderId: body?.orderId,
    });
    return Response.json({ ok: res.ok, status: res.status, order: res.data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}