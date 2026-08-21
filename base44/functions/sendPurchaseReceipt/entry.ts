import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendTemplate } from '../../shared/resendEmail.js';

// =============================================================================
// Registra el email del comprador en la orden y envia por Resend:
//   - Compra confirmada
//   - Recibo de compra
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

    const buyerName = user.full_name || String(email);
    const dateStr = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
    const vars = {
      buyerName,
      name: buyerName,
      productName: order.product_name,
      product: order.product_name,
      price: Number(order.total).toFixed(2),
      orderId: order.id,
      date: dateStr,
    };

    const results = { emailed: true, sent: [] };
    try {
      await sendTemplate(String(email), 'purchaseConfirmed', vars);
      results.sent.push('purchaseConfirmed');
    } catch (e) { results.emailed = false; results.errorConfirmed = e.message; }
    try {
      await sendTemplate(String(email), 'receipt', vars);
      results.sent.push('receipt');
    } catch (e) { results.emailed = results.emailed && false; results.errorReceipt = e.message; }

    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('sendPurchaseReceipt error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}