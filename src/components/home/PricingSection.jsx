import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Crown, Zap, Sparkles, Lock } from "lucide-react";
import { CREATOR_PLANS } from "@/lib/plans";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: "easeOut" } }),
};

const planIcons = { bronce: Zap, plata: Sparkles, oro: Crown, diamante: Crown };

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Licencias de Creador</p>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight">Planes para crear y publicar</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            El acceso gratuito es solo para explorar el marketplace. Para crear bots, productos y publicar necesitas una licencia de creador activa.
          </p>
        </div>

        <div className="mb-10 max-w-3xl mx-auto flex items-center gap-3 rounded-2xl border border-border bg-secondary/20 p-4 text-sm">
          <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">Cuenta gratuita:</strong> explorar el marketplace y comprar productos.{" "}
            <span className="text-foreground">No permite crear bots ni productos.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CREATOR_PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} i={i} />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Renovación manual o automática · Se cobra al vencer el plan
        </p>
      </div>
    </section>
  );
}

function PlanCard({ plan, i }) {
  const Icon = planIcons[plan.id] || Sparkles;
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      custom={i}
      variants={fadeUp}
      className={`relative glass rounded-2xl p-6 flex flex-col ${plan.highlight ? "border-primary glow-violet" : ""}`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3 py-1 rounded-full bg-primary text-primary-foreground">
          Más popular
        </span>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.highlight ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-lg">{plan.name}</h3>
          <p className="text-xs text-muted-foreground">{plan.tagline}</p>
        </div>
      </div>

      <div className="mb-5">
        <span className="font-heading font-extrabold text-4xl">${plan.priceUsd}</span>
        <span className="text-sm text-muted-foreground"> / {plan.periodLabel}</span>
      </div>

      <ul className="space-y-2.5 text-sm mb-6 flex-1">
        <Feature>{plan.aiCredits} mensajes de IA</Feature>
        <Feature>{plan.maxBots} bots o productos</Feature>
        <Feature>{plan.maxPublications} publicaciones</Feature>
        {plan.vipSupport && <Feature>Soporte VIP prioritario</Feature>}
        <Feature>Backtesting y paper trading</Feature>
      </ul>

      <Link
        to="/register"
        className={`inline-flex items-center justify-center h-11 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "glass hover:bg-secondary/60"}`}
      >
        Elegir {plan.name}
      </Link>
    </motion.div>
  );
}

function Feature({ children }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <span className="text-muted-foreground">{children}</span>
    </li>
  );
}