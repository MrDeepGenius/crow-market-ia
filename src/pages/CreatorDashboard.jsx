import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, PlusCircle, Cpu, Bot, History, FlaskConical, Store,
  Users, TrendingUp, Wallet, ArrowDownToLine, BarChart3, Settings, Plus, DollarSign, Activity, Sparkles,
  CheckCircle, Loader2,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import CreateBot from "@/components/creator/CreateBot";
import AIChat from "@/components/creator/AIChat";
import PlanGate from "@/components/creator/PlanGate";
import RenewalBanner from "@/components/creator/RenewalBanner";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { purchasePlan, creditWallet } from "@/lib/purchase";
import { CREATOR_PLANS, USDT_DEPOSIT } from "@/lib/plans";
import { toast } from "@/components/ui/use-toast";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const navItems = [
  { id: "home", label: "Inicio", icon: LayoutDashboard },
  { id: "products", label: "Mis productos", icon: Package },
  { id: "create-product", label: "Crear producto", icon: PlusCircle },
  { id: "studio", label: "Creator Studio", icon: Cpu },
  { id: "bots", label: "Mis bots", icon: Bot },
  { id: "create-bot", label: "Crear bot", icon: PlusCircle },
  { id: "backtest", label: "Backtesting", icon: History },
  { id: "paper", label: "Paper Trading", icon: FlaskConical },
  { id: "marketplace", label: "Marketplace", icon: Store },
  { id: "ai-chat", label: "Asistente IA", icon: Sparkles },
  { id: "affiliates", label: "Afiliados", icon: Users },
  { id: "sales", label: "Ventas", icon: TrendingUp },
  { id: "commissions", label: "Comisiones", icon: DollarSign },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "withdrawals", label: "Retiros", icon: ArrowDownToLine },
  { id: "withdrawals-admin", label: "Gestión de retiros", icon: CheckCircle },
  { id: "stats", label: "Estadísticas", icon: BarChart3 },
  { id: "settings", label: "Configuración", icon: Settings },
];

const chartData = [
  { v: 8, l: "Ene" }, { v: 14, l: "Feb" }, { v: 11, l: "Mar" }, { v: 20, l: "Abr" },
  { v: 18, l: "May" }, { v: 27, l: "Jun" }, { v: 24, l: "Jul" }, { v: 35, l: "Ago" },
];

export default function CreatorDashboard() {
  const [active, setActive] = useState("home");
  const { user } = useAuth();
  const items = navItems.filter((n) => n.id !== "withdrawals-admin" || user?.role === "admin");
  return (
    <DashboardShell title="Creator Dashboard" navItems={items} active={active} onSelect={setActive}>
      <RenewalBanner />
      <SectionRenderer active={active} onSaved={(s) => setActive(s)} />
    </DashboardShell>
  );
}

function SectionRenderer({ active, onSaved }) {
  switch (active) {
    case "home":
      return <HomeSection />;
    case "products":
      return <ProductsSection />;
    case "create-product":
      return <PlanGate title="Licencia requerida para crear productos"><CreateProductSection /></PlanGate>;
    case "studio":
      return <StudioSection />;
    case "bots":
      return <BotsSection />;
    case "create-bot":
      return <PlanGate title="Licencia requerida para crear bots"><CreateBot onSaved={() => onSaved("bots")} /></PlanGate>;
    case "backtest":
      return <BacktestSection />;
    case "paper":
      return <PaperSection />;
    case "wallet":
      return <WalletSection />;
    case "withdrawals":
      return <WithdrawalsSection />;
    case "withdrawals-admin":
      return <WithdrawalsAdminSection />;
    case "affiliates":
      return <AffiliatesSection />;
    case "sales":
      return <SalesSection />;
    case "commissions":
      return <CommissionsSection />;
    case "stats":
      return <StatsSection />;
    case "ai-chat":
      return <AIChat />;
    case "marketplace":
      return <Placeholder title="Marketplace" desc="Explora el marketplace completo desde la navegación pública." />;
    case "settings":
      return <Placeholder title="Configuración" desc="Gestiona tu cuenta, seguridad y preferencias." />;
    default:
      return <HomeSection />;
  }
}

function HomeSection() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ingresos totales" value="$12,480" trend="+18%" icon={DollarSign} />
        <StatCard label="Ventas (30d)" value="342" trend="+24%" icon={TrendingUp} />
        <StatCard label="Afiliados activos" value="58" trend="+9%" icon={Users} />
        <StatCard label="Bots activos" value="4" trend="+2" icon={Bot} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel className="lg:col-span-2">
          <PanelHeader title="Ingresos · últimos 8 meses" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(276 91% 60%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(276 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="l" stroke="hsl(265 10% 62%)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(250 16% 8%)", border: "1px solid hsl(260 14% 22%)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="hsl(276 91% 65%)" strokeWidth={2.5} fill="url(#cg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <PanelHeader title="Bots en ejecución" />
          <div className="space-y-3">
            {[
              { n: "Apex BTC Pro", s: "LIVE", w: "64%" },
              { n: "Grid Master", s: "LIVE", w: "58%" },
              { n: "Neural Scalper", s: "PAUSA", w: "—" },
            ].map((b) => (
              <div key={b.n} className="flex items-center justify-between rounded-xl bg-secondary/40 border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{b.n}</p>
                    <p className="text-xs text-muted-foreground">Win rate {b.w}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${b.s === "LIVE" ? "bg-green-400/15 text-green-400" : "bg-yellow-400/15 text-yellow-400"}`}>
                  ● {b.s}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ProductsSection() {
  const products = [
    { n: "Apex BTC Pro", p: "$25/mes", v: "Validado", a: "20%" },
    { n: "Risk Guardian", p: "$19/mes", v: "Nuevo", a: "—" },
    { n: "Funnel AI Pack", p: "$49", v: "Bestseller", a: "20%" },
  ];
  return (
    <div className="space-y-4">
      <SectionHeader title="Mis productos" action="Crear producto" />
      <div className="grid gap-3">
        {products.map((p) => (
          <Panel key={p.n} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{p.n}</p>
                <p className="text-xs text-muted-foreground">{p.p} · Afiliados {p.a}</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary">{p.v}</span>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function CreateProductSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Crear producto" />
      <Panel>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Nombre del producto" placeholder="Ej. Apex BTC Pro" />
          <FormField label="Precio (US$)" placeholder="25" type="number" />
          <FormField label="Categoría" placeholder="Bot de Trading" />
          <FormField label="Modelo de pago" placeholder="mensual / pago único" />
        </div>
        <div className="mt-4">
          <Label className="mb-2 block">Descripción</Label>
          <textarea
            placeholder="Describe tu producto..."
            rows={4}
            className="w-full rounded-xl bg-secondary/50 border border-border p-3 text-sm outline-none focus:border-primary resize-none"
          />
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/40 border border-border p-4">
          <div>
            <p className="font-semibold text-sm">Programa de afiliados</p>
            <p className="text-xs text-muted-foreground">Activa afiliados y define comisión (15%–20%)</p>
          </div>
          <div className="flex items-center gap-3">
            <Input placeholder="20" className="w-20 h-10 bg-secondary/50" defaultValue="20" />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <Button className="mt-5 h-11 px-6">Publicar producto</Button>
      </Panel>
    </div>
  );
}

function StudioSection() {
  return (
    <Placeholder
      title="Creator Studio"
      desc="Construye bots y agentes con IA. Configura estrategia, indicadores, reglas de entrada/salida y gestión de riesgo."
      icon={Cpu}
    />
  );
}

function BotsSection() {
  const bots = [
    { n: "Apex BTC Pro", t: "1H", s: "LIVE", ops: 128 },
    { n: "Grid Master", t: "15m", s: "LIVE", ops: 64 },
    { n: "Neural Scalper", t: "5m", s: "PAUSA", ops: 22 },
  ];
  return (
    <div className="space-y-4">
      <SectionHeader title="Mis bots" action="Crear bot" />
      <div className="grid gap-3">
        {bots.map((b) => (
          <Panel key={b.n} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{b.n}</p>
                <p className="text-xs text-muted-foreground">TF {b.t} · {b.ops} operaciones</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="bg-transparent border-border hover:bg-secondary">Pausar</Button>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${b.s === "LIVE" ? "bg-green-400/15 text-green-400" : "bg-yellow-400/15 text-yellow-400"}`}>● {b.s}</span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function BacktestSection() {
  const results = [
    { k: "Capital inicial", v: "$1,000" },
    { k: "Periodo", v: "12 meses" },
    { k: "Operaciones", v: "128" },
    { k: "Win rate", v: "64%" },
    { k: "Profit factor", v: "2.1" },
    { k: "Drawdown máx.", v: "11.4%" },
    { k: "P&L", v: "+$2,140" },
  ];
  return (
    <div className="space-y-4">
      <SectionHeader title="Backtesting" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {results.map((r) => (
          <Panel key={r.k}>
            <p className="text-xs text-muted-foreground">{r.k}</p>
            <p className="text-xl font-bold mt-1">{r.v}</p>
          </Panel>
        ))}
      </div>
      <Panel>
        <PanelHeader title="Curva de capital" />
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160 70% 50%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(160 70% 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="l" stroke="hsl(265 10% 62%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(250 16% 8%)", border: "1px solid hsl(260 14% 22%)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="v" stroke="hsl(160 70% 50%)" strokeWidth={2.5} fill="url(#bg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <Disclaimer />
      </Panel>
    </div>
  );
}

function PaperSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Paper Trading" />
      <Panel>
        <p className="text-sm text-muted-foreground">
          Prueba tu bot con datos reales de mercado pero ejecutando operaciones simuladas. La duración mínima se adapta al timeframe.
        </p>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {[
            { tf: "1m", d: "Prueba corta" },
            { tf: "1H", d: "~24 horas" },
            { tf: "1D", d: "Periodo prolongado" },
          ].map((t) => (
            <div key={t.tf} className="rounded-xl bg-secondary/40 border border-border p-4 text-center">
              <p className="font-bold text-lg">{t.tf}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button className="h-11 px-6">Iniciar paper trading</Button>
          <span className="text-xs text-yellow-400 px-3 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
            Datos insuficientes para evaluar el comportamiento
          </span>
        </div>
      </Panel>
    </div>
  );
}

function WalletSection() {
  const { user, checkUserAuth } = useAuth();
  const [buying, setBuying] = useState(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [crediting, setCrediting] = useState(false);

  const balance = Number(user?.wallet_balance || 0);
  const planLabel = user?.plan_tier && user.plan_tier !== "free"
    ? user.plan_tier.charAt(0).toUpperCase() + user.plan_tier.slice(1)
    : "Gratis";

  const expiryDate = user?.plan_expires_at ? new Date(user.plan_expires_at) : null;
  const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - Date.now()) / 86400000) : null;
  const expiryLabel = expiryDate
    ? `${expiryDate.toLocaleDateString()}${daysLeft >= 0 ? ` · ${daysLeft}d` : " · vencido"}`
    : "—";

  const handlePurchase = async (plan) => {
    setBuying(plan.id);
    try {
      await purchasePlan(plan.id);
      toast({ title: `Plan ${plan.name} activado`, description: `Se debitaron $${plan.priceUsd} USDT.` });
      checkUserAuth();
    } catch (err) {
      toast({ variant: "destructive", title: "No se pudo completar", description: err?.message || "Saldo insuficiente." });
    } finally {
      setBuying(null);
    }
  };

  const handleCredit = async () => {
    const amt = Number(creditAmount);
    if (!amt || amt <= 0) return;
    setCrediting(true);
    try {
      await creditWallet(user.id, amt);
      toast({ title: "Saldo acreditado", description: `$${amt} USDT cargados a tu billetera.` });
      setCreditAmount("");
      checkUserAuth();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err?.message || "No se pudo acreditar." });
    } finally {
      setCrediting(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Wallet USDT" />
      <div className="grid sm:grid-cols-3 gap-4">
        <BalanceCard label="Saldo disponible (USDT)" value={`$${balance.toFixed(2)}`} tone="primary" />
        <BalanceCard label="Plan activo" value={planLabel} tone="yellow" />
        <BalanceCard label="Vencimiento" value={expiryLabel} tone="muted" />
      </div>

      <Panel>
        <PanelHeader title="Recargar billetera (USDT · TRC20)" />
        <div className="rounded-xl bg-secondary/40 border border-border p-4 text-sm space-y-2">
          <p className="text-muted-foreground">
            Envía USDT por red <strong className="text-foreground">TRC20 (Tron)</strong> a esta dirección:
          </p>
          <code className="block text-xs font-mono bg-background/60 p-3 rounded-lg break-all">{USDT_DEPOSIT.address}</code>
          <p className="text-xs text-muted-foreground">{USDT_DEPOSIT.note}</p>
        </div>
        {user?.role === "admin" && (
          <div className="mt-4 flex items-end gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4">
            <div className="flex-1">
              <Label>Acreditar USDT (admin · prueba)</Label>
              <Input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="50"
                className="mt-2 h-10 bg-secondary/50"
              />
            </div>
            <Button onClick={handleCredit} disabled={crediting || !creditAmount} className="h-10">
              {crediting ? "Acreditando..." : "Acreditar"}
            </Button>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader title="Comprar plan con saldo USDT" />
        {balance < 30 ? (
          <p className="text-sm text-muted-foreground">
            Necesitas saldo en tu billetera para comprar un plan. Recarga primero con USDT (TRC20).
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CREATOR_PLANS.map((p) => {
              const projectedEnd = new Date(Date.now() + p.periodDays * 86400000).toLocaleDateString();
              const isCurrent = user?.plan_tier === p.id;
              return (
                <div key={p.id} className={`rounded-xl border p-4 ${isCurrent ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{p.name}</p>
                    {isCurrent && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">ACTIVO</span>}
                  </div>
                  <p className="text-lg font-bold mt-1">
                    ${p.priceUsd} <span className="text-xs font-normal text-muted-foreground">/{p.periodLabel}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vence el <strong className="text-foreground">{projectedEnd}</strong>
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    disabled={buying === p.id || balance < p.priceUsd}
                    onClick={() => handlePurchase(p)}
                  >
                    {buying === p.id ? "Procesando..." : isCurrent ? "Renovar" : "Comprar"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

function WithdrawalsSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Retiros" />
      <Panel>
        <FormField label="Monto a retirar (US$)" placeholder="500" type="number" />
        <FormField label="Destino" placeholder="Cuenta bancaria / USDT (TRC20)" />
        <Button className="mt-4 h-11 px-6">Solicitar retiro</Button>
      </Panel>
      <Panel>
        <PanelHeader title="Solicitudes de retiro" />
        <div className="space-y-2 text-sm">
          {[{ a: "$1,000", s: "Procesando" }, { a: "$500", s: "Completado" }].map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-muted-foreground">{r.a}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.s === "Completado" ? "bg-green-400/15 text-green-400" : "bg-yellow-400/15 text-yellow-400"}`}>{r.s}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function WithdrawalsAdminSection() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Withdrawal.filter({ status: "pending" }, "-created_date", 50);
      setList(res || []);
    } catch (err) {
      toast({ variant: "destructive", title: "Error al cargar retiros", description: err?.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user]);

  const approve = async (id) => {
    setApproving(id);
    try {
      await base44.functions.invoke("approveWithdrawal", { withdrawalId: id });
      toast({ title: "Retiro aprobado", description: "Se marcó como completado y se envió el email al afiliado." });
      load();
    } catch (err) {
      toast({ variant: "destructive", title: "No se pudo aprobar", description: err?.message || "Intenta de nuevo." });
    } finally {
      setApproving(null);
    }
  };

  if (user?.role !== "admin") {
    return <Placeholder title="Gestión de retiros" desc="Solo disponible para administradores." icon={CheckCircle} />;
  }

  return (
    <div className="space-y-4">
      <SectionHeader title="Gestión de retiros" />
      <Panel>
        <PanelHeader title="Solicitudes pendientes" />
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No hay retiros pendientes.</p>
        ) : (
          <div className="space-y-2">
            {list.map((w) => (
              <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-border last:border-0">
                <div className="space-y-1">
                  <p className="text-sm font-semibold">{Number(w.amount).toFixed(2)} USDT · <span className="text-muted-foreground font-normal">{w.network}</span></p>
                  <p className="text-xs text-muted-foreground font-mono break-all">{w.wallet_address}</p>
                </div>
                <Button
                  size="sm"
                  className="h-9"
                  disabled={approving === w.id}
                  onClick={() => approve(w.id)}
                >
                  {approving === w.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                  Aprobar
                </Button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function AffiliatesSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Afiliados" />
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Afiliados activos" value="58" trend="+9%" icon={Users} />
        <StatCard label="Ventas de afiliados" value="142" trend="+12%" icon={TrendingUp} />
        <StatCard label="Comisiones pagadas" value="$1,980" trend="+7%" icon={DollarSign} />
      </div>
      <Panel>
        <PanelHeader title="Mis afiliados" />
        <div className="space-y-2">
          {[
            { n: "Lucía Fernández", p: "Apex BTC Pro", v: 42, c: "$420", s: "Activo" },
            { n: "Martín Gómez", p: "Funnel AI Pack", v: 31, c: "$301", s: "Activo" },
            { n: "Sofía Ruiz", p: "Apex BTC Pro", v: 28, c: "$280", s: "Activo" },
            { n: "Diego Pérez", p: "Risk Guardian", v: 19, c: "$152", s: "Pausado" },
            { n: "Valentina Sosa", p: "Funnel AI Pack", v: 22, c: "$215", s: "Activo" },
          ].map((a) => (
            <div key={a.n} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm">
                  {a.n.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{a.n}</p>
                  <p className="text-xs text-muted-foreground">{a.p} · {a.v} ventas</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-primary">{a.c}</span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${a.s === "Activo" ? "bg-green-400/15 text-green-400" : "bg-yellow-400/15 text-yellow-400"}`}>{a.s}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <p className="text-sm text-muted-foreground">
          Activa o desactiva el programa de afiliados por producto. Define la comisión permitida (15%–20%).
        </p>
      </Panel>
    </div>
  );
}

function SalesSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Ventas" />
      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard label="Ventas directas" value="200" trend="+15%" icon={TrendingUp} />
        <StatCard label="Ventas de afiliados" value="142" trend="+12%" icon={Users} />
      </div>
    </div>
  );
}

function CommissionsSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Comisiones" />
      <Panel>
        <p className="text-sm text-muted-foreground">
          Visualiza comisiones generadas y pagadas a afiliados según las reglas de atribución de la plataforma.
        </p>
      </Panel>
    </div>
  );
}

function StatsSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Estadísticas" />
      <Panel>
        <PanelHeader title="Rendimiento general" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(276 91% 60%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(276 91% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="l" stroke="hsl(265 10% 62%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(250 16% 8%)", border: "1px solid hsl(260 14% 22%)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="v" stroke="hsl(276 91% 65%)" strokeWidth={2.5} fill="url(#sg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}

/* shared bits */
function StatCard({ label, value, trend, icon: Icon }) {
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs text-green-400 font-medium mt-0.5">{trend}</p>
    </Panel>
  );
}

function Panel({ children, className = "" }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

function PanelHeader({ title }) {
  return <h3 className="font-semibold mb-4">{title}</h3>;
}

function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-heading font-bold text-xl">{title}</h2>
      {action && (
        <Button size="sm" className="h-9">
          <Plus className="w-4 h-4 mr-1" /> {action}
        </Button>
      )}
    </div>
  );
}

function FormField({ label, placeholder, type = "text" }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder} className="h-11 bg-secondary/50 border-border" />
    </div>
  );
}

function BalanceCard({ label, value, tone }) {
  const tones = {
    primary: "text-primary",
    yellow: "text-yellow-400",
    muted: "text-muted-foreground",
  };
  return (
    <Panel>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${tones[tone]}`}>{value}</p>
    </Panel>
  );
}

function Disclaimer() {
  return (
    <p className="mt-4 text-xs text-muted-foreground">
      Los resultados de backtesting no garantizan resultados futuros. El trading implica riesgo.
    </p>
  );
}

function Placeholder({ title, desc, icon: Icon = Activity }) {
  return (
    <Panel className="text-center py-16">
      <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h2 className="font-heading font-bold text-xl">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{desc}</p>
    </Panel>
  );
}