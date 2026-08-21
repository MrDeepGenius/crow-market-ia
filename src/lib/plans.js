// =============================================================================
// Planes de licencia de creador — NexTrade AI.
// El acceso gratuito solo permite explorar. Para crear bots/productos y
// publicar se requiere una licencia activa.
// =============================================================================

export const CREATOR_PLANS = [
  {
    id: "bronce",
    name: "Bronce",
    priceUsd: 30,
    periodLabel: "mes",
    periodDays: 30,
    aiCredits: 30,
    maxBots: 10,
    maxPublications: 10,
    vipSupport: false,
    highlight: false,
    tagline: "Para empezar a crear",
  },
  {
    id: "plata",
    name: "Plata",
    priceUsd: 50,
    periodLabel: "trimestre",
    periodDays: 90,
    aiCredits: 60,
    maxBots: 30,
    maxPublications: 5,
    vipSupport: false,
    highlight: true,
    tagline: "El más popular",
  },
  {
    id: "oro",
    name: "Oro",
    priceUsd: 100,
    periodLabel: "trimestre",
    periodDays: 90,
    aiCredits: 100,
    maxBots: 50,
    maxPublications: 10,
    vipSupport: false,
    highlight: false,
    tagline: "Para creadores activos",
  },
  {
    id: "diamante",
    name: "Diamante",
    priceUsd: 200,
    periodLabel: "6 meses",
    periodDays: 180,
    aiCredits: 200,
    maxBots: 100,
    maxPublications: 100,
    vipSupport: true,
    highlight: false,
    tagline: "Acceso VIP completo",
  },
];

// Billetera USDT (TRC20) para recargar saldo y pagar planes.
// Reemplazar esta direccion por tu wallet USDT TRC20 real.
export const USDT_DEPOSIT = {
  network: "TRC20 (Tron)",
  address: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  note: "Envía USDT por red TRC20. El saldo se acredita tras confirmar el depósito (1 confirmación).",
};

export function getPlan(tier) {
  return CREATOR_PLANS.find((p) => p.id === tier) || null;
}

// Un plan está activo si no es free y no ha vencido.
export function isPlanActive(user) {
  if (!user) return false;
  if (!user.plan_tier || user.plan_tier === "free") return false;
  if (!user.plan_expires_at) return false;
  return new Date(user.plan_expires_at).getTime() > Date.now();
}

export function daysUntilExpiry(user) {
  if (!user?.plan_expires_at) return null;
  const ms = new Date(user.plan_expires_at).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}