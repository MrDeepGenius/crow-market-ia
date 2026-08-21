import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// =============================================================================
// Crea una orden de pago del Marketplace publico.
// El comprador transfiere el total (precio + comision de servicio) en USDT
// a la billetera de la red seleccionada. La comision la paga el comprador.
// =============================================================================

const WALLETS = {
  BEP20: '0x5c77b34c16bae2ccb21695564c2fe68ec99f771f',
  TRC20: 'TJNDeA6piMwsqoHg6vWW2vWtNV3JSwZp5M',
};

const FEE_RATE = 0.05; // 5% comision de servicio pagada por el comprador

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = typeof req.json === 'function' ? await req.json() : (req.body || {});
    const { productId, productName, mode, amount, network } = body;

    if (!productId || !productName || !mode || amount == null || !network) {
      return Response.json({ error: 'Faltan datos del producto o red.' }, { status: 400 });
    }
    if (!['rent', 'buy'].includes(mode)) {
      return Response.json({ error: 'Modo de pago invalido.' }, { status: 400 });
    }
    if (!['BEP20', 'TRC20'].includes(network)) {
      return Response.json({ error: 'Red invalida. Usa BEP20 o TRC20.' }, { status: 400 });
    }

    const amt = Number(Number(amount).toFixed(2));
    if (!isFinite(amt) || amt <= 0) {
      return Response.json({ error: 'Monto invalido.' }, { status: 400 });
    }

    const fee = Number((amt * FEE_RATE).toFixed(2));
    const total = Number((amt + fee).toFixed(2));

    const order = await base44.entities.PaymentOrder.create({
      product_id: productId,
      product_name: productName,
      mode,
      amount: amt,
      fee,
      total,
      network,
      status: 'pending',
    });

    return Response.json({
      orderId: order.id,
      amount: amt,
      fee,
      total,
      network,
      wallets: WALLETS,
      wallet: WALLETS[network],
    });
  } catch (error) {
    console.error('createPaymentOrder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}