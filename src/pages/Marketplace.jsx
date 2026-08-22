import React from "react";
import { Sparkles, LogOut } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import MarketplaceBrowser from "@/components/marketplace/MarketplaceBrowser";

export default function Marketplace() {
  const { isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await base44.auth.logout("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {!isAuthenticated && <PublicNavbar />}
      {isAuthenticated && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl glass border border-border hover:bg-secondary/60 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesion
          </button>
        </div>
      )}
      <div className="fixed inset-0 -z-10 grid-bg opacity-20" />
      <div className="fixed -top-1/4 left-1/3 -z-10 w-[50rem] h-[50rem] rounded-full bg-[radial-gradient(circle,hsl(276_91%_55%_/_0.14),transparent_60%)] blur-3xl" />
      <div className="fixed top-1/3 -right-1/4 -z-10 w-[40rem] h-[40rem] rounded-full bg-[radial-gradient(circle,hsl(190_90%_50%_/_0.10),transparent_60%)] blur-3xl" />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-8 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary mb-5">
          <Sparkles className="w-3 h-3" /> Marketplace Crow Market
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight max-w-3xl mx-auto leading-tight">
          Descubre herramientas, <span className="text-gradient-violet">bots de trading e IA</span> validados para potenciar tu negocio
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm sm:text-base">
          Compra o alquila bots auditados, infoproductos y herramientas de IA. Resultados verificados, conversion rapida.
        </p>
      </section>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <MarketplaceBrowser />
      </div>
    </div>
  );
}