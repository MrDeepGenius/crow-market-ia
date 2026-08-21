import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import BrandLogo from "@/components/BrandLogo";

export default function PublicNavbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mt-4 flex items-center justify-between rounded-2xl glass px-4 sm:px-6 h-16">
          <BrandLogo size="lg" to="/" wordClass="hidden sm:inline" />

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