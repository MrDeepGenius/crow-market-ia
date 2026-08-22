import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Play, Pause, Square, Zap, Loader2, Bot, TrendingUp, Activity, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const STATUS = {
  idle: { label: "Detenido", color: "bg-muted text-muted-foreground" },
  running: { label: "Ejecutando", color: "bg-green-400/15 text-green-400" },
  paused: { label: "Pausado", color: "bg-yellow-400/15 text-yellow-400" },
  stopped: { label: "Detenido", color: "bg-red-400/15 text-red-400" },
};

const LEVEL_COLOR = {
  info: "text-muted-foreground",
  signal: "text-blue-400",
  order: "text-green-400",
  warn: "text-yellow-400",
  error: "text-red-400",
};

// Tarjeta de una instancia de bot del comprador: PLAY/PAUSE/STOP, tick manual, posicion, stats y logs.
export default function BotInstanceCard({ instance, connection, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState([]);
  const [ticking, setTicking] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const timerRef = useRef(null);

  const loadLogs = async () => {
    try {
      const rows = await base44.entities.BotLog.filter({ instance_id: instance.id }, "-created_date", 50);
      setLogs(rows || []);
    } catch (e) {}
  };

  const doTick = async (auto = false) => {
    setTicking(true);
    try {
      const res = await base44.functions.invoke("runBotTick", { instanceId: instance.id });
      const d = res?.data || res;
      if (d?.error) {
        if (!auto) toast({ variant: "destructive", title: "Tick fallido", description: d.error });
      } else {
        onChanged?.();
        loadLogs();
      }
    } catch (e) {
      if (!auto) toast({ variant: "destructive", title: "Tick fallido", description: e?.message });
    } finally { setTicking(false); }
  };

  useEffect(() => {
    loadLogs();
    if (instance.status === "running") {
      timerRef.current = setInterval(() => doTick(true), 20000);
      return () => clearInterval(timerRef.current);
    }
  }, [instance.id, instance.status]);

  const setStatus = async (status) => {
    setBusy(true);
    try {
      const update = { status };
      if (status === "running" && !instance.started_at) update.started_at = new Date().toISOString();
      if (status === "stopped") update.stopped_at = new Date().toISOString();
      await base44.entities.BotInstance.update(instance.id, update);
      toast({ title: `Bot ${STATUS[status].label.toLowerCase()}` });
      onChanged?.();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e?.message });
    } finally { setBusy(false); }
  };

  const st = STATUS[instance.status] || STATUS.idle;
  const stats = instance.stats || { trades: 0, wins: 0, losses: 0, pnl: 0 };
  const pos = instance.position;
  const hasConnection = !!connection || !!instance.connection_id;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{instance.bot_name}</p>
            <p className="text-xs text-muted-foreground">{instance.symbol} · {instance.timeframe} · Capital {Number(instance.capital).toFixed(0)} USDT</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${st.color}`}>● {st.label}</span>
      </div>

      {!hasConnection && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/15 text-xs text-muted-foreground">
          <LinkIcon className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          Conectá tu cuenta Binance Testnet para poder ejecutar órdenes.
        </div>
      )}

      {/* Posicion + stats */}
      <div className="mt-4 grid sm:grid-cols-4 gap-3">
        <Stat label="Posición" value={pos ? `${pos.side === "long" ? "LONG" : "SHORT"} @ ${pos.entryPrice}` : "Sin posición"} />
        <Stat label="Operaciones" value={stats.trades || 0} />
        <Stat label="Wins / Losses" value={`${stats.wins || 0} / ${stats.losses || 0}`} />
        <Stat label="P&L" value={`${(stats.pnl || 0) >= 0 ? "+" : ""}${Number(stats.pnl || 0).toFixed(2)} USDT`} tone={stats.pnl >= 0 ? "green" : "red"} />
      </div>

      {/* Controles */}
      <div className="mt-4 flex flex-wrap gap-2">
        {instance.status !== "running" ? (
          <Button size="sm" onClick={() => setStatus("running")} disabled={busy || !hasConnection} className="bg-green-500 hover:bg-green-500/90">
            <Play className="w-4 h-4 mr-1" /> PLAY
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setStatus("paused")} disabled={busy} className="bg-transparent border-border hover:bg-secondary">
            <Pause className="w-4 h-4 mr-1" /> PAUSA
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => setStatus("stopped")} disabled={busy || instance.status === "stopped"} className="bg-transparent border-border hover:bg-secondary">
          <Square className="w-4 h-4 mr-1" /> STOP
        </Button>
        <Button size="sm" variant="outline" onClick={() => doTick(false)} disabled={ticking || instance.status !== "running"} className="bg-transparent border-border hover:bg-secondary">
          {ticking ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Zap className="w-4 h-4 mr-1" />} Evaluar ahora
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setShowLogs((s) => !s); if (!showLogs) loadLogs(); }} className="text-muted-foreground">
          <Activity className="w-4 h-4 mr-1" /> {showLogs ? "Ocultar logs" : "Ver logs"}
        </Button>
      </div>

      {showLogs && (
        <div className="mt-4 rounded-xl bg-background/60 border border-border p-3 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Sin eventos registrados.</p>
          ) : (
            <div className="space-y-1.5">
              {logs.map((l) => (
                <div key={l.id} className="text-xs flex gap-2">
                  <span className="text-muted-foreground/60 shrink-0">{l.created_date ? new Date(l.created_date).toLocaleTimeString() : ""}</span>
                  <span className={`font-semibold shrink-0 uppercase ${LEVEL_COLOR[l.level] || "text-muted-foreground"}`}>{l.level}</span>
                  <span className="text-foreground/90">{l.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  const toneClass = tone === "green" ? "text-green-400" : tone === "red" ? "text-red-400" : "text-foreground";
  return (
    <div className="rounded-xl bg-secondary/40 border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold mt-1 truncate ${toneClass}`}>{value}</p>
    </div>
  );
}