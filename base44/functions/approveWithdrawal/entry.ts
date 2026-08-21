import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendTemplate } from '../../shared/resendEmail.js';

// =============================================================================
// Aprueba un retiro (solo admin): marca el retiro como completado y envia
// el correo "Retiro aprobado" al afiliado propietario.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Solo administradores.' }, { status: 403 });

    const body = typeof req.json === 'function' ? await req.json() : (req.body || {});
    const { withdrawalId } = body;
    if (!withdrawalId) return Response.json({ error: 'Falta withdrawalId.' }, { status: 400 });

    const withdrawal = await base44.entities.Withdrawal.get(withdrawalId);
    if (!withdrawal) return Response.json({ error: 'Retiro no encontrado.' }, { status: 404 });

    await base44.entities.Withdrawal.update(withdrawalId, { status: 'completed' });

    let ownerEmail = null;
    let ownerName = null;
    try {
      const owner = await base44.asServiceRole.entities.User.get(withdrawal.created_by_id);
      ownerEmail = owner?.email;
      ownerName = owner?.full_name || (owner?.first_name ? `${owner.first_name}` : '');
    } catch (e) {
      console.error('No se pudo obtener el owner del retiro:', e);
    }

    if (ownerEmail) {
      try {
        await sendTemplate(ownerEmail, 'withdrawalApproved', {
          name: ownerName || ownerEmail,
          amount: Number(withdrawal.amount).toFixed(2),
          wallet: withdrawal.wallet_address,
        });
      } catch (mailErr) {
        console.error('withdrawalApproved envio fallido:', mailErr);
      }
    }

    return Response.json({ success: true, emailed: !!ownerEmail });
  } catch (error) {
    console.error('approveWithdrawal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}