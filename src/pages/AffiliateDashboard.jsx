import React, { useState } from "react";
import {
  LayoutDashboard, Wand2, Crown, Bot, Package, History, Wallet, Settings, Store,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import AffiliateKpis from "@/components/affiliate/AffiliateKpis";
import LandingBuilder from "@/components/affiliate/LandingBuilder";
import CrowLicenseModule from "@/components/affiliate/CrowLicenseModule";
import SalesCopilot from "@/components/affiliate/SalesCopilot";
import ProductsAffiliationTable from "@/components/affiliate/ProductsAffiliationTable";
import SalesHistory from "@/components/affiliate/SalesHistory";
import WithdrawalPanel from "@/components/affiliate/WithdrawalPanel";
import AffiliateMarketplace from "@/components/affiliate/AffiliateMarketplace";

const navItems = [
  { id: "home", label: "Inicio", icon: LayoutDashboard },
  { id: "landings", label: "Landings IA", icon: Wand2 },
  { id: "licencia", label: "Licencia Crow", icon: Crown },
  { id: "copiloto", label: "Copiloto IA", icon: Bot },
  { id: "productos", label: "Productos", icon: Package },
  { id: "marketplace", label: "Marketplace", icon: Store },
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
    case "marketplace":
      return <AffiliateMarketplace onCreateLanding={() => onNavigate("landings")} />;
    case "historial":
      return <SalesHistory />;
    case "wallet":
      return <WithdrawalPanel />;
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

function Placeholder({ title, desc }) {
  return (
    <div className="glass rounded-2xl p-5 text-center py-16">
      <h2 className="font-heading font-bold text-xl">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{desc}</p>
    </div>
  );
}