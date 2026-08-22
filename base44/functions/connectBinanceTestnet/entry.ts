import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { getAccount } from '../../shared/binanceTestnet.js';

// =============================================================================
// Conecta (y verifica) credenciales de Binance Testnet para el usuario.
// Las credenciales se guardan server-side en BinanceConnection; el frontend
// nunca las envia directamente a Binance.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const apiKey = (body?.apiKey || '').toString().trim();
    const apiSecret = (body?.apiSecret || '').toString().trim();
    const label = (body?.label || '').toString().trim();
    if (!apiKey || !apiSecret) {
      return Response.json({ error: 'API Key y API Secret son requeridos.' }, { status: 400 });
    }

    // Verificar credenciales contra Binance Testnet
    const res = await getAccount({ apiKey, apiSecret });
    if (!res.ok) {
      return Response.json({
        error: 'Credenciales invalidas en Binance Testnet.',
        details: res.data?.msg || res.data?.code || res.status,
      }, { status: 401 });
    }

    // Upsert: una conexion Testnet por usuario
    const existing = await base44.entities.BinanceConnection.filter({ user_id: user.id }, "-created_date", 10);
    const payload = {
      user_id: user.id,
      api_key: apiKey,
      api_secret: apiSecret,
      label: label || "Binance Testnet",
      testnet: true,
      status: "connected",
      last_check: new Date().toISOString(),
      last_error: "",
    };
    let conn;
    if (existing && existing.length) {
      conn = await base44.entities.BinanceConnection.update(existing[0].id, payload);
    } else {
      conn = await base44.entities.BinanceConnection.create(payload);
    }

    const balances = (res.data?.balances || []).filter((b) => Number(b.free) > 0).slice(0, 20);
    return Response.json({ connected: true, connection_id: conn.id, balances });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}