import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Package, PlusCircle, Cpu, Bot, History, FlaskConical, Store,
  Users, TrendingUp, Wallet, ArrowDownToLine, BarChart3, Settings, Plus, DollarSign, Activity,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
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
  { id: "affiliates", label: "Afiliados", icon: Users },
  { id: "sales", label: "Ventas", icon: TrendingUp },
  { id: "commissions", label: "Comisiones", icon: DollarSign },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "withdrawals", label: "Retiros", icon: ArrowDownToLine },
  { id: "stats", label: "Estadísticas", icon: BarChart3 },
  { id: "settings", label: "Configuración", icon: Settings },
];

const chartData = [
  { v: 8, l: "Ene" }, { v: 14, l: "Feb" }, { v: 11, l: "Mar" }, { v: 20, l: "Abr" },
  { v: 18, l: "May" }, { v: 27, l: "Jun" }, { v: 24, l: "Jul" }, { v: 35, l: "Ago" },
];

export default function CreatorDashboard() {
  const [active, setActive] = useState("home");
  return (
    <DashboardShell title="Creator Dashboard" navItems={navItems} active={active} onSelect={setActive}>
      <SectionRenderer active={active} />
    </DashboardShell>
  );
}

function SectionRenderer({ active }) {
  switch (active) {
    case "home":
      return <HomeSection />;
    case "products":
      return <ProductsSection />;
    case "create-product":
      return <CreateProductSection />;
    case "studio":
      return <StudioSection />;
    case "bots":
      return <BotsSection />;
    case "create-bot":
      return <CreateBotSection />;
    case "backtest":
      return <BacktestSection />;
    case "paper":
      return <PaperSection />;
    case "wallet":
      return <WalletSection />;
    case "withdrawals":
      return <WithdrawalsSection />;
    case "affiliates":
      return <AffiliatesSection />;
    case "sales":
      return <SalesSection />;
    case "commissions":
      return <CommissionsSection />;
    case "stats":
      return <StatsSection />;
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

function CreateBotSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Crear bot" />
      <Panel>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="Nombre del bot" placeholder="Ej. Apex BTC Pro" />
          <FormField label="Timeframe" placeholder="1m / 5m / 15m / 1H / 4H / 1D" />
          <FormField label="Stop Loss (%)" placeholder="2" type="number" />
          <FormField label="Take Profit (%)" placeholder="4" type="number" />
          <FormField label="Trailing Stop (%)" placeholder="1.5" type="number" />
          <FormField label="Máx. pérdida diaria (%)" placeholder="5" type="number" />
          <FormField label="Máx. drawdown (%)" placeholder="15" type="number" />
          <FormField label="Núm. máx. operaciones" placeholder="10" type="number" />
        </div>
        <div className="mt-4">
          <Label className="mb-2 block">Estrategia e indicadores</Label>
          <textarea
            placeholder="Describe la estrategia, indicadores y reglas de entrada/salida..."
            rows={4}
            className="w-full rounded-xl bg-secondary/50 border border-border p-3 text-sm outline-none focus:border-primary resize-none"
          />
        </div>
        <div className="mt-5 flex gap-3">
          <Button className="h-11 px-6">Guardar bot</Button>
          <Button variant="outline" className="h-11 px-6 bg-transparent border-border hover:bg-secondary">Ejecutar backtest</Button>
        </div>
      </Panel>
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
  return (
    <div className="space-y-4">
      <SectionHeader title="Wallet" />
      <div className="grid sm:grid-cols-3 gap-4">
        <BalanceCard label="Saldo disponible" value="$4,820" tone="primary" />
        <BalanceCard label="Saldo pendiente" value="$1,240" tone="yellow" />
        <BalanceCard label="Saldo retenido" value="$320" tone="muted" />
      </div>
      <Panel>
        <PanelHeader title="Historial reciente" />
        <div className="space-y-2">
          {["Venta directa · Apex BTC Pro +$25", "Comisión afiliado · Funnel AI Pack +$9.80", "Retiro solicitado -$1,000"].map((h, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
              <span className="text-muted-foreground">{h}</span>
              <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          ))}
        </div>
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