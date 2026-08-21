import React from "react";
import { Crown, Lock, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

function Panel({ children, className = "" }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

// Licencias Creador que el afiliado puede revender.
// Regla: el afiliado sólo revende licencias de nivel igual o inferior al desbloqueado.
const LC_LICENSES = [
  { id: "bronce", name: "Bronce", price: 30, unlock: 15, color: "from-amber-700/30 to-amber-600/10 text-amber-300" },
  { id: "plata", name: "Plata", price: 50, unlock: 25, color: "from-slate-300/30 to-slate-400/10 text-slate-200" },
  { id: "oro", name: "Oro", price: 100, unlock: 50, color: "from-yellow-400/30 to-yellow-500/10 text-yellow-300" },
  { id: "diamante", name: "Diamante", price: 200, unlock: 100, color: "from-cyan-400/30 to-fuchsia-500/10 text-cyan-200" },
];

// Nivel máximo desbloqueado por el afiliado (mock — vendrá del user).
const UNLOCKED_LEVEL = "oro"; // desbloquea bronce, plata y oro
const HAS_VIP = false;

const LEVEL_ORDER = ["bronce", "plata", "oro", "diamante"];

function isAuthorized(licenseId) {
  if (HAS_VIP) return true;
  const idx = LEVEL_ORDER.indexOf(licenseId);
  const unlockedIdx = LEVEL_ORDER.indexOf(UNLOCKED_LEVEL);
  return idx <= unlockedIdx;
}

export default function CrowLicenseModule() {
  const copyInvite = (name) => {
    navigator.clipboard?.writeText(`https://crowmarket.ai/invite/creator/AFF8421X/${name.toLowerCase()}`);
    toast({ title: "Link copiado", description: `Link de invitación a creador (${name}) copiado.` });
  };

  return (
    <div className="space-y-4">
      {/* Banner explicativo */}
      <Panel className="relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[radial-gradient(circle,hsl(43_90%_55%_/_0.18),transparent_60%)] blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-fuchsia-500/20 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6 text-amber-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Módulo Licencia Crow — Bono LC & Invita Creadores</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Reventa Licencias Creador y gana comisiones por cada creador que invites. Regla de reventa: sólo puedes
              vender licencias de nivel <strong className="text-foreground">igual o inferior</strong> al que tienes desbloqueado.
              <br />
              <span className="text-xs">Bronce $30 · Plata $50 · Oro $100 · Diamante $200</span>
            </p>
          </div>
        </div>
      </Panel>

      {/* Pase VIP */}
      <Panel className={`border-2 ${HAS_VIP ? "border-amber-400/50 bg-amber-400/5" : "border-dashed border-primary/40"}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Pase VIP Total — $115 USD</p>
              <p className="text-xs text-muted-foreground">
                {HAS_VIP ? "Activo: desbloqueaste el 100% de las comisiones." : "Desbloquea el 100% de las comisiones para revender todas las licencias sin restricción."}
              </p>
            </div>
          </div>
          <Button className={HAS_VIP ? "bg-amber-400 text-black hover:bg-amber-300" : ""}>
            {HAS_VIP ? (
              <>
                <Check className="w-4 h-4 mr-1.5" /> VIP Activo
              </>
            ) : (
              "Desbloquear Pase VIP ($115)"
            )}
          </Button>
        </div>
      </Panel>

      {/* Grilla de desbloqueo progresivo */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LC_LICENSES.map((lic) => {
          const authorized = isAuthorized(lic.id);
          const isCurrent = UNLOCKED_LEVEL === lic.id;
          return (
            <Panel key={lic.id} className={`relative ${authorized ? "" : "opacity-80"}`}>
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${lic.color} blur-lg`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{lic.name}</p>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">ACTUAL</span>
                  )}
                </div>
                <p className="text-lg font-bold mt-1">${lic.price}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Desbloquea pagando ${lic.unlock} USD</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {authorized ? "Reventa habilitada" : "Requiere licencia superior o Pase VIP"}
                </p>

                <div className="mt-3">
                  {authorized ? (
                    <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={() => copyInvite(lic.name)}>
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar Link Invitación
                    </Button>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-secondary/40 border border-border text-xs text-muted-foreground">
                      <Lock className="w-3.5 h-3.5 text-primary" />
                      Bloqueado · Pase VIP ($115)
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}