import React from "react";
import { Wallet, TrendingUp, Repeat, Ticket, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

function Panel({ children, className = "" }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

export default function AffiliateKpis({ onRequestWithdraw }) {
  const { user } = useAuth();
  const balance = Number(user?.wallet_balance || 0);

  const kpis = [
    {
      label: "Balance Disponible (USDT)",
      value: `$${balance.toFixed(2)}`,
      sub: balance > 0 ? "Listo para retiro" : "Sin saldo disponible",
      icon: Wallet,
      tone: "primary",
      action: { label: "Solicitar Retiro", icon: ArrowDownToLine, onClick: onRequestWithdraw },
    },
    { label: "Ventas Directas Totales", value: "86", sub: "$4,320 ganados", icon: TrendingUp, tone: "cyan" },
    { label: "Bono Alquiler / Residual", value: "$640", sub: "32 suscripciones activas", icon: Repeat, tone: "violet" },
    { label: "Licencias LC Creador", value: "$980", sub: "14 licencias vendidas", icon: Ticket, tone: "gold" },
  ];

  const toneMap = {
    primary: "from-violet-500/20 to-violet-500/5 text-violet-300",
    cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-300",
    violet: "from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-300",
    gold: "from-amber-500/20 to-amber-500/5 text-amber-300",
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((k) => {
        const Icon = k.icon;
        return (
          <Panel key={k.label} className="relative overflow-hidden">
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${toneMap[k.tone]} blur-xl`} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{k.label}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${toneMap[k.tone]} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-3">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
              {k.action && (
                <Button
                  size="sm"
                  className="mt-3 w-full h-9"
                  onClick={k.action.onClick}
                >
                  <k.action.icon className="w-4 h-4 mr-1.5" /> {k.action.label}
                </Button>
              )}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}