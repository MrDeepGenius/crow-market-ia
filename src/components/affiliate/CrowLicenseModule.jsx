import React, { useState } from "react";
import { Crown, Lock, Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

function Panel({ children, className = "" }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

// Licencias Creador que el afiliado puede revender. unlock = precio para desbloquear el nivel.
const LC_LICENSES = [
  { id: "bronce", name: "Bronce", price: 30, unlock: 15, color: "from-amber-700/30 to-amber-600/10 text-amber-300" },
  { id: "plata", name: "Plata", price: 50, unlock: 25, color: "from-slate-300/30 to-slate-400/10 text-slate-200" },
  { id: "oro", name: "Oro", price: 100, unlock: 50, color: "from-yellow-400/30 to-yellow-500/10 text-yellow-300" },
  { id: "diamante", name: "Diamante", price: 200, unlock: 100, color: "from-cyan-400/30 to-fuchsia-500/10 text-cyan-200" },
];

const VIP_PRICE = 115;
const LEVEL_ORDER = ["none", "bronce", "plata", "oro", "diamante"];

export default function CrowLicenseModule() {
  const { user, checkUserAuth } = useAuth();
  const vipUnlocked = !!user?.vip_unlocked;
  const balance = Number(user?.wallet_balance || 0);
  const currentLevel = user?.lc_unlocked_level || "none";
  const currentIdx = LEVEL_ORDER.indexOf(currentLevel);
  const [buying, setBuying] = useState(null); // tier id en curso

  const isAuthorized = (licenseId) => vipUnlocked || LEVEL_ORDER.indexOf(licenseId) <= currentIdx;

  const copyInvite = (name) => {
    navigator.clipboard?.writeText(`https://crowmarket.ai/invite/creator/AFF8421X/${name.toLowerCase()}`);
    toast({ title: "Link copiado", description: `Link de invitación a creador (${name}) copiado.` });
  };

  const handleBuyVip = async () => {
    setBuying("vip");
    try {
      await base44.functions.invoke("purchaseVip", {});
      toast({
        title: "Pase VIP activado",
        description: `Se debitaron $${VIP_PRICE} USDT. ¡Desbloqueaste el 100% de las comisiones!`,
      });
      checkUserAuth();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "No se pudo completar",
        description: err?.message || err?.data?.error || "Saldo insuficiente.",
      });
    } finally {
      setBuying(null);
    }
  };

  const handleUnlock = async (lic) => {
    setBuying(lic.id);
    try {
      const res = await base44.functions.invoke("purchaseLicense", { tier: lic.id });
      toast({
        title: `Licencia ${lic.name} desbloqueada`,
        description: `Se debitaron $${lic.unlock} USDT. Ya puedes revender ${lic.name} y niveles inferiores.`,
      });
      checkUserAuth();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "No se pudo desbloquear",
        description: err?.message || err?.data?.error || "Saldo insuficiente.",
      });
    } finally {
      setBuying(null);
    }
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
              Compra cada nivel con el saldo de tu billetera y desbloquea la reventa de esa licencia y todas las
              inferiores. Sólo puedes vender licencias de nivel <strong className="text-foreground">igual o inferior</strong> al desbloqueado.
              <br />
              <span className="text-xs">Desbloqueo: Bronce $15 · Plata $25 · Oro $50 · Diamante $100</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-secondary/60 border border-border">
                Saldo: <strong className="text-primary">${balance.toFixed(2)} USDT</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-secondary/60 border border-border">
                Nivel actual: <strong className="text-foreground">{vipUnlocked ? "VIP (todos)" : currentLevel === "none" ? "Sin nivel" : currentLevel}</strong>
              </span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Pase VIP */}
      <Panel className={`border-2 ${vipUnlocked ? "border-amber-400/50 bg-amber-400/5" : "border-dashed border-primary/40"}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Pase VIP Total — ${VIP_PRICE} USD</p>
              <p className="text-xs text-muted-foreground">
                {vipUnlocked
                  ? "Activo: desbloqueaste el 100% de las comisiones."
                  : `Desbloquea el 100% de las comisiones. Se paga con tu saldo (${balance.toFixed(2)} USDT).`}
              </p>
            </div>
          </div>
          <Button
            className={vipUnlocked ? "bg-amber-400 text-black hover:bg-amber-300" : ""}
            disabled={vipUnlocked || buying === "vip" || balance < VIP_PRICE}
            onClick={handleBuyVip}
          >
            {vipUnlocked ? (
              <>
                <Check className="w-4 h-4 mr-1.5" /> VIP Activo
              </>
            ) : buying === "vip" ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Procesando...
              </>
            ) : (
              `Desbloquear Pase VIP ($${VIP_PRICE})`
            )}
          </Button>
        </div>
      </Panel>

      {/* Grilla de desbloqueo progresivo */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LC_LICENSES.map((lic) => {
          const authorized = isAuthorized(lic.id);
          const isCurrent = !vipUnlocked && currentLevel === lic.id;
          const canAfford = balance >= lic.unlock;
          return (
            <Panel key={lic.id} className={`relative ${authorized ? "" : "opacity-90"}`}>
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${lic.color} blur-lg`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{lic.name}</p>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">ACTUAL</span>
                  )}
                  {authorized && !isCurrent && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-400/15 text-green-400">DESBLOQUEADO</span>
                  )}
                </div>
                <p className="text-lg font-bold mt-1">${lic.price}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {authorized ? "Reventa habilitada" : `Desbloquea pagando $${lic.unlock} USD`}
                </p>

                <div className="mt-3">
                  {authorized ? (
                    <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={() => copyInvite(lic.name)}>
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar Link Invitación
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={buying === lic.id || !canAfford}
                      onClick={() => handleUnlock(lic)}
                    >
                      {buying === lic.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Procesando...
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 mr-1.5" /> Desbloquear (${lic.unlock})
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {!authorized && !canAfford && (
                  <p className="mt-2 text-[11px] text-destructive text-center">Saldo insuficiente</p>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}