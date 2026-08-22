// =============================================================================
// Cliente Binance SPOT TESTNET (https://testnet.binance.vision).
// Todas las peticiones firmadas (HMAC SHA256) se hacen server-side.
// El frontend nunca toca las API keys directamente con Binance.
// =============================================================================

const TESTNET_BASE = "https://testnet.binance.vision";

async function hmacSha256Hex(secret, payload) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signedRequest({ apiKey, apiSecret, method, path, params = {} }) {
  const ts = Date.now();
  const allParams = { ...params, timestamp: ts, recvWindow: 5000 };
  const query = new URLSearchParams(allParams).toString();
  const signature = await hmacSha256Hex(apiSecret, query);
  const url = `${TESTNET_BASE}${path}?${query}&signature=${signature}`;
  const res = await fetch(url, { method, headers: { "X-MBX-APIKEY": apiKey } });
  let data;
  try { data = await res.json(); } catch { data = null; }
  return { ok: res.ok, status: res.status, data };
}

export function toBinanceSymbol(asset) {
  return String(asset || "BTC/USDT").toUpperCase().replace(/[\/\s_-]/g, "");
}

export async function getAccount({ apiKey, apiSecret }) {
  return signedRequest({ apiKey, apiSecret, method: "GET", path: "/api/v3/account" });
}

export async function placeOrder({ apiKey, apiSecret, symbol, side, type = "MARKET", quantity, quoteOrderQty, price, newClientOrderId }) {
  const params = { symbol, side, type };
  if (quantity != null) params.quantity = quantity;
  if (quoteOrderQty != null) params.quoteOrderQty = quoteOrderQty;
  if (price != null) params.price = price;
  if (newClientOrderId != null) params.newClientOrderId = newClientOrderId;
  if (type === "LIMIT") params.timeInForce = "GTC";
  return signedRequest({ apiKey, apiSecret, method: "POST", path: "/api/v3/order", params });
}

export async function getOrder({ apiKey, apiSecret, symbol, orderId }) {
  return signedRequest({ apiKey, apiSecret, method: "GET", path: "/api/v3/order", params: { symbol, orderId } });
}

export async function cancelOrder({ apiKey, apiSecret, symbol, orderId }) {
  return signedRequest({ apiKey, apiSecret, method: "DELETE", path: "/api/v3/order", params: { symbol, orderId } });
}