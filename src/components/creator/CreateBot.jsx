import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wrench, ArrowLeft, Loader2, RefreshCw, Save, Edit3, Bot, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Create Bot flow (spec §14-15): choose IA vs Manual, then generate or configure.
export default function CreateBot({ onSaved }) {
  const [mode, setMode] = useState("choose"); // "choose" | "ia" | "manual"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl">Crear nuevo bot</h2>
        {mode !== "choose" && (
          <Button variant="ghost" size="sm" onClick={() => setMode("choose")} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {mode === "choose" && (
          <motion.div key="choose" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <p className="text-sm text-muted-foreground mb-5">¿Cómo quieres crear tu bot?</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <ChoiceCard
                icon={Sparkles}
                title="Crear con IA"
                desc="Describe tu estrategia en lenguaje natural y la IA genera la configuración completa."
                cta="✨ Crear con IA"
                onClick={() => setMode("ia")}
                highlight
              />
              <ChoiceCard
                icon={Wrench}
                title="Crear manualmente"
                desc="Configura tú mismo cada parámetro: mercado, indicadores, reglas y riesgo."
                cta="🛠️ Crear manualmente"
                onClick={() => setMode("manual")}
              />
            </div>
          </motion.div>
        )}

        {mode === "ia" && (
          <motion.div key="ia" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <IABotBuilder onSaved={onSaved} />
          </motion.div>
        )}

        {mode === "manual" && (
          <motion.div key="manual" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <ManualBotBuilder onSaved={onSaved} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IABotBuilder({ onSaved }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bot, setBot] = useState(null);

  const example = "Quiero un bot para BTC/USDT en 15 minutos. Usar EMA 20 y EMA 50 para detectar tendencia, RSI para confirmar entradas, máximo 1% de riesgo por operación y Stop Loss y Take Profit.";

  const generate = async () => {
    setError("");
    if (description.trim().length < 10) {
      setError("Describe tu bot con más detalle (mín. 10 caracteres).");
      return;
    }
    setLoading(true);
    setBot(null);
    try {
      const res = await base44.functions.invoke("generateBotConfig", { description });
      setBot(res.data?.bot || null);
      if (!res.data?.bot) setError("No se pudo generar la configuración. Intenta nuevamente.");
    } catch (err) {
      setError(err.message || "Error al generar la configuración.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5">
        <Label className="mb-2 block">Describe el bot que quieres crear</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={example}
          rows={5}
          className="w-full rounded-xl bg-secondary/50 border border-border p-3 text-sm outline-none focus:border-primary resize-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setDescription(example)}
            className="text-xs text-primary hover:underline"
          >
            Usar ejemplo
          </button>
          <Button onClick={generate} disabled={loading} className="h-11 px-6">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> Generar bot
              </>
            )}
          </Button>
        </div>
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
      </div>

      {loading && !bot && (
        <div className="glass rounded-2xl p-8 text-center">
          <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
          <p className="text-sm text-muted-foreground mt-3">La IA está diseñando tu estrategia...</p>
        </div>
      )}

      {bot && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-400/15 flex items-center justify-center">
                <Bot className="w-4 h-4 text-green-400" />
              </div>
              <h3 className="font-semibold">Bot generado</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <ConfigField label="Nombre" value={bot.name} />
              <ConfigField label="Mercado" value={bot.market} />
              <ConfigField label="Exchange" value={bot.exchange} />
              <ConfigField label="Timeframe" value={bot.timeframe} />
              <ConfigField label="Activos" value={(bot.assets || []).join(", ")} />
              <ConfigField label="Stop Loss" value={bot.stopLoss} />
              <ConfigField label="Take Profit" value={bot.takeProfit} />
              <ConfigField label="Trailing Stop" value={bot.trailingStop} />
            </div>

            {bot.indicators?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Indicadores</p>
                <div className="flex flex-wrap gap-2">
                  {bot.indicators.map((ind, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {ind.name}{ind.params ? ` · ${ind.params}` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <ConfigField className="mt-4" label="Entrada" value={bot.entry} full />
            <ConfigField className="mt-3" label="Salida" value={bot.exit} full />
            <ConfigField className="mt-3" label="Gestión de riesgo" value={bot.riskManagement} full />
            <ConfigField className="mt-3" label="Filtros" value={bot.filters} full />
            <ConfigField className="mt-3" label="Descripción" value={bot.description} full />

            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={() => onSaved?.(bot)} className="h-11 px-6">
                <Save className="w-4 h-4 mr-2" /> Guardar
              </Button>
              <Button variant="outline" onClick={generate} disabled={loading} className="h-11 px-6 bg-transparent border-border hover:bg-secondary">
                <RefreshCw className="w-4 h-4 mr-2" /> Regenerar
              </Button>
              <Button variant="ghost" className="h-11 px-6 text-muted-foreground">
                <Edit3 className="w-4 h-4 mr-2" /> Editar
              </Button>
            </div>

            <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/15">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                La IA no publica ni activa el bot automáticamente. Revisa y confirma la configuración antes de continuar.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ManualBotBuilder({ onSaved }) {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Nombre del bot" placeholder="Ej. Apex BTC Pro" />
        <FormField label="Exchange" placeholder="Binance / Bybit / OKX" />
        <FormField label="Mercado" placeholder="Spot / Futures" />
        <FormField label="Par" placeholder="BTC/USDT" />
        <FormField label="Timeframe" placeholder="1m / 5m / 15m / 1H / 4H / 1D" />
        <FormField label="Riesgo por operación (%)" placeholder="1" type="number" />
        <FormField label="Stop Loss (%)" placeholder="2" type="number" />
        <FormField label="Take Profit (%)" placeholder="4" type="number" />
        <FormField label="Trailing Stop (%)" placeholder="1.5" type="number" />
        <FormField label="Máx. pérdida diaria (%)" placeholder="5" type="number" />
        <FormField label="Máx. drawdown (%)" placeholder="15" type="number" />
        <FormField label="Máx. operaciones" placeholder="10" type="number" />
      </div>
      <div>
        <Label className="mb-2 block">Indicadores y reglas de entrada/salida</Label>
        <textarea
          placeholder="Describe la estrategia, indicadores (EMA, RSI, MACD...) y reglas de entrada/salida..."
          rows={4}
          className="w-full rounded-xl bg-secondary/50 border border-border p-3 text-sm outline-none focus:border-primary resize-none"
        />
      </div>
      <div className="flex gap-3">
        <Button onClick={() => onSaved?.({})} className="h-11 px-6">Guardar bot</Button>
        <Button variant="outline" className="h-11 px-6 bg-transparent border-border hover:bg-secondary">Ejecutar backtest</Button>
      </div>
    </div>
  );
}

/* shared bits */
function ChoiceCard({ icon: Icon, title, desc, cta, onClick, highlight }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-6 rounded-2xl border transition-all h-full ${
        highlight
          ? "border-primary bg-primary/10 glow-violet hover:bg-primary/15"
          : "border-border bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50"
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${highlight ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-semibold text-base">{title}</p>
      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
      <p className="text-sm font-semibold text-primary mt-4">{cta}</p>
    </button>
  );
}

function ConfigField({ label, value, full, className = "" }) {
  return (
    <div className={`${full ? "sm:col-span-2" : ""} ${className}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium rounded-lg bg-secondary/40 border border-border p-2.5 min-h-[42px]">
        {value || "—"}
      </p>
    </div>
  );
}

function FormField({ label, placeholder, type = "text" }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder} className="h-11 bg-secondary/50 border-border" />
    </div>
  );
}