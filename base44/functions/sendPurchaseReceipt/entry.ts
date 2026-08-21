import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// =============================================================================
// Registra el email del comprador en la orden y envia el recibo de compra.
// =============================================================================

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = typeof req.json === 'function' ? await req.json() : (req.body || {});
    const { orderId, email } = body;
    if (!orderId || !email) {
      return Response.json({ error: 'Faltan datos.' }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) {
      return Response.json({ error: 'Email invalido.' }, { status: 400 });
    }

    const order = await base44.entities.PaymentOrder.get(orderId);
    if (!order) {
      return Response.json({ error: 'Orden no encontrada.' }, { status: 404 });
    }

    await base44.entities.PaymentOrder.update(orderId, { receipt_email: String(email) });

    const total = Number(order.total).toFixed(2);
    const amount = Number(order.amount).toFixed(2);
    const modeLabel = order.mode === 'rent' ? 'Alquiler mensual' : 'Compra unica';

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;background:#0b0b12;color:#e9e9f5;padding:28px;border-radius:16px;border:1px solid #2a1a4a">
        <h2 style="color:#a855f7;margin:0 0 4px">Recibo de compra · Crow Market</h2>
        <p style="color:#9a9ab5;font-size:13px;margin:0 0 18px">Orden #${order.id.slice(0, 8)}</p>
        <table style="width:100%;font-size:14px;border-collapse:collapse">
          <tr><td style="color:#9a9ab5;padding:6px 0">Producto</td><td style="text-align:right;font-weight:600">${order.product_name}</td></tr>
          <tr><td style="color:#9a9ab5;padding:6px 0">Modalidad</td><td style="text-align:right">${modeLabel}</td></tr>
          <tr><td style="color:#9a9ab5;padding:6px 0">Red</td><td style="text-align:right">${order.network} (USDT)</td></tr>
          <tr><td style="color:#9a9ab5;padding:6px 0">Monto</td><td style="text-align:right">$${amount} USDT</td></tr>
          <tr><td style="color:#9a9ab5;padding:6px 0">Total transferido</td><td style="text-align:right;font-weight:700;color:#a855f7">$${total} USDT</td></tr>
        </table>
        <p style="font-size:12px;color:#7a7a95;margin-top:18px">Tu pago esta en verificacion. Te notificaremos al confirmarse la acreditacion en la red ${order.network}.</p>
        <p style="font-size:11px;color:#5a5a78;margin-top:24px">Crow Market IA · Este recibo es automatico.</p>
      </div>
    `;

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: String(email),
        subject: 'Recibo de compra · Crow Market',
        body: html,
      });
    } catch (mailErr) {
      console.error('SendEmail falló (email guardado de todos modos):', mailErr);
      return Response.json({ success: true, emailed: false, note: 'Email guardado. El envio del recibo quedara pendiente.' });
    }

    return Response.json({ success: true, emailed: true });
  } catch (error) {
    console.error('sendPurchaseReceipt error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}