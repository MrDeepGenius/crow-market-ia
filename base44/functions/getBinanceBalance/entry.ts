import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAccount } from '../../shared/binanceTestnet.js';

// Consulta el saldo de la cuenta Binance Testnet del usuario.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const connectionId = body?.connectionId;
    if (!connectionId) return Response.json({ error: 'connectionId requerido.' }, { status: 400 });

    const conn = await base44.entities.BinanceConnection.get(connectionId);
    if (!conn || conn.user_id !== user.id) {
      return Response.json({ error: 'Conexion no encontrada.' }, { status: 404 });
    }

    const res = await getAccount({ apiKey: conn.api_key, apiSecret: conn.api_secret });
    if (!res.ok) {
      await base44.entities.BinanceConnection.update(conn.id, {
        status: "error",
        last_error: res.data?.msg || String(res.status),
        last_check: new Date().toISOString(),
      });
      return Response.json({ error: 'No se pudo consultar el saldo.', details: res.data?.msg || res.status }, { status: 502 });
    }

    await base44.entities.BinanceConnection.update(conn.id, {
      status: "connected",
      last_error: "",
      last_check: new Date().toISOString(),
    });

    const balances = (res.data?.balances || []).filter((b) => Number(b.free) > 0 || Number(b.locked) > 0);
    return Response.json({ balances, canTrade: res.data?.canTrade });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}