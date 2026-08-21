import React from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, Bot, Wallet, Users } from "lucide-react";

const data = [
  { v: 12 }, { v: 18 }, { v: 15 }, { v: 24 }, { v: 22 }, { v: 31 }, { v: 28 },
  { v: 38 }, { v: 42 }, { v: 39 }, { v: 52 }, { v: 61 },
];

export default function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
      className="relative"
      style={{ perspective: 1200 }}
    >
      {/* glow */}
      <div className="absolute -inset-6 bg-[radial-gradient(circle_at_60%_30%,hsl(276_91%_60%_/_0.35),transparent_60%)] blur-2xl" />

      <div className="relative glass-strong rounded-3xl p-5 shadow-2xl">
        {/* top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="text-xs text-muted-foreground font-mono">nexus.io/dashboard</div>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Stat icon={Wallet} label="Balance" value="$12,480" trend="+18%" />
          <Stat icon={TrendingUp} label="Ventas" value="342" trend="+24%" />
          <Stat icon={Users} label="Afiliados" value="58" trend="+9%" />
        </div>

        {/* chart */}
        <div className="rounded-2xl bg-secondary/40 border border-border p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Ingresos · 30 días</span>
            <span className="text-xs font-semibold text-primary flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +42.6%
            </span>
          </div>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(276 91% 60%)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(276 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: "hsl(250 16% 8%)",
                    border: "1px solid hsl(260 14% 22%)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ display: "none" }}
                />
                <Area type="monotone" dataKey="v" stroke="hsl(276 91% 65%)" strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* bot row */}
        <div className="flex items-center gap-3 rounded-2xl bg-secondary/40 border border-border p-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Apex BTC Pro</p>
            <p className="text-xs text-muted-foreground">Activo · Win rate 64% · 12 ops hoy</p>
          </div>
          <span className="text-xs font-semibold text-green-400 px-2.5 py-1 rounded-full bg-green-400/10 border border-green-400/20">
            ● LIVE
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value, trend }) {
  return (
    <div className="rounded-2xl bg-secondary/40 border border-border p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] text-green-400 font-medium">{trend}</p>
    </div>
  );
}