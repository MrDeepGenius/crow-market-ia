import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Copy, Check, Loader2, Link2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";

const NETWORKS = [
  { id: "BEP20", label: "BEP20 (BSC)", note: "Binance Smart Chain" },
  { id: "TRC20", label: "TRC20 (Tron)", note: "Red Tron · baja comision" },
];

export default function PaymentLink({ product, mode, price }) {
  const [network, setNetwork] = useState("TRC20");
  const [step, setStep] = useState("idle"); // idle | generating | ready
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [marking, setMarking] = useState(false);
  const [paid, setPaid] = useState(false);

  const handleGenerate = async () => {
    setStep("generating");
    setData(null);
    try {
      const res = await base44.functions.invoke("createPaymentOrder", {
        productId: product.id,
        productName: product.name,
        mode,
        amount: price,
        network,
      });
      const d = res?.data || res;
      if (d?.error) throw new Error(d.error);
      // animacion minima de "creando link"
      setTimeout(() => {
        setData(d);
        setStep("ready");
      }, 1400);
    } catch (err) {
      setStep("idle");
      toast({ variant: "destructive", title: "No se pudo crear el link", description: err?.message || "Intenta de nuevo." });
    }
  };

  const copyWallet = () => {
    if (!data?.wallet) return;
    navigator.clipboard?.writeText(data.wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const markPaid = async () => {
    if (!data?.orderId) return;
    setMarking(true);
    try {
      await base44.entities.PaymentOrder.update(data.orderId, { status: "paid" });
      setPaid(true);
      toast({ title: "Transferencia registrada", description: "Tu pago queda en verificacion. Te avisaremos al confirmarse." });
    } catch (err) {
      toast({ variant: "destructive", title: "No se pudo registrar", description: err?.message || "Intenta de nuevo." });
    } finally {
      setMarking(false);
    }
  };

  const total = data ? data.total : Number(price.toFixed(2));

  return (
    <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-4">
      <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
        <Link2 className="w-3.5 h-3.5" /> Link de pago · USDT
      </p>

      {/* Selector de red */}
      <div className="grid grid-cols-2 gap-2">
        {NETWORKS.map((n) => (
          <button
            key={n.id}
            onClick={() => setNetwork(n.id)}
            disabled={step !== "idle"}
            className={`rounded-xl border px-3 py-2 text-left transition disabled:opacity-60 ${network === n.id ? "border-primary bg-primary/15" : "border-border hover:bg-secondary/50"}`}
          >
            <p className="text-xs font-semibold">{n.label}</p>
            <p className="text-[10px] text-muted-foreground">{n.note}</p>
          </button>
        ))}
      </div>

      {/* Desglose */}
      <div className="rounded-xl bg-background/50 border border-border p-3 space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{mode === "rent" ? "Alquiler mensual" : "Precio"}</span>
          <span className="font-medium">${price.toFixed(2)}</span>
        </div>
        <div className="border-t border-border pt-1.5 flex justify-between">
          <span className="font-semibold">Total a transferir</span>
          <span className="font-bold text-primary text-base">${total.toFixed(2)} USDT</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button className="w-full h-11" onClick={handleGenerate}>
              <Link2 className="w-4 h-4 mr-2" /> Generar link de pago
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">Los fees de red los asume el comprador en su wallet.</p>
          </motion.div>
        )}

        {step === "generating" && (
          <motion.div
            key="gen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 flex flex-col items-center gap-3"
          >
            <div className="relative w-14 h-14">
              <Loader2 className="w-14 h-14 text-primary animate-spin" />
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow" />
            </div>
            <p className="text-sm text-muted-foreground">Creando link de pago seguro...</p>
            <div className="w-full h-1 rounded-full bg-secondary overflow-hidden">
              <div className="h-full animate-shimmer" />
            </div>
          </motion.div>
        )}

        {step === "ready" && data && !paid && (
          <motion.div key="ready" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="rounded-xl bg-background/60 border border-border p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <Wallet className="w-3 h-3" /> Billetera {data.network} (USDT)
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono break-all flex-1 select-all">{data.wallet}</code>
                <Button size="sm" variant="outline" className="bg-transparent shrink-0" onClick={copyWallet}>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-amber-400/10 border border-amber-400/30 p-2.5 text-[11px] text-amber-300">
              Transfiere exactamente <span className="font-bold">${data.total.toFixed(2)} USDT</span> por la red {data.network}. Montos distintos no se acreditan.
            </div>

            <Button className="w-full h-11" onClick={markPaid} disabled={marking}>
              {marking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Ya realice la transferencia
            </Button>
          </motion.div>
        )}

        {step === "ready" && paid && (
          <motion.div key="paid" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-6 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold">Pago en verificacion</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Tu orden #{data?.orderId?.slice(0, 8)} quedó registrada. Confirmaremos la acreditacion en la red {data?.network}.
              </p>
            </div>
            <Button variant="outline" className="bg-transparent" onClick={() => { setStep("idle"); setPaid(false); setData(null); }}>
              <ArrowRight className="w-4 h-4 mr-2" /> Cerrar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}