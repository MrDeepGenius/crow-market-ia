import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wrench, ArrowLeft, Loader2, RefreshCw, Save, Edit3, Bot, AlertTriangle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_PRODUCT_IMAGE } from "@/data/products";

const BOT_CATEGORY = "Bots de Trading IA";
const RISK_OPTIONS = ["Bajo", "Medio", "Alto"];

// Crea un Product (bot) en borrador + su primera BotVersion (v1.0) y dispara el
// backtest automatico con datos reales: el bot entra en backtesting al terminar.
async function createBotWithVersion(record, config) {
  const product = await base44.entities.Product.create({ ...record, status: "draft", current_version: "v1.0" });
  const checklist = {
    strategy_validated: true,
    risk_configured: true,
    pricing_configured: Number(record.rentPrice) > 0,
    backtest_run: false,
    paper_test_run: false,
    security_check: false,
  };
  const version = await base44.entities.BotVersion.create({
    product_id: product.id,
    version_label: "v1.0",
    status: "draft",
    config: config || record.config || null,
    changelog: "Versión inicial",
    checklist,
  });
  // Backtest automatico con velas reales (best-effort: si falla, queda en draft).
  try {
    const btConfig = { ...(config || record.config || {}) };
    const res = await base44.functions.invoke("runBacktest", {
      config: btConfig,
      capital: 1000,
      leverage: 1,
      commission: 0.075,
    });
    const r = res?.data || res;
    if (r && (r.success || r.totalTrades != null) && !r.error) {
      const pnlUsd = Math.round((Number(r.finalBalance) - 1000) * 100) / 100;
      await base44.entities.BotVersion.update(version.id, {
        status: "testing",
        test_capital: 1000,
        test_trades: Number(r.totalTrades) || 0,
        test_pnl: pnlUsd,
        test_drawdown: Number(r.maxDrawdown) || 0,
        test_win_rate: Number(r.winRate) || 0,
        test_profit_factor: Number(r.profitFactor) || 0,
        test_sharpe: Number(r.sharpe) || 0,
        checklist: { ...checklist, backtest_run: true },
        backtest: r,
      });
    }
  } catch (e) { /* backtest best-effort */ }
  return product;
}

// Create Bot flow: choose IA vs Manual, then generate or configure, then publish to marketplace.
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

function PublishPanel({ bot, config, onPublished, defaultName }) {
  const { user } = useAuth();
  const [rentPrice, setRentPrice] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [risk, setRisk] = useState("Medio");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  const publish = async () => {
    const rent = Number(rentPrice);
    const buy = Number(buyPrice);
    if (!defaultName || defaultName.trim().length < 2) {
      toast({ variant: "destructive", title: "Falta el nombre", description: "Define un nombre para el bot." });
      return;
    }
    if (!rent || rent <= 0) {
      toast({ variant: "destructive", title: "Precio inválido", description: "Define un precio de alquiler mensual." });
      return;
    }
    setSaving(true);
    try {
      const record = {
        name: defaultName.trim(),
        creator: user?.full_name || user?.email || "Crow Market",
        type: "bot",
        category: BOT_CATEGORY,
        description: bot?.description || config?.description || "",
        image: image || DEFAULT_PRODUCT_IMAGE,
        tag: "Nuevo",
        verified: false,
        featured: false,
        rentPrice: rent,
        buyPrice: buy || 0,
        risk,
        timeframe: bot?.timeframe || config?.timeframe || "—",
        winRate: Number(bot?.winRate) || 0,
        pnl: Number(bot?.pnl) || 0,
        includes: bot?.includes || ["Estrategia preconfigurada", "Gestión de riesgo", "Panel de monitoreo"],
        requirements: bot?.requirements || ["Exchange con API de trading"],
        config: bot || config || null,
        status: "draft",
        current_version: "v1.0",
      };
      await createBotWithVersion(record, bot || config || null);
      toast({ title: "Bot creado", description: "Se guardó como borrador. Completá el testing y validá antes de publicar." });
      onPublished?.();
    } catch (err) {
      toast({ variant: "destructive", title: "No se pudo publicar", description: err?.message || "Intenta nuevamente." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 mt-5 border border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold">Guardar bot (borrador)</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Alquiler (USDT / mes)</Label>
          <Input type="number" value={rentPrice} onChange={(e) => setRentPrice(e.target.value)} placeholder="25" className="h-11 bg-secondary/50 border-border" />
        </div>
        <div className="space-y-2">
          <Label>Compra única (USDT) · opcional</Label>
          <Input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="299" className="h-11 bg-secondary/50 border-border" />
        </div>
        <div className="space-y-2">
          <Label>Nivel de riesgo</Label>
          <div className="flex gap-2">
            {RISK_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRisk(r)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm transition ${risk === r ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-secondary/50"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Imagen (URL) · opcional</Label>
          <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="h-11 bg-secondary/50 border-border" />
        </div>
      </div>
      <Button onClick={publish} disabled={saving} className="mt-5 h-11 px-6">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        {saving ? "Guardando..." : "Guardar bot"}
      </Button>
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

            <div className="mt-4 flex flex-wrap gap-3">
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
                La IA no publica ni activa el bot automáticamente. Guardá el bot como borrador y publicalo desde "Mis bots" tras completar el testing.
              </p>
            </div>
          </div>

          <PublishPanel bot={bot} config={bot} defaultName={bot.name} onPublished={() => onSaved?.("bots")} />
        </motion.div>
      )}
    </div>
  );
}

function ManualBotBuilder({ onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "", exchange: "", market: "", pair: "BTC/USDT", timeframe: "15m",
    riskPerOp: "", stopLoss: "", takeProfit: "", trailingStop: "", maxDailyLoss: "",
    maxDrawdown: "", maxOps: "", strategy: "", rentPrice: "", buyPrice: "", risk: "Medio", image: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const publish = async () => {
    if (!form.name.trim()) {
      toast({ variant: "destructive", title: "Falta el nombre" });
      return;
    }
    const rent = Number(form.rentPrice);
    if (!rent || rent <= 0) {
      toast({ variant: "destructive", title: "Precio inválido", description: "Define un precio de alquiler mensual." });
      return;
    }
    setSaving(true);
    try {
      const config = {
        exchange: form.exchange, market: form.market, pair: form.pair, timeframe: form.timeframe,
        riskPerOp: form.riskPerOp, stopLoss: form.stopLoss, takeProfit: form.takeProfit,
        trailingStop: form.trailingStop, maxDailyLoss: form.maxDailyLoss, maxDrawdown: form.maxDrawdown,
        maxOps: form.maxOps, strategy: form.strategy,
      };
      const record = {
        name: form.name.trim(),
        creator: user?.full_name || user?.email || "Crow Market",
        type: "bot",
        category: BOT_CATEGORY,
        description: form.strategy || `Bot de trading ${form.pair} en ${form.timeframe}.`,
        image: form.image || DEFAULT_PRODUCT_IMAGE,
        tag: "Nuevo",
        verified: false,
        featured: false,
        rentPrice: rent,
        buyPrice: Number(form.buyPrice) || 0,
        risk: form.risk,
        timeframe: `${form.timeframe} · ${form.pair}`,
        winRate: 0,
        pnl: 0,
        includes: ["Estrategia preconfigurada", "Gestión de riesgo", "Panel de monitoreo"],
        requirements: [form.exchange ? `Exchange ${form.exchange}` : "Exchange con API de trading"],
        config,
        status: "draft",
        current_version: "v1.0",
      };
      await createBotWithVersion(record, config);
      toast({ title: "Bot creado", description: "Se guardó como borrador. Completá el testing y validá antes de publicar." });
      onSaved?.("bots");
    } catch (err) {
      toast({ variant: "destructive", title: "No se pudo publicar", description: err?.message || "Intenta nuevamente." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Nombre del bot" placeholder="Ej. Apex BTC Pro" value={form.name} onChange={set("name")} />
        <FormField label="Exchange" placeholder="Binance / Bybit / OKX" value={form.exchange} onChange={set("exchange")} />
        <FormField label="Mercado" placeholder="Spot / Futures" value={form.market} onChange={set("market")} />
        <FormField label="Par" placeholder="BTC/USDT" value={form.pair} onChange={set("pair")} />
        <FormField label="Timeframe" placeholder="1m / 5m / 15m / 1H" value={form.timeframe} onChange={set("timeframe")} />
        <FormField label="Riesgo por operación (%)" placeholder="1" type="number" value={form.riskPerOp} onChange={set("riskPerOp")} />
        <FormField label="Stop Loss (%)" placeholder="2" type="number" value={form.stopLoss} onChange={set("stopLoss")} />
        <FormField label="Take Profit (%)" placeholder="4" type="number" value={form.takeProfit} onChange={set("takeProfit")} />
        <FormField label="Trailing Stop (%)" placeholder="1.5" type="number" value={form.trailingStop} onChange={set("trailingStop")} />
        <FormField label="Máx. pérdida diaria (%)" placeholder="5" type="number" value={form.maxDailyLoss} onChange={set("maxDailyLoss")} />
        <FormField label="Máx. drawdown (%)" placeholder="15" type="number" value={form.maxDrawdown} onChange={set("maxDrawdown")} />
        <FormField label="Máx. operaciones" placeholder="10" type="number" value={form.maxOps} onChange={set("maxOps")} />
      </div>
      <div>
        <Label className="mb-2 block">Indicadores y reglas de entrada/salida</Label>
        <textarea
          value={form.strategy}
          onChange={set("strategy")}
          placeholder="Describe la estrategia, indicadores (EMA, RSI, MACD...) y reglas de entrada/salida..."
          rows={4}
          className="w-full rounded-xl bg-secondary/50 border border-border p-3 text-sm outline-none focus:border-primary resize-none"
        />
      </div>
      <div className="grid sm:grid-cols-3 gap-4 pt-2 border-t border-border">
        <FormField label="Alquiler (USDT/mes)" placeholder="25" type="number" value={form.rentPrice} onChange={set("rentPrice")} />
        <FormField label="Compra única (USDT)" placeholder="299" type="number" value={form.buyPrice} onChange={set("buyPrice")} />
        <div className="space-y-2">
          <Label>Riesgo</Label>
          <div className="flex gap-2">
            {RISK_OPTIONS.map((r) => (
              <button key={r} type="button" onClick={() => setForm((f) => ({ ...f, risk: r }))}
                className={`flex-1 rounded-xl border px-2 py-2.5 text-xs transition ${form.risk === r ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-secondary/50"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
      <FormField label="Imagen (URL) · opcional" placeholder="https://..." value={form.image} onChange={set("image")} />
      <div className="flex gap-3">
        <Button onClick={publish} disabled={saving} className="h-11 px-6">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Guardando..." : "Guardar bot"}
        </Button>
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

function FormField({ label, placeholder, type = "text", value, onChange }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder} value={value} onChange={onChange} className="h-11 bg-secondary/50 border-border" />
    </div>
  );
}