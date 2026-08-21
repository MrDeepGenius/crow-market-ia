import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// =============================================================================
// Acreditar USDT a la billetera de un usuario. Solo administradores.
// Uso: confirmar depositos USDT (TRC20) recibidos y cargar el saldo al usuario.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin') {
      return Response.json({ error: 'Solo los administradores pueden acreditar saldo.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount);
    const targetId = body?.userId || caller.id;

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Monto inválido.' }, { status: 400 });
    }

    const target = await base44.asServiceRole.entities.User.get(targetId);
    const current = Number(target?.wallet_balance || 0);
    await base44.asServiceRole.entities.User.update(targetId, {
      wallet_balance: Number((current + amount).toFixed(2)),
    });

    return Response.json({ success: true, credited: amount, userId: targetId, balance: Number((current + amount).toFixed(2)) });
  } catch (error) {
    console.error('creditWallet error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}