import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Loader2, CheckCircle2, LogIn } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

// Adquisición SIMULADA (modo prueba): crea una BotInstance para el usuario
// autenticado sin cobro real. Relaciona user_id + bot_id y deja la instancia
// lista para PLAY en "Mis bots". No reemplaza el flujo de pago USDT real.
export default function AcquireButton({ product }) {
  const { user } = useAuth();
  const [capital, setCapital] = useState("100");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!user) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <LogIn className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold">Iniciá sesión para adquirir este bot</p>
        </div>
        <Link to="/login">
          <Button className="h-10 w-full">Iniciar sesión</Button>
        </Link>
      </div>
    );
  }

  const acquire = async () => {
    const cap = Number(capital);
    if (!cap || cap <= 0) {
      toast({ variant: "destructive", title: "Capital inválido" });
      return;
    }
    setBusy(true);
    try {
      const res = await base44.functions.invoke("createBotInstance", {
        productId: product.id,
        capital: cap,
        connectionId: "",
      });
      const d = res?.data || res;
      if (d?.error) {
        toast({ variant: "destructive", title: "No se pudo adquirir", description: d.error });
        return;
      }
      setDone(true);
      toast({
        title: "Bot adquirido (prueba)",
        description: "Instancia creada. Pulsá PLAY en Mis Bots para que el servidor ejecute la estrategia.",
      });
    } catch (e) {
      toast({ variant: "destructive", title: "No se pudo adquirir", description: e?.message });
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <p className="text-sm font-semibold">Instancia creada para tu cuenta</p>
        </div>
        <Link to="/my-bots">
          <Button className="h-10 w-full">
            <Bot className="w-4 h-4 mr-1" /> Ir a Mis Bots
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-primary" />
        <p className="text-sm font-semibold">Adquirir bot (modo prueba)</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Crea una instancia independiente vinculada a tu cuenta, sin cobro real. El servidor ejecutará la estrategia del creador al pulsar PLAY.
      </p>
      <div className="flex gap-2 items-end">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs">Capital (USDT)</Label>
          <Input
            type="number"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            className="h-10 bg-secondary/50 border-border"
          />
        </div>
        <Button onClick={acquire} disabled={busy} className="h-10 px-5">
          {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Bot className="w-4 h-4 mr-1" />}
          {busy ? "Adquiriendo..." : "Adquirir"}
        </Button>
      </div>
    </div>
  );
}