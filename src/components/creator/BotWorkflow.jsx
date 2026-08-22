import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Bot, Play, CheckCircle2, XCircle, RefreshCw, Loader2, Rocket,
  Clock, AlertTriangle, ShieldCheck, FileText, Activity,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_META = {
  draft: { label: "Borrador", color: "bg-yellow-400/15 text-yellow-400" },
  testing: { label: "En testing", color: "bg-blue-400/15 text-blue-400" },
  passed: { label: "Testing aprobado", color: "bg-green-400/15 text-green-400" },
  failed: { label: "Testing fallido", color: "bg-red-400/15 text-red-400" },
  published: { label: "Publicado", color: "bg-green-400/15 text-green-400" },
  suspended: { label: "Suspendido", color: "bg-orange-400/15 text-orange-400" },
  archived: { label: "Archivado", color: "bg-muted text-muted-foreground" },
};

const TIMEFRAME_DAYS = { "1m": 1, "5m": 2, "15m": 3, "30m": 4, "1H": 7, "4H": 14, "1D": 30 };

const CHECKLIST = [
  { key: "strategy_validated", label: "Estrategia validada", required: true },
  { key: "risk_configured", label: "Gestión de riesgo configurada", required: true },
  { key: "pricing_configured", label: "Precio configurado", required: true },
  { key: "backtest_run", label: "Backtest ejecutado", required: false, note: "Disponible en Fase 2" },
  { key: "paper_test_run", label: "Paper trading ejecutado", required: false, note: "Disponible en Fase 2" },
  { key: "security_check", label: "Revisé la configuración y el riesgo", required: true },
];

// Workflow por bot: testing (state machine) + checklist de validación + publicación con landing.
// Sin datos falsos: las métricas muestran "Esperando datos" hasta que Fase 2 provea resultados reales.
export default function BotWorkflow({ product, onBack, onChanged }) {
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [testCapital, setTestCapital] = useState("1000");

  const load = async () => {
    setLoading(true);
    try {
      const rows = await base44.entities.BotVersion.filter({ product_id: product.id }, "-created_date", 50);
      setVersion((rows && rows[0]) || null);
    } catch (e) {
      toast({ variant: "destructive", title: "No se pudo cargar la versión" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [product.id]);

  const patchVersion = async (patch) => {
    if (!version) return;
    setBusy(true);
    try {
      const updated = await base44.entities.BotVersion.update(version.id, patch);
      setVersion(updated);
      onChanged?.();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: e?.message });
    } finally {
      setBusy(false);
    }
  };

  const runBacktestAction = async () => {
    setBusy(true);
    try {
      const cap = Number(testCapital) || 1000;
      const res = await base44.functions.invoke("runBacktest", {
        config: product.config || {},
        capital: cap,
        leverage: 1,
        commission: 0.075,
      });
      const r = res?.data || res;
      if (!r || (r.error && r.totalTrades == null)) {
        toast({ variant: "destructive", title: "Backtest fallido", description: r?.error || "Sin datos históricos." });
        return;
      }
      const pnlUsd = Math.round((Number(r.finalBalance) - cap) * 100) / 100;
      const cl = { ...(version.checklist || {}), backtest_run: true };
      const updated = await base44.entities.BotVersion.update(version.id, {
        status: "testing",
        test_capital: cap,
        test_trades: Number(r.totalTrades) || 0,
        test_pnl: pnlUsd,
        test_drawdown: Number(r.maxDrawdown) || 0,
        test_win_rate: Number(r.winRate) || 0,
        test_profit_factor: Number(r.profitFactor) || 0,
        test_sharpe: Number(r.sharpe) || 0,
        checklist: cl,
      });
      setVersion(updated);
      onChanged?.();
      toast({ title: "Backtest completado", description: `${r.totalTrades} ops · WR ${r.winRate}% · Retorno ${r.totalReturn}% · ${r.durationMs}ms.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Backtest fallido", description: e?.message });
    } finally {
      setBusy(false);
    }
  };

  const markPassed = async () => { await patchVersion({ status: "passed" }); };
  const markFailed = async () => {
    await patchVersion({
      status: "failed",
      test_errors: [...(version.test_errors || []), "Marcado como fallido por el creador"],
    });
  };
  const resetTesting = async () => {
    await patchVersion({
      status: "draft", test_start_date: null, test_end_date: null,
      test_trades: 0, test_pnl: 0, test_drawdown: 0, test_win_rate: 0,
    });
  };

  const toggleCheck = async (key) => {
    const checklist = { ...(version.checklist || {}), [key]: !version.checklist?.[key] };
    await patchVersion({ checklist });
  };

  const publish = async () => {
    const cl = version.checklist || {};
    const missing = CHECKLIST.filter((c) => c.required && !cl[c.key]).map((c) => c.label);
    if (missing.length) {
      toast({ variant: "destructive", title: "Faltan validaciones", description: missing.join(" · ") });
      return;
    }
    if (version.status !== "passed") {
      toast({ variant: "destructive", title: "Testing pendiente", description: "Aprobá el testing antes de publicar." });
      return;
    }
    setBusy(true);
    try {
      let landing = null;
      try {
        const res = await base44.functions.invoke("generateLanding", {
          productName: product.name,
          productDescription: product.description,
          category: product.category,
        });
        landing = res?.data?.landing || res?.landing || null;
      } catch (e) { /* landing opcional */ }
      await base44.entities.Product.update(product.id, { status: "published", landing: landing || {} });
      await base44.entities.BotVersion.update(version.id, {
        status: "published",
        checklist: { ...cl, landing_created: true },
      });
      toast({ title: "Bot publicado", description: "Visible en el marketplace con su landing generada." });
      onChanged?.();
      onBack?.();
    } catch (e) {
      toast({ variant: "destructive", title: "No se pudo publicar", description: e?.message });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!version) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-sm text-muted-foreground">No se encontró una versión para este bot.</p>
        <Button variant="outline" onClick={onBack} className="mt-4 bg-transparent border-border">Volver</Button>
      </div>
    );
  }

  const st = STATUS_META[version.status] || STATUS_META.draft;
  const cl = version.checklist || {};
  const requiredDone = CHECKLIST.filter((c) => c.required).every((c) => cl[c.key]);
  const canPublish = requiredDone && version.status === "passed";
  const daysLeft = version.test_end_date
    ? Math.ceil((new Date(version.test_end_date).getTime() - Date.now()) / 86400000)
    : null;
  const hasData = !!version.checklist?.backtest_run || Number(version.test_trades) > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Mis bots
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{product.current_version || version.version_label}</span>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${st.color}`}>{st.label}</span>
        </div>
      </div>

      {/* Bot info */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-lg">{product.name}</h2>
            <p className="text-xs text-muted-foreground">
              {product.timeframe || "—"} · Riesgo {product.risk || "—"} · Alquiler ${product.rentPrice || "—"}/mes
            </p>
          </div>
        </div>
      </div>

      {/* Testing workflow */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-400/15 flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="font-semibold">Testing workflow</h3>
        </div>

        {/* state machine actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(version.status === "draft" || version.status === "testing") && (
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Capital (USDT)</Label>
              <Input type="number" value={testCapital} onChange={(e) => setTestCapital(e.target.value)} className="h-9 w-32 bg-secondary/50" />
            </div>
          )}
          {version.status === "draft" && (
            <Button onClick={runBacktestAction} disabled={busy} className="h-9">
              {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />} Ejecutar backtest
            </Button>
          )}
          {version.status === "testing" && (
            <>
              <Button variant="outline" onClick={runBacktestAction} disabled={busy} className="h-9 bg-transparent border-border hover:bg-secondary">
                {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />} Re-ejecutar backtest
              </Button>
              <Button onClick={markPassed} disabled={busy} className="h-9 bg-green-500 hover:bg-green-500/90">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Marcar aprobado
              </Button>
              <Button variant="outline" onClick={markFailed} disabled={busy} className="h-9 bg-transparent border-border hover:bg-secondary">
                <XCircle className="w-4 h-4 mr-1" /> Marcar fallido
              </Button>
            </>
          )}
          {version.status === "passed" && (
            <span className="text-sm text-green-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Testing aprobado · listo para publicar
            </span>
          )}
          {version.status === "failed" && (
            <>
              <span className="text-sm text-red-400 font-medium flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Testing fallido
              </span>
              <Button variant="outline" onClick={resetTesting} disabled={busy} className="h-9 bg-transparent border-border hover:bg-secondary">
                <RefreshCw className="w-4 h-4 mr-1" /> Reiniciar
              </Button>
            </>
          )}
        </div>

        {/* testing period */}
        {(version.test_start_date || version.test_end_date) && (
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <InfoCell label="Inicio" value={version.test_start_date || "—"} />
            <InfoCell label="Fin" value={version.test_end_date || "—"} />
            <InfoCell label="Días restantes" value={daysLeft != null ? `${daysLeft}d` : "—"} icon={Clock} />
          </div>
        )}

        {/* metrics — no fake data */}
        <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCell label="Operaciones" value={hasData ? version.test_trades : "Esperando datos"} />
          <MetricCell label="P&L" value={hasData ? `${version.test_pnl} USDT` : "Esperando datos"} />
          <MetricCell label="Win rate" value={hasData ? `${version.test_win_rate}%` : "Esperando datos"} />
          <MetricCell label="Drawdown" value={hasData ? `${version.test_drawdown}%` : "Esperando datos"} />
          <MetricCell label="Profit factor" value={hasData ? version.test_profit_factor : "Esperando datos"} />
          <MetricCell label="Sharpe" value={hasData ? version.test_sharpe : "Esperando datos"} />
        </div>
        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/15">
          <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            El backtest corre sobre hasta 1.000 velas reales (Binance/Bybit) en memoria, en menos de 2 s. Revisá las métricas antes de aprobar y publicar.
          </p>
        </div>
      </div>

      {/* Validation checklist */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold">Validación antes de publicar</h3>
        </div>
        <div className="space-y-2">
          {CHECKLIST.map((c) => {
            const done = !!cl[c.key];
            const disabled = !c.required;
            return (
              <button
                key={c.key}
                type="button"
                disabled={disabled}
                onClick={() => toggleCheck(c.key)}
                className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition ${disabled ? "opacity-60 cursor-not-allowed border-border bg-secondary/20" : done ? "border-green-400/30 bg-green-400/5" : "border-border hover:bg-secondary/40"}`}
              >
                <div className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-border" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{c.label}</p>
                    {c.note && <p className="text-xs text-muted-foreground">{c.note}</p>}
                  </div>
                </div>
                {c.required && !done && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400">REQUERIDO</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Publish */}
      <div className="glass rounded-2xl p-5 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold">Publicar en el marketplace</h3>
        </div>
        {!canPublish && (
          <p className="text-sm text-muted-foreground mb-3">
            {version.status !== "passed"
              ? "El bot debe aprobar el testing."
              : "Completa los items requeridos del checklist."}
          </p>
        )}
        <Button onClick={publish} disabled={!canPublish || busy} className="h-11 px-6">
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
          {busy ? "Publicando..." : "Publicar bot + landing"}
        </Button>
        {product.landing && (
          <div className="mt-4 p-3 rounded-xl bg-secondary/40 border border-border">
            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><FileText className="w-3 h-3" /> Landing generada</p>
            <p className="text-sm font-semibold">{product.landing.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{product.landing.subtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCell({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl bg-secondary/40 border border-border p-3">
      <p className="text-xs text-muted-foreground flex items-center gap-1">{Icon && <Icon className="w-3 h-3" />}{label}</p>
      <p className="text-sm font-semibold mt-1">{value}</p>
    </div>
  );
}

function MetricCell({ label, value }) {
  return (
    <div className="rounded-xl bg-secondary/40 border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-1 truncate">{value}</p>
    </div>
  );
}