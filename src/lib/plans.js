// =============================================================================
// Planes de licencia de creador — NexTrade AI.
// El acceso gratuito solo permite explorar. Para crear bots/productos y
// publicar se requiere una licencia activa.
// =============================================================================

// Plan gratuito: solo explorar. 30 creditos IA de bienvenida al registrarse.
export const FREE_PLAN = {
  id: "free",
  name: "Gratis",
  priceUsd: 0,
  aiCredits: 30,
  maxBots: 0,
  maxPublications: 0,
  vipSupport: false,
  tagline: "Para explorar la plataforma",
  features: [
    "30 créditos IA de bienvenida",
    "Explorar el Marketplace",
    "Acceso al asistente IA",
    "Sin publicación de bots",
  ],
};

export const CREATOR_PLANS = [
  {
    id: "bronce",
    name: "Creator Start",
    priceUsd: 30,
    periodLabel: "mes",
    periodDays: 30,
    aiCredits: 30,
    maxBots: 25,
    maxPublications: 10,
    vipSupport: false,
    highlight: false,
    tagline: "Para creadores que recién comienzan",
    features: [
      "Hasta 25 bots creados",
      "Hasta 10 bots publicados simultáneamente",
      "30 créditos IA",
      "Backtesting",
      "Paper Trading",
      "Analytics básico",
      "Acceso al Marketplace",
      "Sistema de ventas y alquileres",
      "Acceso a afiliados",
    ],
  },
  {
    id: "plata",
    name: "Creator Pro",
    priceUsd: 75,
    periodLabel: "trimestre",
    periodDays: 90,
    aiCredits: 100,
    maxBots: 75,
    maxPublications: 30,
    vipSupport: false,
    highlight: true,
    tagline: "Para construir un catálogo más grande",
    equivPerMonth: 25,
    features: [
      "Hasta 75 bots creados",
      "Hasta 30 bots publicados simultáneamente",
      "100 créditos IA",
      "Backtesting avanzado",
      "Paper Trading",
      "Analytics",
      "Acceso completo al Marketplace",
      "Ventas y alquileres",
      "Sistema de afiliados",
      "Estadísticas de rendimiento",
    ],
  },
  {
    id: "oro",
    name: "Creator Business",
    priceUsd: 150,
    periodLabel: "trimestre",
    periodDays: 90,
    aiCredits: 250,
    maxBots: 200,
    maxPublications: 75,
    vipSupport: false,
    highlight: false,
    tagline: "Para creadores profesionales",
    equivPerMonth: 50,
    features: [
      "Hasta 200 bots creados",
      "Hasta 75 bots publicados simultáneamente",
      "250 créditos IA",
      "Backtesting avanzado",
      "Paper Trading",
      "Analytics avanzado",
      "Publicación prioritaria",
      "Mayor exposición en Marketplace",
      "Ventas y alquileres",
      "Sistema de afiliados",
      "Estadísticas avanzadas",
      "Perfil de creador profesional",
    ],
  },
  {
    id: "diamante",
    name: "Creator Elite",
    priceUsd: 300,
    periodLabel: "6 meses",
    periodDays: 180,
    aiCredits: 500,
    maxBots: 500,
    maxPublications: 150,
    vipSupport: true,
    highlight: false,
    tagline: "Para grandes creadores y estudios de bots",
    equivPerMonth: 50,
    features: [
      "Hasta 500 bots creados",
      "Hasta 150 bots publicados simultáneamente",
      "500 créditos IA",
      "Backtesting avanzado",
      "Paper Trading",
      "Analytics avanzado",
      "Publicación prioritaria",
      "Mayor visibilidad en Marketplace",
      "Soporte VIP prioritario",
      "Badge Creator Elite",
      "Mayor exposición del perfil",
      "Ventas y alquileres",
      "Sistema completo de afiliados",
      "Estadísticas avanzadas",
    ],
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