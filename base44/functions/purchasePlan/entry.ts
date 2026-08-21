import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// =============================================================================
// Comprar / renovar plan de creador pagando con USDT desde la billetera.
// Debita el precio del plan y activa la licencia + creditos de IA.
// =============================================================================

const PLANS = {
  bronce: { priceUsd: 30, periodDays: 30, aiCredits: 30 },
  plata: { priceUsd: 75, periodDays: 90, aiCredits: 100 },
  oro: { priceUsd: 150, periodDays: 90, aiCredits: 250 },
  diamante: { priceUsd: 300, periodDays: 180, aiCredits: 500 },
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const plan = PLANS[body?.tier];
    if (!plan) return Response.json({ error: 'Plan inválido.' }, { status: 400 });

    const balance = Number(user.wallet_balance || 0);
    if (balance < plan.priceUsd) {
      return Response.json({
        error: `Saldo insuficiente. Necesitas ${plan.priceUsd} USDT, tienes ${balance.toFixed(2)} USDT.`,
        balance,
        required: plan.priceUsd,
      }, { status: 402 });
    }

    const expiresAt = new Date(Date.now() + plan.periodDays * 86400000).toISOString();

    // Debita USDT, suma creditos IA y activa el plan.
    const newBalance = Number((balance - plan.priceUsd).toFixed(2));
    const newAiCredits = Number(user.ai_credits || 0) + plan.aiCredits;
    await base44.asServiceRole.entities.User.update(user.id, {
      wallet_balance: newBalance,
      ai_credits: newAiCredits,
      plan_tier: body.tier,
      plan_expires_at: expiresAt,
      auto_renew: !!body.auto_renew,
    });

    return Response.json({
      success: true,
      plan: body.tier,
      expiresAt,
      balance: newBalance,
      aiCredits: newAiCredits,
    });
  } catch (error) {
    console.error('purchasePlan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}