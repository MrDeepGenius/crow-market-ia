import React from "react";
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap, Bot } from "lucide-react";

const BENEFIT_ICONS = [TrendingUp, Shield, Zap];

// Renderiza la landing generada como una pagina visual real (hero, beneficios, pasos, CTA).
// Todos los botones apuntan al link de afiliado unico del usuario.
export default function LandingPreview({ landing, affiliateLink, product }) {
  return (
    <div className="min-h-full bg-gradient-to-b from-background via-background to-primary/5 text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 text-center">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-[radial-gradient(ellipse,hsl(276_91%_60%_/_0.28),transparent_60%)] blur-2xl" />
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/20 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> {product?.category || "Trading con IA"}
          </span>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-fuchsia-500/20 flex items-center justify-center mx-auto mb-6">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl leading-tight">{landing.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{landing.subtitle}</p>
          <div className="mt-8">
            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition glow-violet"
            >
              {landing.cta} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      {landing.benefits?.length > 0 && (
        <section className="px-6 py-12 max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            {landing.benefits.map((b, i) => {
              const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
              return (
                <div key={i} className="glass rounded-2xl p-5 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium leading-snug">{b}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pasos */}
      {landing.steps?.length > 0 && (
        <section className="px-6 py-14 max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-2xl text-center mb-10">Cómo funciona</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {landing.steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mb-3">
                  {i + 1}
                </div>
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto glass-strong rounded-3xl p-8">
          <h3 className="font-heading font-bold text-2xl">{landing.title}</h3>
          <p className="text-muted-foreground mt-2">Actívalo hoy con tu link de afiliado exclusivo.</p>
          <a
            href={affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
          >
            {landing.cta} <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}