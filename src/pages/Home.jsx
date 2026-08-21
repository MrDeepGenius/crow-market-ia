import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Bot, Palette, Megaphone, Wallet, Cpu, ShieldCheck, LineChart, Sparkles, Store,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import HeroVisual from "@/components/home/HeroVisual";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { Image } from "@/components/ui/image";
import BrandLogo from "@/components/BrandLogo";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: "easeOut" } }),
};

const features = [
  { icon: Cpu, title: "Inteligencia Artificial", desc: "Copys, funnels y análisis de bots generados por IA. Automatiza sin código." },
  { icon: Bot, title: "Bots de Trading", desc: "Crea, prueba con backtest y paper trading, y publica bots en el marketplace." },
  { icon: Store, title: "Marketplace Premium", desc: "Vende infoproductos, herramientas y bots. Comisiones de afiliado configurables." },
  { icon: Megaphone, title: "Marketing de Afiliados", desc: "Activa afiliados por producto y escala tus ventas con comisiones 15%–20%." },
  { icon: Wallet, title: "Wallet y Retiros", desc: "Saldo disponible, pendiente y retenido. Retiros de comisiones e ingresos." },
  { icon: ShieldCheck, title: "Seguridad y Riesgo", desc: "APIs con permisos restringidos, Kill Switch y gestión de riesgo por bot." },
];

const steps = [
  { n: "01", t: "Regístrate", d: "Crea tu cuenta como creador o afiliado en minutos." },
  { n: "02", t: "Crea", d: "Diseña productos, herramientas o bots con el Creator Studio." },
  { n: "03", t: "Prueba", d: "Backtest y paper trading con análisis IA antes de publicar." },
  { n: "04", t: "Publica", d: "Configura precio, comisiones y disponibilidad en el marketplace." },
  { n: "05", t: "Vende y Afilia", d: "Recibe ventas directas y de afiliados atribuidas a tu enlace." },
  { n: "06", t: "Escala", d: "Monetiza, retira y haz crecer tu negocio dentro del ecosistema." },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* backdrop */}
      <div className="fixed inset-0 -z-10 bg-background" />
      <div className="fixed inset-0 -z-10 grid-bg opacity-30" />
      <div className="fixed -top-1/3 left-1/4 -z-10 w-[60rem] h-[60rem] rounded-full bg-[radial-gradient(circle,hsl(276_91%_55%_/_0.18),transparent_60%)] blur-3xl" />
      <div className="fixed top-1/3 -right-1/4 -z-10 w-[50rem] h-[50rem] rounded-full bg-[radial-gradient(circle,hsl(300_80%_50%_/_0.14),transparent_60%)] blur-3xl" />

      <PublicNavbar />

      {/* HERO */}
      <section className="relative pt-32 sm:pt-40 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <BrandLogo size="2xl" className="mb-6" />
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Economía de creadores + IA + Trading
            </div>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              Bienvenido a la nueva generación de <span className="text-gradient-violet">afiliados y creadores con IA</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Lanza, escala y automatiza tu negocio de infoproductos, herramientas y bots inteligentes en minutos.
              Copys, funnels, automatizaciones y ventas globales impulsadas por Inteligencia Artificial.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold glow-violet hover:bg-primary/90 transition-colors group"
              >
                Crear mi cuenta gratis
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#marketplace"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 py-3.5 rounded-xl glass font-semibold hover:bg-secondary/60 transition-colors"
              >
                Explorar Marketplace
              </a>
            </div>
            <p className="mt-6 text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              Crea. Publica. Vende. Escala.
            </p>
          </motion.div>

          <HeroVisual />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="La plataforma" title="Un ecosistema tecnológico completo" subtitle="Todo lo que necesitas para crear, automatizar y monetizar en un solo lugar." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                custom={i}
                variants={fadeUp}
                className="group glass rounded-2xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <f.icon className="w-5 h-5 text-primary group-hover:text-white" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETPLACE PREVIEW */}
      <section id="marketplace" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="Marketplace" title="Productos y bots premium" subtitle="Descubre herramientas validadas y bots de trading listos para activar." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SAMPLE_PRODUCTS.slice(0, 3).map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass font-semibold hover:bg-secondary/60 transition-colors group"
            >
              Ver todo el marketplace
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="El ciclo" title="De la idea al ingreso" subtitle="Recorre todo el ciclo dentro de una experiencia tecnológica única." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                custom={i}
                variants={fadeUp}
                className="relative glass rounded-2xl p-6"
              >
                <span className="font-heading font-extrabold text-3xl text-primary/30">{s.n}</span>
                <h3 className="font-semibold text-lg mt-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative glass-strong rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
            <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-[radial-gradient(circle,hsl(276_91%_60%_/_0.25),transparent_60%)] blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs mb-5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Empieza gratis hoy
              </div>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight">
                Construye tu negocio con IA, <span className="text-gradient-violet">desde hoy</span>
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Únete a la nueva generación de creadores y afiliados. Crea, prueba, publica y monetiza dentro del ecosistema CrowMarket.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 h-12 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold glow-violet hover:bg-primary/90 transition-colors group"
              >
                Crear mi cuenta gratis
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border bg-secondary/20 p-6 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Importante:</strong> Los resultados de backtesting, paper trading y
            cualquier rendimiento histórico no garantizan resultados futuros. El trading implica riesgo y puede producir
            pérdidas, incluida la pérdida parcial o total del capital. La plataforma proporciona infraestructura
            tecnológica y herramientas. La disponibilidad de ejecución real depende de las integraciones, exchanges,
            brokers y jurisdicciones correspondientes. Ningún contenido constituye una garantía de rentabilidad ni
            asesoramiento financiero personalizado. Las comisiones de afiliados dependen de ventas efectivamente
            atribuidas y de las condiciones establecidas para cada producto.
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" to="/" />
          <p className="text-xs text-muted-foreground">© 2026 CrowMarket · Infraestructura tecnológica para creadores y afiliados.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">{eyebrow}</p>
      <h2 className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight">{title}</h2>
      <p className="mt-3 text-muted-foreground max-w-xl mx-auto">{subtitle}</p>
    </motion.div>
  );
}

function ProductCard({ p, i = 0 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      custom={i}
      variants={fadeUp}
      className="group glass rounded-2xl overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden">
        <Image src={p.image} alt={p.name} className="w-full h-full" fittingType="fill" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <span className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary">
          {p.tag}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{p.creator}</span>
          <span className="flex items-center gap-1">
            <span className="text-yellow-400">★</span> {p.rating}
          </span>
        </div>
        <h3 className="font-semibold text-lg">{p.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="font-bold text-lg">US${p.price}</span>
            <span className="text-xs text-muted-foreground"> / {p.period}</span>
          </div>
          {p.affiliate && (
            <span className="text-xs font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/10">
              Comisión {p.commission}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}