// =============================================================================
// Execution Gateway
// Punto unico de paso entre el Bot Engine (Base44) y la ejecucion de ordenes.
//
// Responsabilidad:
//   Recibir un Order Intent del Bot Engine y devolver un resultado de ejecucion.
//   NO firma HMAC. NO conoce detalles de Binance. NO decide la señal.
//
// Modos:
//   EXEC_DRY_RUN=true  (default) -> simula la ejecucion sin llamar al exchange.
//   EXEC_DRY_RUN=false           -> llama al Execution Service externo (futuro).
//
// El codigo de simulacion (dryRunExecute) esta perfectamente separado del
// codigo en vivo (liveExecute) para que el cambio a ejecucion real sea solo
// cambiar el flag, sin tocar el Bot Engine.
// =============================================================================

function isDryRun() {
  return String(process.env.EXEC_DRY_RUN || "true").toLowerCase() === "true";
}

/**
 * Ejecuta un Order Intent.
 * @param {Object} intent  { bot_instance_id, user_id, exchange, symbol, side,
 *   order_type, quantity, quote_order_qty, price, client_order_id, intent }
 * @param {Object} ctx      { lastPrice } precio real de mercado para la simulacion
 * @returns {Object} { accepted, client_order_id, exchange_order_id, status,
 *   executed_quantity, executed_price, cumulative_quote_qty, fee, error, mode }
 */
export async function executeOrder(intent, ctx = {}) {
  if (isDryRun()) {
    return dryRunExecute(intent, ctx);
  }
  return liveExecute(intent, ctx);
}

// -----------------------------------------------------------------------------
// DRY RUN — simulacion pura, sin exchange, sin red.
// Genera una respuesta "filled" usando un precio real de mercado provisto por
// el Bot Engine (ctx.lastPrice). No inventa el precio.
// -----------------------------------------------------------------------------
function dryRunExecute(intent, ctx) {
  const price = Number(ctx.lastPrice) || 0;
  const exchangeOrderId = "DRY-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  let executedQuantity = 0;
  let cumulativeQuoteQty = 0;

  if (intent.side === "BUY") {
    const notional = Number(intent.quote_order_qty) || 0;
    executedQuantity = price > 0 ? notional / price : 0;
    cumulativeQuoteQty = notional;
  } else {
    executedQuantity = Number(intent.quantity) || 0;
    cumulativeQuoteQty = executedQuantity * price;
  }
  const fee = Math.round(cumulativeQuoteQty * 0.001 * 1e8) / 1e8; // 0.1% simulado

  return {
    accepted: true,
    client_order_id: intent.client_order_id,
    exchange_order_id: exchangeOrderId,
    status: "filled",
    executed_quantity: executedQuantity,
    executed_price: price,
    cumulative_quote_qty: cumulativeQuoteQty,
    fee,
    error: null,
    mode: "dry_run",
  };
}

// -----------------------------------------------------------------------------
// LIVE — llamada al Execution Service externo (NO usado en Fase 2).
// Queda aqui, separado, para que el Bot Engine nunca cambie cuando se active.
// -----------------------------------------------------------------------------
async function liveExecute(intent, ctx) {
  const baseUrl = process.env.EXEC_SERVICE_URL;
  const token = process.env.EXEC_SERVICE_TOKEN;
  if (!baseUrl || !token) {
    return {
      accepted: false,
      client_order_id: intent.client_order_id,
      exchange_order_id: null,
      status: "error",
      executed_quantity: 0,
      executed_price: null,
      cumulative_quote_qty: 0,
      fee: 0,
      error: "EXEC_SERVICE_URL/EXEC_SERVICE_TOKEN no configurados",
      mode: "live",
    };
  }
  const res = await fetch(`${baseUrl}/v1/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Request-Id": intent.client_order_id,
    },
    body: JSON.stringify(intent),
  });
  const data = await res.json().catch(() => ({}));
  return { ...data, mode: "live" };
}