import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Bot, Plus, Loader2, Store, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import BrandLogo from "@/components/BrandLogo";
import BinanceConnect from "@/components/bot/BinanceConnect";
import BotInstanceCard from "@/components/bot/BotInstanceCard";

// Panel del comprador: "Mis bots" — instancias ejecutables sobre Binance Testnet.
// Separado del panel del creador (no lo modifica).
export default function MyBots() {
  const { user, checkUserAuth } = useAuth();
  const [connections, setConnections] = useState([]);
  const [instances, setInstances] = useState([]);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newBot, setNewBot] = useState("");
  const [newCapital, setNewCapital] = useState("100");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [c, i, b] = await Promise.all([
        base44.entities.BinanceConnection.filter({ user_id: user.id }, "-created_date", 10).catch(() => []),
        base44.entities.BotInstance.filter({ user_id: user.id }, "-created_date", 50).catch(() => []),
        base44.entities.Product.filter({ type: "bot", status: "published" }, "-created_date", 100).catch(() => []),
      ]);
      setConnections(c || []);
      setInstances(i || []);
      setBots(b || []);
    } finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const connection = connections[0] || null;

  const logout = async () => {
    try { await base44.auth.logout(); } catch (e) {}
    window.location.href = "/marketplace";
  };

  const createInstance = async () => {
    if (!newBot) { toast({ variant: "destructive", title: "Elegí un bot" }); return; }
    const cap = Number(newCapital);
    if (!cap || cap <= 0) { toast({ variant: "destructive", title: "Capital inválido" }); return; }
    setCreating(true);
    try {
      const res = await base44.functions.invoke("createBotInstance", {
        productId: newBot, capital: cap, connectionId: connection?.id || "",
      });
      const d = res?.data || res;
      if (d?.error) toast({ variant: "destructive", title: "No se pudo crear", description: d.error });
      else {
        toast({ title: "Instancia creada", description: "Conectá Binance y pulsá PLAY para ejecutar." });
        setNewBot(""); setNewCapital("100"); setShowAdd(false);
        load();
      }
    } catch (e) {
      toast({ variant: "destructive", title: "No se pudo crear", description: e?.message });
    } finally { setCreating(false); }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] opacity-30" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-30 glass-strong border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <span className="text-sm font-semibold hidden sm:block">Mis Bots</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/marketplace" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground px-3 py-2">
              <Store className="w-4 h-4 mr-1" /> Marketplace
            </Link>
            <Button variant="outline" size="sm" onClick={logout} className="bg-transparent border-border hover:bg-secondary">
              <LogOut className="w-4 h-4 mr-1" /> Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl">Mis bots</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ejecutá los bots que compraste sobre Binance Testnet. Conectá tu cuenta, definí el capital y pulsá PLAY.
          </p>
        </div>

        <BinanceConnect connection={connection} onChanged={load} />

        {/* Instancias */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-lg">Instancias</h2>
            <Button size="sm" onClick={() => setShowAdd((s) => !s)}>
              <Plus className="w-4 h-4 mr-1" /> Agregar bot
            </Button>
          </div>

          {showAdd && (
            <div className="glass rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Crear instancia desde un bot publicado</h3>
                <button type="button" onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              {bots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay bots publicados todavía. Explorá el marketplace.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bot</Label>
                    <select value={newBot} onChange={(e) => setNewBot(e.target.value)} className="h-11 w-full rounded-md border border-input bg-secondary/50 px-3 text-sm outline-none focus:border-primary">
                      <option value="">Elegí un bot…</option>
                      {bots.map((b) => (
                        <option key={b.id} value={b.id}>{b.name} · {b.timeframe || "—"}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Capital (USDT)</Label>
                    <Input type="number" value={newCapital} onChange={(e) => setNewCapital(e.target.value)} placeholder="100" className="h-11 bg-secondary/50 border-border" />
                  </div>
                </div>
              )}
              {bots.length > 0 && (
                <Button onClick={createInstance} disabled={creating} className="h-11 px-6">
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {creating ? "Creando..." : "Crear instancia"}
                </Button>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : instances.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Bot className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No tenés instancias todavía. Agregá un bot publicado para empezar.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {instances.map((inst) => (
                <BotInstanceCard key={inst.id} instance={inst} connection={connection} onChanged={load} />
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center pt-4">
          Modo Testnet: las órdenes se ejecutan en Binance Spot Testnet. Sin dinero real.
        </p>
      </main>
    </div>
  );
}