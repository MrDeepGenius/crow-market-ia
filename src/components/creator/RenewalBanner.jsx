import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { isPlanActive, daysUntilExpiry, getPlan } from "@/lib/plans";
import { AlertTriangle, Crown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RenewalBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!isPlanActive(user)) return null;
  const days = daysUntilExpiry(user);
  if (days === null || days > 3 || days < 0 || dismissed) return null;

  const plan = getPlan(user.plan_tier);

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
            Renueva manualmente o activa la renovación automática para no perder acceso.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="bg-transparent border-border">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Auto-renovar
        </Button>
        <Button size="sm">
          <Crown className="w-3.5 h-3.5 mr-1" /> Renovar ahora
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