import React, { useState } from "react";
import {
  LayoutDashboard, Wand2, Crown, Bot, Package, History, Wallet, Settings,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import AffiliateKpis from "@/components/affiliate/AffiliateKpis";
import LandingBuilder from "@/components/affiliate/LandingBuilder";
import CrowLicenseModule from "@/components/affiliate/CrowLicenseModule";
import SalesCopilot from "@/components/affiliate/SalesCopilot";
import ProductsAffiliationTable from "@/components/affiliate/ProductsAffiliationTable";
import SalesHistory from "@/components/affiliate/SalesHistory";

const navItems = [
  { id: "home", label: "Inicio", icon: LayoutDashboard },
  { id: "landings", label: "Landings IA", icon: Wand2 },
  { id: "licencia", label: "Licencia Crow", icon: Crown },
  { id: "copiloto", label: "Copiloto IA", icon: Bot },
  { id: "productos", label: "Productos", icon: Package },
  { id: "historial", label: "Historial", icon: History },
  { id: "wallet", label: "Wallet & Retiros", icon: Wallet },
  { id: "settings", label: "Configuración", icon: Settings },
];

export default function AffiliateDashboard() {
  const [active, setActive] = useState("home");

  return (
    <DashboardShell title="Affiliate Dashboard" navItems={navItems} active={active} onSelect={setActive}>
      <SectionRenderer active={active} onNavigate={setActive} />
    </DashboardShell>
  );
}

function SectionRenderer({ active, onNavigate }) {
  switch (active) {
    case "home":
      return <Overview onNavigate={onNavigate} />;
    case "landings":
      return <LandingBuilder />;
    case "licencia":
      return <CrowLicenseModule />;
    case "copiloto":
      return <SalesCopilot />;
    case "productos":
      return <ProductsAffiliationTable onCreateLanding={() => onNavigate("landings")} />;
    case "historial":
      return <SalesHistory />;
    case "wallet":
      return <WalletSection />;
    case "settings":
      return <Placeholder title="Configuración" desc="Gestiona tu cuenta, seguridad y preferencias de afiliado." />;
    default:
      return <Overview onNavigate={onNavigate} />;
  }
}

function Overview({ onNavigate }) {
  return (
    <div className="space-y-6">
      <AffiliateKpis onRequestWithdraw={() => onNavigate("wallet")} />
      <LandingBuilder />
      <CrowLicenseModule />
      <SalesCopilot />
      <ProductsAffiliationTable onCreateLanding={() => onNavigate("landings")} />
      <SalesHistory />
    </div>
  );
}

function WalletSection() {
  return (
    <div className="space-y-4">
      <SectionHeader title="Wallet & Retiros" />
      <div className="glass rounded-2xl p-5">
        <p className="text-xs text-muted-foreground">Saldo disponible (USDT)</p>
        <p className="text-3xl font-bold mt-1">$1,842.50</p>
        <button className="mt-4 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          Solicitar Retiro
        </button>
      </div>
      <SalesHistory />
    </div>
  );
}

function SectionHeader({ title }) {
  return <h2 className="font-heading font-bold text-xl">{title}</h2>;
}

function Placeholder({ title, desc }) {
  return (
    <div className="glass rounded-2xl p-5 text-center py-16">
      <h2 className="font-heading font-bold text-xl">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{desc}</p>
    </div>
  );
}