import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendTemplate } from '../../shared/resendEmail.js';

// =============================================================================
// Envia el correo de bienvenida a un usuario recien registrado.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = typeof req.json === 'function' ? await req.json() : (req.body || {});
    const email = body.email || user.email;
    const name = body.name || user.full_name || (user.first_name ? `${user.first_name}` : '') || email;
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) {
      return Response.json({ error: 'Email invalido.' }, { status: 400 });
    }

    try {
      await sendTemplate(String(email), 'welcome', { name });
      return Response.json({ success: true, emailed: true });
    } catch (mailErr) {
      console.error('sendWelcomeEmail envio fallido:', mailErr);
      return Response.json({ success: true, emailed: false, note: 'No se pudo enviar el correo aun.' });
    }
  } catch (error) {
    console.error('sendWelcomeEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}