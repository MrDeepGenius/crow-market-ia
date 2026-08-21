import React, { useState } from "react";
import {
  LayoutDashboard, Store, Link2, ShoppingBag, TrendingUp, DollarSign, Wallet,
  ArrowDownToLine, BarChart3, BookOpen, GraduationCap, Settings, Copy, Users, Activity,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const navItems = [
  { id: "home", label: "Inicio", icon: LayoutDashboard },
  { id: "marketplace", label: "Marketplace", icon: Store },
  { id: "my-affiliates", label: "Mis productos afiliados", icon: ShoppingBag },
  { id: "links", label: "Links de afiliado", icon: Link2 },
  { id: "sales", label: "Ventas", icon: TrendingUp },
  { id: "commissions", label: "Comisiones", icon: DollarSign },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "withdrawals", label: "Retiros", icon: ArrowDownToLine },
  { id: "stats", label: "Estadísticas", icon: BarChart3 },
  { id: "resources", label: "Recursos de marketing", icon: BookOpen },
  { id: "tutorials", label: "Tutoriales", icon: GraduationCap },
  { id: "settings", label: "Configuración", icon: Settings },
];

const chartData = [
  { v: 4, l: "Ene" }, { v: 7, l: "Feb" }, { v: 6, l: "Mar" }, { v: 12, l: "Abr" },
  { v: 10, l: "May" }, { v: 16, l: "Jun" }, { v: 14, l: "Jul" }, { v: 22, l: "Ago" },
];

export default function AffiliateDashboard() {
  const [active, setActive] = useState("home");
  return (
    <DashboardShell title="Affiliate Dashboard" navItems={navItems} active={active} onSelect={setActive}>
      <SectionRenderer active={active} />
    </DashboardShell>
  );
}

function SectionRenderer({ active }) {
  switch (active) {
    case "home": return <HomeSection />;
    case "marketplace": return <Placeholder title="Marketplace" desc="Explora productos para promocionar y genera tu link de afiliado." icon={Store} />;
    case "my-affiliates": return <MyAffiliatesSection />;
    case "links": return <LinksSection />;
    case "sales": return <SalesSection />;
    case "commissions": return <CommissionsSection />;
    case "wallet": return <WalletSection />;
    case "withdrawals": return <WithdrawalsSection />;
    case "stats": return <StatsSection />;
    case "resources": return <Placeholder title="Recursos de marketing" desc="Banners, copys y materiales listos para tus campañas." icon={BookOpen} />;
    case "tutorials": return <Placeholder title="Tutoriales" desc="Aprende a promocionar y escalar tus comisiones." icon={GraduationCap} />;
    case "settings": return <Placeholder title="Configuración" desc="Gestiona tu cuenta y preferencias." icon={Settings} />;
    default: return <HomeSection />;
  }
}

function HomeSection() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Comisiones totales" value="$3,240" trend="+22%" icon={DollarSign} />
        <StatCard label="Ventas atribuidas" value="186" trend="+18%" icon={TrendingUp} />
        <StatCard label="Clicks en links" value="4,920" trend="+31%" icon={Link2} />
        <StatCard label="Productos afiliados" value="12" trend="+3" icon={ShoppingBag} />
      </div>
      <Panel className="lg:col-span-2">
        <PanelHeader title="Comisiones · últimos 8 meses" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(276 91% 60%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(276 91% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="l" stroke="hsl(265 10% 62%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(250 16% 8%)", border: "1px solid hsl(260 14% 22%)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="v" stroke="hsl(276 91% 65%)" strokeWidth={2.5} fill="url(#ag)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}

function MyAffiliatesSection() {
  const items = [
    { n: "Apex BTC Pro", c: "20%", v: "$1,240" },
    { n: "Funnel AI Pack", c: "20%", v: "$980" },
    { n: "Copywriter AI Studio", c: "15%", v: "$420" },
  ];
  return (
    <div className="space-y-4">
      <SectionHeader title="Mis productos afiliados" />
      <div className="grid gap-3">
        {items.map((it) => (
          <Panel key={it.n} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{it.n}</p>
                <p className="text-xs text-muted-foreground">Comisión {it.c} · Generado {it.v}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="bg-transparent border-border hover:bg-secondary">Ver link</Button>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function LinksSection() {
  const links = [
    { p: "Apex BTC Pro", u: "nexus.io/r/APEXBTC/ANA24" },
    { p: "Funnel AI Pack", u: "nexus.io/r/FUNNEL/ANA24" },
  ];
  return (
    <div className="space-y-4">
      <SectionHeader title="Links de afiliado" />
      {links.map((l) => (
        <Panel key={l.p} className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-semibold">{l.p}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">{l.u}</p>
          </div>
          <Button size="sm" variant="outline" className="bg-transparent border-border hover:bg-secondary shrink-0">
            <Copy className="w-4 h-4 mr-1.5" /> Copiar
          </Button>
        </Panel>
      ))}
    </div>
  );
}

function SalesSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Ventas atribuidas" />
      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard label="Ventas totales" value="186" trend="+18%" icon={TrendingUp} />
        <StatCard label="Tasa de conversión" value="3.8%" trend="+0.6%" icon={Users} />
      </div>
    </div>
  );
}

function CommissionsSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Comisiones" />
      <Panel>
        <div className="space-y-2 text-sm">
          {["Apex BTC Pro · +$5.00", "Funnel AI Pack · +$9.80", "Copywriter AI Studio · +$4.35"].map((c, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-muted-foreground">{c}</span>
              <DollarSign className="w-3.5 h-3.5 text-primary" />
            </div>
          ))}
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
        <BalanceCard label="Saldo disponible" value="$2,820" tone="primary" />
        <BalanceCard label="Saldo pendiente" value="$420" tone="yellow" />
        <BalanceCard label="Saldo retenido" value="$0" tone="muted" />
      </div>
    </div>
  );
}

function WithdrawalsSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Retiros" />
      <Panel>
        <div className="space-y-4">
          <FormField label="Monto a retirar (US$)" placeholder="500" type="number" />
          <FormField label="Destino" placeholder="Cuenta bancaria / USDT (TRC20)" />
        </div>
        <Button className="mt-4 h-11 px-6">Solicitar retiro</Button>
      </Panel>
    </div>
  );
}

function StatsSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Estadísticas" />
      <Panel>
        <PanelHeader title="Rendimiento de afiliado" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="asg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(276 91% 60%)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(276 91% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="l" stroke="hsl(265 10% 62%)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(250 16% 8%)", border: "1px solid hsl(260 14% 22%)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="v" stroke="hsl(276 91% 65%)" strokeWidth={2.5} fill="url(#asg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}

/* shared */
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
function SectionHeader({ title }) {
  return <h2 className="font-heading font-bold text-xl">{title}</h2>;
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
  const tones = { primary: "text-primary", yellow: "text-yellow-400", muted: "text-muted-foreground" };
  return (
    <Panel>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${tones[tone]}`}>{value}</p>
    </Panel>
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