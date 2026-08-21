import React, { useState } from "react";
import { Wallet, ArrowDownToLine, Loader2, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

function Panel({ children, className = "" }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

const MIN_WITHDRAWAL = 25;
const NETWORKS = ["TRC20", "BEP20"];

export default function WithdrawalPanel() {
  const { user, checkUserAuth } = useAuth();
  const balance = Number(user?.wallet_balance || 0);
  const savedAddress = user?.withdrawal_wallet_address || "";
  const savedNetwork = user?.withdrawal_network || "TRC20";

  const [walletAddress, setWalletAddress] = useState(savedAddress);
  const [network, setNetwork] = useState(savedNetwork);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveWallet = async () => {
    if (!walletAddress || walletAddress.length < 8) {
      toast({ variant: "destructive", title: "Dirección inválida", description: "Ingresa una dirección de billetera válida." });
      return;
    }
    setSaving(true);
    try {
      await base44.auth.updateMe({ withdrawal_wallet_address: walletAddress, withdrawal_network: network });
      toast({ title: "Billetera guardada", description: "Tu dirección de retiro quedó registrada." });
      checkUserAuth();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err?.message || "No se pudo guardar." });
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = Number(amount);
    if (!amt || amt < MIN_WITHDRAWAL) {
      toast({ variant: "destructive", title: "Monto inválido", description: `El mínimo de retiro es ${MIN_WITHDRAWAL} USDT.` });
      return;
    }
    if (!walletAddress || walletAddress.length < 8) {
      toast({ variant: "destructive", title: "Falta la billetera", description: "Guarda tu dirección de retiro primero." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("requestWithdrawal", {
        amount: amt,
        network,
        walletAddress,
      });
      toast({
        title: "Retiro solicitado",
        description: res?.message || "Solicitud creada. Los retiros pueden tardar hasta 48 horas hábiles.",
      });
      setAmount("");
      checkUserAuth();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "No se pudo procesar",
        description: err?.message || err?.data?.error || "Intenta de nuevo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl">Wallet & Retiros</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Panel>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo disponible (USDT)</p>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
            </div>
          </div>
        </Panel>
        <Panel className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Tiempo de procesamiento</p>
            <p className="text-xs text-muted-foreground">Los retiros pueden tardar hasta 48 horas hábiles.</p>
          </div>
        </Panel>
      </div>

      {/* Billetera guardada */}
      <Panel>
        <h3 className="font-semibold mb-1">Mi billetera de retiro (USDT)</h3>
        <p className="text-xs text-muted-foreground mb-4">Guarda tu dirección una vez y se usará en todos tus retiros.</p>
        <div className="grid sm:grid-cols-[1fr_auto] gap-3">
          <div className="space-y-2">
            <Label>Dirección de billetera</Label>
            <Input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Tu dirección USDT (TRC20 / BEP20)"
              className="h-11 bg-secondary/50 border-border font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Red</Label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="h-11 rounded-xl bg-secondary/50 border border-border px-3 text-sm outline-none focus:border-primary"
            >
              {NETWORKS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
        <Button variant="outline" className="mt-4 bg-transparent" onClick={handleSaveWallet} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          Guardar billetera
        </Button>
      </Panel>

      {/* Solicitar retiro */}
      <Panel>
        <h3 className="font-semibold mb-1">Solicitar retiro</h3>
        <p className="text-xs text-muted-foreground mb-4">Mínimo {MIN_WITHDRAWAL} USDT · Redes TRC20 / BEP20</p>
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
          <div className="space-y-2">
            <Label>Monto (USDT)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(MIN_WITHDRAWAL)}
              className="h-11 bg-secondary/50 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Red</Label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="h-11 rounded-xl bg-secondary/50 border border-border px-3 text-sm outline-none focus:border-primary"
            >
              {NETWORKS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <Button className="h-11 px-6" onClick={handleWithdraw} disabled={submitting || balance < MIN_WITHDRAWAL}>
            {submitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <ArrowDownToLine className="w-4 h-4 mr-1.5" />}
            Solicitar retiro
          </Button>
        </div>
        {balance < MIN_WITHDRAWAL && (
          <p className="mt-3 text-xs text-destructive">Necesitas al menos {MIN_WITHDRAWAL} USDT para retirar.</p>
        )}
      </Panel>
    </div>
  );
}