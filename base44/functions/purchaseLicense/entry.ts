import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// =============================================================================
// Comprar / desbloquear una Licencia Crow (LC) pagando con saldo de billetera.
// El afiliado paga el precio de desbloqueo del nivel y queda autorizado para
// revender esa licencia y todas las inferiores.
// =============================================================================

const LICENSES = {
  bronce: { unlock: 15 },
  plata: { unlock: 25 },
  oro: { unlock: 50 },
  diamante: { unlock: 100 },
};
const ORDER = ['none', 'bronce', 'plata', 'oro', 'diamante'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const tier = (body?.tier || '').toString();
    const lic = LICENSES[tier];
    if (!lic) return Response.json({ error: 'Licencia inválida.' }, { status: 400 });

    const current = user.lc_unlocked_level || 'none';
    if (ORDER.indexOf(current) >= ORDER.indexOf(tier)) {
      return Response.json({ error: 'Ya tienes este nivel o uno superior desbloqueado.' }, { status: 400 });
    }

    const balance = Number(user.wallet_balance || 0);
    if (balance < lic.unlock) {
      return Response.json({
        error: `Saldo insuficiente. Necesitas ${lic.unlock} USDT, tienes ${balance.toFixed(2)} USDT.`,
        balance,
        required: lic.unlock,
      }, { status: 402 });
    }

    const newBalance = Number((balance - lic.unlock).toFixed(2));
    await base44.asServiceRole.entities.User.update(user.id, {
      wallet_balance: newBalance,
      lc_unlocked_level: tier,
    });

    return Response.json({
      success: true,
      tier,
      balance: newBalance,
      lc_unlocked_level: tier,
    });
  } catch (error) {
    console.error('purchaseLicense error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}