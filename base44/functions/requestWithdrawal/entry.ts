import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// =============================================================================
// Solicitud de retiro de USDT (back-office).
// Minimo 25 USDT. Redes: TRC20 o BEP20. Guarda la billetera del afiliado.
// Debita el saldo y crea un registro Withdrawal (estado: pending).
// Los retiros pueden tardar hasta 48 horas habiles.
// =============================================================================

const MIN_WITHDRAWAL = 25;
const NETWORKS = ['TRC20', 'BEP20'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount);
    const network = (body?.network || '').toString().toUpperCase();
    const walletAddress = (body?.walletAddress || '').toString().trim();

    if (!amount || amount < MIN_WITHDRAWAL) {
      return Response.json({
        error: `El monto mínimo de retiro es ${MIN_WITHDRAWAL} USDT.`,
        min: MIN_WITHDRAWAL,
      }, { status: 400 });
    }
    if (!NETWORKS.includes(network)) {
      return Response.json({ error: 'Red inválida. Usa TRC20 o BEP20.' }, { status: 400 });
    }
    if (!walletAddress || walletAddress.length < 8) {
      return Response.json({ error: 'Ingresa una dirección de billetera válida.' }, { status: 400 });
    }

    const balance = Number(user.wallet_balance || 0);
    if (balance < amount) {
      return Response.json({
        error: `Saldo insuficiente. Disponible: ${balance.toFixed(2)} USDT.`,
        balance,
      }, { status: 402 });
    }

    // Debitar saldo y guardar la billetera del afiliado.
    const newBalance = Number((balance - amount).toFixed(2));
    await base44.asServiceRole.entities.User.update(user.id, {
      wallet_balance: newBalance,
      withdrawal_wallet_address: walletAddress,
      withdrawal_network: network,
    });

    // Crear registro de retiro para el back-office.
    await base44.asServiceRole.entities.Withdrawal.create({
      amount,
      network,
      wallet_address: walletAddress,
      status: 'pending',
    });

    return Response.json({
      success: true,
      amount,
      network,
      balance: newBalance,
      message: 'Solicitud de retiro creada. Los retiros pueden tardar hasta 48 horas hábiles en procesarse.',
    });
  } catch (error) {
    console.error('requestWithdrawal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}