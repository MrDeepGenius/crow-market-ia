import { base44 } from "@/api/base44Client";

// Comprar / renovar un plan de creador pagando con USDT desde la billetera.
export async function purchasePlan(tier, { autoRenew = false } = {}) {
  return base44.functions.invoke("purchasePlan", { tier, auto_renew: autoRenew });
}

// Acreditar USDT a la billetera (solo administradores).
export async function creditWallet(userId, amount) {
  return base44.functions.invoke("creditWallet", { userId, amount });
}