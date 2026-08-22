// =============================================================================
// Execution Gateway
// Punto unico de paso entre el Bot Engine (Base44) y la ejecucion de ordenes.
//
// Responsabilidad:
//   Recibir un Order Intent del Bot Engine y devolver un resultado canonico.
//   NO firma HMAC. NO conoce detalles de Binance. NO decide la senal.
//
// Modos:
//   EXEC_DRY_RUN=true  (default) -> simula la ejecucion sin llamar al exchange.
//   EXEC_DRY_RUN=false           -> POST al Execution Service externo.
//
// Contrato de respuesta (canonico, igual en ambos modos):
//   { accepted, client_order_id, exchange_order_id, status,
//     executed_quantity, executed_price, cumulative_quote_qty, fee, error, mode }
//
// Tipos de error clasificados (campo `error` prefija el tipo):
//   rejected | network | auth | rate_limit | internal | config
//
// Seguridad:
//   EXEC_SERVICE_TOKEN es un Secret de Base44. NUNCA se incluye en el body,
//   en los logs, ni en el campo `error` devuelto al Bot Engine.
// =============================================================================

function isDryRun() {
  return String(process.env.EXEC_DRY_RUN || "true").toLowerCase() === "true";
}

// Respuesta canonica base. El Bot Engine solo depende de estos campos.
function canonical(intent, overrides = {}) {
  return {
    accepted: false,
    client_order_id: intent?.client_order_id || null,
    exchange_order_id: null,
    status: "error",
    executed_quantity: 0,
    executed_price: null,
    cumulative_quote_qty: 0,
    fee: 0,
    error: null,
    mode: "live",
    ...overrides,
  };
}

// Clasifica un fallo HTTP/fetch a un tipo de error estable.
// El token NUNCA se incluye en el mensaje.
function classifyHttpError(status, body) {
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "internal";
  if (status === 400 || status === 402 || status === 409 || status === 422) return "rejected";
  return "internal";
}

/**
 * Ejecuta un Order Intent.
 * @param {Object} intent  { bot_instance_id, user_id, exchange, symbol, side,
 *   order_type, quantity, quote_order_qty, price, client_order_id, intent }
 * @param {Object} ctx      { lastPrice } precio real de mercado (usado solo en dry run)
 * @returns {Object} respuesta canonica (ver contrato arriba)
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
// el Bot Engine (ctx.lastPrice). No inventa el precio. NO TOCAR.
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
// LIVE — llamada al Execution Service externo.
// Solo se activa cuando EXEC_DRY_RUN=false. Mientras DRY_RUN=true esta funcion
// nunca se invoca (executeOrder enruta a dryRunExecute).
// -----------------------------------------------------------------------------
async function liveExecute(intent, ctx) {
  const baseUrl = (process.env.EXEC_SERVICE_URL || "").replace(/\/+$/, "");
  const token = process.env.EXEC_SERVICE_TOKEN;

  if (!baseUrl || !token) {
    return canonical(intent, {
      status: "error",
      error: "config: EXEC_SERVICE_URL/EXEC_SERVICE_TOKEN no configurados",
    });
  }

  let res;
  try {
    res = await fetch(`${baseUrl}/v1/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Request-Id": intent.client_order_id,
      },
      body: JSON.stringify(intent),
      signal: AbortSignal.timeout(15000),
    });
  } catch (e) {
    // Fallo de red / DNS / timeout. No incluir el token ni la URL completa.
    const kind = e?.name === "TimeoutError" ? "network" : "network";
    return canonical(intent, {
      status: "error",
      error: `${kind}: ${e?.message || "no se pudo conectar al Execution Service"}`,
    });
  }

  // Parsear body de forma segura
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }

  // --- Error HTTP ---
  if (!res.ok) {
    const kind = classifyHttpError(res.status, data);
    // El mensaje del servicio puede traer detalle; se sanea (sin token).
    const detail = typeof data?.error === "string" ? data.error : (typeof data?.message === "string" ? data.message : `HTTP ${res.status}`);
    return canonical(intent, {
      status: kind === "rejected" ? "rejected" : "error",
      error: `${kind}: ${detail}`,
    });
  }

  // --- Respuesta exitosa / aceptada ---
  // Normalizar al contrato canonico respetando lo que devuelva el servicio.
  const accepted = data.accepted === true;
  const status = String(data.status || (accepted ? "filled" : "rejected")).toLowerCase();

  return canonical(intent, {
    accepted,
    exchange_order_id: data.exchange_order_id != null ? String(data.exchange_order_id) : null,
    status,
    executed_quantity: Number(data.executed_quantity) || 0,
    executed_price: data.executed_price != null ? Number(data.executed_price) : null,
    cumulative_quote_qty: Number(data.cumulative_quote_qty) || 0,
    fee: Number(data.fee) || 0,
    error: data.error ? String(data.error) : null,
  });
}

// -----------------------------------------------------------------------------
// HEALTH CHECK (opcional)
// GET ${EXEC_SERVICE_URL}/v1/health
//
// NO se llama mientras EXEC_DRY_RUN=true (devuelve un sentinel sin tocar la red).
// Pensado para invocacion manual/admin cuando se active la Fase 3 real.
// -----------------------------------------------------------------------------
export async function healthCheck() {
  if (isDryRun()) {
    return { ok: false, mode: "dry_run", reason: "EXEC_DRY_RUN=true — health check desactivado" };
  }
  const baseUrl = (process.env.EXEC_SERVICE_URL || "").replace(/\/+$/, "");
  const token = process.env.EXEC_SERVICE_TOKEN;
  if (!baseUrl || !token) {
    return { ok: false, mode: "live", reason: "config: EXEC_SERVICE_URL/EXEC_SERVICE_TOKEN no configurados" };
  }
  try {
    const res = await fetch(`${baseUrl}/v1/health`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    let data = {};
    try { data = await res.json(); } catch (e) { data = {}; }
    return { ok: res.ok, mode: "live", status: res.status, data };
  } catch (e) {
    return { ok: false, mode: "live", reason: `network: ${e?.message || "no se pudo conectar"}` };
  }
}