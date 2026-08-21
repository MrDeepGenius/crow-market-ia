import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function PublicNavbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-4 flex items-center justify-between rounded-2xl glass px-4 sm:px-6 h-14">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center glow-violet">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight">NEXUS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Plataforma</a>
            <a href="#marketplace" className="hover:text-foreground transition-colors">Marketplace</a>
            <a href="#how" className="hover:text-foreground transition-colors">Cómo funciona</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 sm:px-4 py-2 rounded-xl hover:bg-secondary/60 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors glow-violet"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}