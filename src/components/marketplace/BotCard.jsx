import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, Activity, Gauge } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import Sparkline from "@/components/marketplace/Sparkline";

const riskTone = {
  Bajo: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Medio: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Alto: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

export default function BotCard({ p, i = 0, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: i * 0.05 }}
      onClick={() => onOpen(p)}
      className="group relative glass rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative h-40 overflow-hidden">
        <Image src={p.image} alt={p.name} className="w-full h-full" fittingType="fill" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        {p.featured && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 uppercase tracking-wider">
            Destacado
          </span>
        )}
        {p.verified && (
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Validado
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-[11px] text-muted-foreground">{p.creator}</p>
          <h3 className="font-semibold text-base leading-tight">{p.name}</h3>
        </div>

        <div className="rounded-xl bg-background/50 border border-border p-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Activity className="w-3 h-3" /> P&L 30d
            </span>
            <span className={`text-xs font-bold flex items-center gap-1 ${p.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              <TrendingUp className="w-3 h-3" /> {p.pnl >= 0 ? "+" : ""}{p.pnl}%
            </span>
          </div>
          <Sparkline data={p.curve} color="#22d3ee" height={40} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-background/40 border border-border py-1.5">
            <p className="text-[9px] uppercase text-muted-foreground">Win Rate</p>
            <p className="text-sm font-bold text-cyan-400">{p.winRate}%</p>
          </div>
          <div className="rounded-lg bg-background/40 border border-border py-1.5">
            <p className="text-[9px] uppercase text-muted-foreground">Mercado</p>
            <p className="text-[11px] font-semibold truncate px-1">{p.timeframe.split(" · ")[1] || p.timeframe}</p>
          </div>
          <div className="rounded-lg bg-background/40 border border-border py-1.5">
            <p className="text-[9px] uppercase text-muted-foreground flex items-center justify-center gap-0.5">
              <Gauge className="w-2.5 h-2.5" /> Riesgo
            </p>
            <p className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full border inline-block ${riskTone[p.risk]}`}>
              {p.risk}
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between pt-1">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold">${p.rentPrice}</span>
              <span className="text-[11px] text-muted-foreground">/mes</span>
            </div>
            <p className="text-[11px] text-muted-foreground">o compra ${p.buyPrice}</p>
          </div>
          <Button size="sm" className="h-9 px-4" onClick={(e) => { e.stopPropagation(); onOpen(p); }}>
            Alquilar Bot
          </Button>
        </div>
      </div>
    </motion.div>
  );
}