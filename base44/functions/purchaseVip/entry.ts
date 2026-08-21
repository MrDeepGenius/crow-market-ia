import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// =============================================================================
// Comprar el Pase VIP Total pagando con saldo de la billetera (USDT).
// Precio: 115 USDT. Desbloquea el 100% de las comisiones de reventa.
// =============================================================================

const VIP_PRICE = 115;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.vip_unlocked) {
      return Response.json({ error: 'Ya tienes el Pase VIP activo.' }, { status: 400 });
    }

    const balance = Number(user.wallet_balance || 0);
    if (balance < VIP_PRICE) {
      return Response.json({
        error: `Saldo insuficiente. Necesitas ${VIP_PRICE} USDT, tienes ${balance.toFixed(2)} USDT.`,
        balance,
        required: VIP_PRICE,
      }, { status: 402 });
    }

    const newBalance = Number((balance - VIP_PRICE).toFixed(2));
    await base44.asServiceRole.entities.User.update(user.id, {
      wallet_balance: newBalance,
      vip_unlocked: true,
    });

    return Response.json({
      success: true,
      balance: newBalance,
      vip_unlocked: true,
    });
  } catch (error) {
    console.error('purchaseVip error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}