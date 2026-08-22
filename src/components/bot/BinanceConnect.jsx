import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Link as LinkIcon, CheckCircle2, AlertTriangle, Wallet, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

// Conecta (o muestra) la cuenta Binance Testnet del comprador.
// Las API keys se envian al backend (connectBinanceTestnet), nunca a Binance desde el frontend.
export default function BinanceConnect({ connection, onChanged }) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loadingBal, setLoadingBal] = useState(false);

  const connect = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast({ variant: "destructive", title: "Faltan credenciales", description: "Ingresá API Key y API Secret." });
      return;
    }
    setBusy(true);
    try {
      const res = await base44.functions.invoke("connectBinanceTestnet", { apiKey, apiSecret, label });
      const d = res?.data || res;
      if (d?.error) {
        toast({ variant: "destructive", title: "Conexión fallida", description: d.error + (d.details ? ` (${d.details})` : "") });
      } else {
        toast({ title: "Cuenta conectada", description: "Binance Testnet verificada correctamente." });
        setApiKey(""); setApiSecret(""); setLabel("");
        setBalance(d?.balances || null);
        onChanged?.();
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Conexión fallida", description: e?.message });
    } finally { setBusy(false); }
  };

  const fetchBalance = async () => {
    if (!connection) return;
    setLoadingBal(true);
    try {
      const res = await base44.functions.invoke("getBinanceBalance", { connectionId: connection.id });
      const d = res?.data || res;
      if (d?.error) toast({ variant: "destructive", title: "Error", description: d.error });
      else setBalance(d?.balances || []);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e?.message });
    } finally { setLoadingBal(false); }
  };

  if (connection) {
    return (
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <LinkIcon className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold">Cuenta Binance Testnet</h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ml-auto ${connection.status === "connected" ? "bg-green-400/15 text-green-400" : "bg-red-400/15 text-red-400"}`}>
            {connection.status === "connected" ? "Conectada" : "Error"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {connection.label || "Binance Testnet"} · {connection.last_check ? `Verificada ${new Date(connection.last_check).toLocaleString()}` : "Sin verificar"}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchBalance} disabled={loadingBal} className="bg-transparent border-border hover:bg-secondary">
            {loadingBal ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Wallet className="w-4 h-4 mr-1" />} Consultar saldo
          </Button>
          <a href="https://testnet.binance.vision/" target="_blank" rel="noreferrer" className="inline-flex items-center text-xs text-primary hover:underline px-3 py-2">
            Obtener claves Testnet <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
        {balance && (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {balance.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin saldo disponible en la cuenta testnet.</p>
            ) : balance.map((b) => (
              <div key={b.asset} className="rounded-lg bg-secondary/40 border border-border p-2.5">
                <p className="text-xs text-muted-foreground">{b.asset}</p>
                <p className="text-sm font-semibold">{Number(b.free).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <LinkIcon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold">Conectar Binance Testnet</h3>
      </div>
      <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/15 mb-4">
        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Usá claves de <strong className="text-foreground">Binance Spot Testnet</strong> (no mainnet). Las credenciales se guardan server-side y nunca se envían a Binance desde el navegador.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>API Key</Label>
          <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API Key Testnet" className="h-11 bg-secondary/50 border-border" />
        </div>
        <div className="space-y-2">
          <Label>API Secret</Label>
          <Input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder="API Secret Testnet" className="h-11 bg-secondary/50 border-border" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Etiqueta · opcional</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Mi cuenta testnet" className="h-11 bg-secondary/50 border-border" />
        </div>
      </div>
      <Button onClick={connect} disabled={busy} className="mt-4 h-11 px-6">
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
        {busy ? "Verificando..." : "Conectar cuenta"}
      </Button>
    </div>
  );
}