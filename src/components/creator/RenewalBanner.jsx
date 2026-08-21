import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { isPlanActive, daysUntilExpiry, getPlan } from "@/lib/plans";
import { purchasePlan } from "@/lib/purchase";
import { AlertTriangle, Crown, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function RenewalBanner() {
  const { user, checkUserAuth } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [renewing, setRenewing] = useState(false);

  if (!isPlanActive(user)) return null;
  const days = daysUntilExpiry(user);
  if (days === null || days > 3 || days < 0 || dismissed) return null;

  const plan = getPlan(user.plan_tier);

  const handleRenew = async () => {
    setRenewing(true);
    try {
      await purchasePlan(user.plan_tier, { autoRenew: user.auto_renew });
      toast({
        title: "Plan renovado",
        description: `Se debitaron $${plan?.priceUsd} USDT de tu billetera.`,
      });
      checkUserAuth();
      setDismissed(true);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "No se pudo renovar",
        description: err?.message || "Saldo insuficiente o error.",
      });
    } finally {
      setRenewing(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    try {
      await base44.auth.updateMe({ auto_renew: !user.auto_renew });
      checkUserAuth();
      toast({ title: user.auto_renew ? "Auto-renovación desactivada" : "Auto-renovación activada" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err?.message });
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-yellow-400/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <p className="font-semibold text-sm">
            Tu plan {plan?.name} vence en {days} {days === 1 ? "día" : "días"}
          </p>
          <p className="text-xs text-muted-foreground">
            Renueva con saldo USDT o activa la renovación automática.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="bg-transparent border-border" onClick={handleToggleAutoRenew}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          {user.auto_renew ? "Auto: ON" : "Auto: OFF"}
        </Button>
        <Button size="sm" onClick={handleRenew} disabled={renewing}>
          {renewing ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Crown className="w-3.5 h-3.5 mr-1" />}
          {renewing ? "Renovando..." : "Renovar ahora"}
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-muted-foreground hover:text-foreground px-2"
          aria-label="Cerrar aviso"
        >
          ✕
        </button>
      </div>
    </div>
  );
}