// Datos del Marketplace Publico (enfocado al comprador final).
// Sin metricas de afiliados. `featured` lo controla el admin mas adelante.

const botCurve = (seed, trend = 1) => {
  const pts = [];
  let v = 100;
  for (let i = 0; i < 24; i++) {
    const noise = (Math.sin(seed + i * 1.7) + Math.cos(seed * 0.6 + i)) * 6;
    v += trend * (2 + (i % 3)) + noise;
    pts.push(Math.max(40, +v.toFixed(1)));
  }
  return pts;
};

export const SAMPLE_PRODUCTS = [
  {
    id: "apex-btc-pro",
    name: "Apex BTC Pro",
    creator: "TradingLab",
    type: "bot",
    category: "Bots de Trading IA",
    rating: 4.8,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1518546305927-5aeee5bedcfa?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1518546305927-5aeee5bedcfa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1621761191319-c43e0db7d4f2?auto=format&fit=crop&w=900&q=80",
    ],
    tag: "Validado",
    verified: true,
    featured: true,
    description: "Bot de momentum para BTC con gestion de riesgo adaptativa y trailing stop. Opera en futuros de alta liquidez con filtros de tendencia IA.",
    winRate: 78,
    timeframe: "15m · BTC/USDT",
    risk: "Medio",
    pnl: 142,
    curve: botCurve(1, 1.4),
    buyPrice: 299,
    rentPrice: 25,
    includes: ["Estrategia preconfigurada", "Gestion de riesgo automatica", "Panel de monitoreo en vivo", "Soporte 24/7"],
    requirements: ["Exchange Binance/Bybit", "API Key con permisos de trading", "Capital min. sugerido: $500"],
    testimonials: [
      { name: "Martin R.", text: "Llevo 3 meses usandolo y la curva es estable. Win rate real.", stars: 5 },
      { name: "Lucia P.", text: "El trailing stop salva las ganancias en cada operacion.", stars: 5 },
    ],
  },
  {
    id: "neural-scalper",
    name: "Neural Scalper",
    creator: "QuantEdge",
    type: "bot",
    category: "Bots de Trading IA",
    rating: 4.6,
    reviews: 188,
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1642790100177-6b2c6b1c2f0a?auto=format&fit=crop&w=900&q=80",
    ],
    tag: "Validado",
    verified: true,
    featured: true,
    description: "Scalping de alta frecuencia en futuros con filtros de volatilidad IA. Optimizado para sesiones de maxima liquidez.",
    winRate: 71,
    timeframe: "1m · ETH/USDT",
    risk: "Alto",
    pnl: 98,
    curve: botCurve(2, 1.1),
    buyPrice: 450,
    rentPrice: 39,
    includes: ["Filtros de volatilidad IA", "Ejecucion sub-segundo", "Backtesting auditado", "Alertas Telegram"],
    requirements: ["Exchange con futuros", "API Key trading", "Capital min. sugerido: $1000"],
    testimonials: [
      { name: "Diego M.", text: "Scalping agresivo pero rentable si respetas el riesgo.", stars: 4 },
      { name: "Caro V.", text: "Resultados auditados reales, no humo.", stars: 5 },
    ],
  },
  {
    id: "grid-master",
    name: "Grid Master",
    creator: "QuantEdge",
    type: "bot",
    category: "Bots de Trading IA",
    rating: 4.5,
    reviews: 143,
    image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=900&q=80",
    ],
    tag: "Validado",
    verified: true,
    featured: false,
    description: "Grid trading parametrico con rejillas dinamicas y reinversion automatica. Ideal para mercados laterales.",
    winRate: 64,
    timeframe: "5m · Multi-pair",
    risk: "Bajo",
    pnl: 76,
    curve: botCurve(3, 0.8),
    buyPrice: 220,
    rentPrice: 35,
    includes: ["Rejillas dinamicas", "Reinversion automatica", "Multi-par", "Dashboard en vivo"],
    requirements: ["Exchange spot/futuros", "API Key", "Capital min. sugerido: $300"],
    testimonials: [
      { name: "Nico T.", text: "Perfecto para mercado lateral. Rentabilidad constante.", stars: 4 },
    ],
  },
  {
    id: "funnel-ai-pack",
    name: "Funnel AI Pack",
    creator: "CreatorHub",
    type: "info",
    category: "Funnels & Plantillas",
    rating: 4.9,
    reviews: 521,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    ],
    tag: "Bestseller",
    verified: true,
    featured: true,
    description: "Plantillas de funnel, copys con IA y secuencias de email listas para usar. Todo editable y exportable.",
    price: 49,
    period: "pago unico",
    includes: ["12 plantillas de funnel", "50+ copys con IA", "Secuencias de email", "Guia de conversion"],
    requirements: ["Navegador moderno", "Cuenta de email marketing"],
    testimonials: [
      { name: "Sofia L.", text: "Monte mi funnel en una tarde. Converti el primer dia.", stars: 5 },
      { name: "Raul G.", text: "Los copys con IA son oro puro.", stars: 5 },
    ],
  },
  {
    id: "trading-mastery",
    name: "Trading Mastery Curso",
    creator: "TradingLab",
    type: "info",
    category: "Infoproductos & Cursos",
    rating: 4.7,
    reviews: 233,
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a74229?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590283603385-17ffb3a74229?auto=format&fit=crop&w=900&q=80",
    ],
    tag: "Curso",
    verified: true,
    featured: false,
    description: "Curso completo de trading con IA: analisis, gestion de riesgo y automatizacion. Desde cero a pro.",
    price: 89,
    period: "pago unico",
    includes: ["40+ horas de video", "Plantillas de riesgo", "Comunidad privada", "Certificado"],
    requirements: ["Sin requisitos previos"],
    testimonials: [
      { name: "Ana R.", text: "El mejor curso que hice. Claro y accionable.", stars: 5 },
    ],
  },
  {
    id: "copywriter-ai",
    name: "Copywriter AI Studio",
    creator: "CreatorHub",
    type: "tool",
    category: "Herramientas IA",
    rating: 4.8,
    reviews: 402,
    image: "https://images.unsplash.com/photo-1655720828083-ed8a4afcc905?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1655720828083-ed8a4afcc905?auto=format&fit=crop&w=900&q=80",
    ],
    tag: "IA",
    verified: true,
    featured: true,
    description: "Genera copys de venta, anuncios y landings con IA entrenada en conversion. Edicion en tiempo real.",
    price: 29,
    period: "mes",
    includes: ["Generador de copys", "Editor en vivo", "Exportacion multi-formato", "Soporte prioritario"],
    requirements: ["Navegador moderno"],
    testimonials: [
      { name: "Eze Q.", text: "Reemplazo a mi copywriter. Vale cada peso.", stars: 5 },
    ],
  },
  {
    id: "risk-guardian",
    name: "Risk Guardian",
    creator: "TradingLab",
    type: "tool",
    category: "Herramientas IA",
    rating: 4.7,
    reviews: 96,
    image: "https://images.unsplash.com/photo-1611974789855-9ab2d4c2f5e5?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1611974789855-9ab2d4c2f5e5?auto=format&fit=crop&w=900&q=80",
    ],
    tag: "Nuevo",
    verified: true,
    featured: false,
    description: "Panel de control de riesgo multi-exchange con alertas en tiempo real. Protege tu capital 24/7.",
    price: 19,
    period: "mes",
    includes: ["Multi-exchange", "Alertas en tiempo real", "Dashboard de exposicion", "Stop global"],
    requirements: ["API Keys de exchanges"],
    testimonials: [
      { name: "Pau S.", text: "Me salvo de liquidaciones. Imprescindible.", stars: 5 },
    ],
  },
  {
    id: "funnel-templates-pro",
    name: "Funnel Templates Pro",
    creator: "CreatorHub",
    type: "info",
    category: "Funnels & Plantillas",
    rating: 4.6,
    reviews: 174,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    ],
    tag: "Plantillas",
    verified: true,
    featured: false,
    description: "Pack de 30 plantillas de funnel premium para ventas, webinars y lanzamientos. 100% editables.",
    price: 35,
    period: "pago unico",
    includes: ["30 plantillas", "Variantes A/B", "Guia de implementacion"],
    requirements: ["Editor compatible"],
    testimonials: [
      { name: "Juli M.", text: "Plantillas limpias y que convierten.", stars: 4 },
    ],
  },
];

export const MARKET_CATEGORIES = ["Todos", "Bots de Trading IA", "Infoproductos & Cursos", "Funnels & Plantillas", "Herramientas IA"];

export const DEFAULT_PRODUCT_IMAGE = "https://images.unsplash.com/photo-1639779451976-8a1c7a7ec3b0?auto=format&fit=crop&w=800&q=80";

// Convierte un registro de la entidad Product al shape que usan las tarjetas/modal del marketplace.
export function normalizeEntityProduct(p) {
  const curve = botCurve(Math.floor(Math.random() * 100) + 10, 0.9);
  const base = {
    id: p.id,
    name: p.name,
    creator: p.creator || "Crow Market",
    type: p.type,
    category: p.category,
    description: p.description || "",
    image: p.image || DEFAULT_PRODUCT_IMAGE,
    gallery: p.image ? [p.image] : [],
    tag: p.tag || "Nuevo",
    verified: !!p.verified,
    featured: !!p.featured,
    rating: 0,
    reviews: 0,
    includes: p.includes || [],
    requirements: p.requirements || [],
    testimonials: [],
    _isUserProduct: true,
  };
  if (p.type === "bot") {
    return {
      ...base,
      winRate: Number(p.winRate) || 0,
      timeframe: p.timeframe || "—",
      risk: p.risk || "Medio",
      pnl: Number(p.pnl) || 0,
      curve,
      buyPrice: Number(p.buyPrice) || 0,
      rentPrice: Number(p.rentPrice) || 0,
    };
  }
  return {
    ...base,
    price: Number(p.price) || 0,
    period: p.period || "pago unico",
  };
}