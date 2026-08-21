import React from "react";
import { Link } from "react-router-dom";
import { Lock, Crown, Check } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { isPlanActive, getPlan, CREATOR_PLANS } from "@/lib/plans";

export default function PlanGate({ children, title = "Necesitas una licencia de creador" }) {
  const { user } = useAuth();
  if (isPlanActive(user)) return children;

  const expired = user?.plan_tier && user.plan_tier !== "free" && !isPlanActive(user);

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-heading font-bold text-xl">{title}</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          {expired
            ? "Tu licencia de creador ha vencido. Renueva para seguir creando bots y productos."
            : "Las cuentas gratuitas no pueden crear bots ni productos. Activa una licencia de creador para desbloquear la creación."}
        </p>
        <Link
          to="/#pricing"
          className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold glow-violet hover:bg-primary/90 transition"
        >
          <Crown className="w-4 h-4" /> Ver planes
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CREATOR_PLANS.map((p) => (
          <div key={p.id} className="glass rounded-2xl p-4">
            <p className="font-semibold">{p.name}</p>
            <p className="text-2xl font-bold mt-1">
              ${p.priceUsd}
              <span className="text-xs font-normal text-muted-foreground">/{p.periodLabel}</span>
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              {p.features.slice(0, 5).map((f) => (
                <li key={f} className="flex gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}