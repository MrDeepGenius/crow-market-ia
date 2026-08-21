// =============================================================================
// Configuración guardada del sistema de IA de NexTrade AI.
// Guardar esta configuración como referencia única para todo el ecosistema.
// =============================================================================

export const AI_CONFIG = {
  // Modelo de IA: Claude (Anthropic) vía integración InvokeLLM de Base44.
  provider: "Anthropic",
  model: "claude_sonnet_4_6",
  modelLabel: "Claude Sonnet 4.6",

  // Regalo de bienvenida: 30 mensajes gratis al registrarse (por panel).
  freeCreditsOnRegister: 30,

  // 1 crédito = 1 mensaje de IA.
  creditsPerMessage: 1,

  // Paquetes de recarga disponibles.
  refillPackages: [
    {
      id: "starter",
      priceUsd: 5,
      credits: 1000,
      label: "Pack Starter",
      description: "1.000 mensajes de IA",
    },
  ],

  // Presupuesto de referencia para el consumo de API de IA.
  apiBudgetUsd: 30000,
};

// Helper para formatear créditos en la UI.
export function formatCredits(n) {
  const num = Number(n || 0);
  return num >= 1000 ? `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k` : String(num);
}