import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, Check, TrendingUp, Activity, Gauge, PlayCircle } from "lucide-react";
import Sparkline from "@/components/marketplace/Sparkline";
import PaymentLink from "@/components/marketplace/PaymentLink";

const riskTone = {
  Bajo: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  Medio: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  Alto: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
      ))}
    </div>
  );
}

function Metric({ label, value, tone = "" }) {
  return (
    <div className="rounded-xl bg-background/40 border border-border p-3 text-center">
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
      <p className={`text-base font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export default function ProductModal({ product, onClose }) {
  const [pay, setPay] = useState(product?.type === "bot" ? "rent" : "buy");
  if (!product) return null;
  const isBot = product.type === "bot";
  const price = isBot ? (pay === "rent" ? product.rentPrice : product.buyPrice) : product.price;

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl w-full max-h-[92vh] overflow-y-auto p-0 gap-0 rounded-2xl bg-card border-border">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>

        {/* Header / galeria */}
        <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-2xl">
          <Image src={product.gallery?.[0] || product.image} alt={product.name} className="w-full h-full" fittingType="fill" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex items-center gap-2 mb-2">
              {product.verified && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Validado
                </span>
              )}
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 uppercase">
                {product.category}
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl">{product.name}</h2>
            <p className="text-sm text-muted-foreground">por {product.creator}</p>
          </div>
          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-background/60 backdrop-blur border border-border flex items-center justify-center hover:bg-primary/20 transition">
            <PlayCircle className="w-7 h-7 text-primary" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <Tabs defaultValue="detalle">
            <TabsList className="bg-secondary/40">
              <TabsTrigger value="detalle">Detalle</TabsTrigger>
              {isBot && <TabsTrigger value="resultados">Resultados Auditados</TabsTrigger>}
              <TabsTrigger value="opiniones">Opiniones</TabsTrigger>
            </TabsList>

            <TabsContent value="detalle" className="space-y-5 mt-4">
              {isBot && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-background/50 border border-border p-3 text-center">
                    <p className="text-[10px] uppercase text-muted-foreground">Win Rate</p>
                    <p className="text-lg font-bold text-cyan-400">{product.winRate}%</p>
                  </div>
                  <div className="rounded-xl bg-background/50 border border-border p-3 text-center">
                    <p className="text-[10px] uppercase text-muted-foreground">P&L 30d</p>
                    <p className="text-lg font-bold text-emerald-400">{product.pnl > 0 ? "+" : ""}{product.pnl}%</p>
                  </div>
                  <div className="rounded-xl bg-background/50 border border-border p-3 text-center">
                    <p className="text-[10px] uppercase text-muted-foreground">Mercado</p>
                    <p className="text-sm font-semibold">{product.timeframe}</p>
                  </div>
                  <div className="rounded-xl bg-background/50 border border-border p-3 text-center">
                    <p className="text-[10px] uppercase text-muted-foreground">Riesgo</p>
                    <p className={`text-sm font-semibold px-2 py-0.5 rounded-full border inline-block ${riskTone[product.risk]}`}>
                      {product.risk}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-background/40 border border-border p-4">
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-400" /> Que incluye</p>
                  <ul className="space-y-1.5">
                    {product.includes?.map((it, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-primary">•</span>{it}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl bg-background/40 border border-border p-4">
                  <p className="text-xs font-semibold mb-2">Requisitos</p>
                  <ul className="space-y-1.5">
                    {product.requirements?.map((it, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-muted-foreground">•</span>{it}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {isBot && (
              <TabsContent value="resultados" className="space-y-4 mt-4">
                {product.backtest ? (
                  <>
                    <div className="rounded-xl bg-background/50 border border-border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold flex items-center gap-1.5"><Activity className="w-4 h-4 text-cyan-400" /> Curva de capital (backtest real)</span>
                        <span className={`text-xs font-bold flex items-center gap-1 ${product.backtest.totalReturn >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          <TrendingUp className="w-3.5 h-3.5" /> {product.backtest.totalReturn >= 0 ? "+" : ""}{product.backtest.totalReturn}%
                        </span>
                      </div>
                      <Sparkline data={product.backtest.equity?.length ? product.backtest.equity : product.curve} color="#22d3ee" height={80} />
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {product.backtest.candles} velas · {product.backtest.timeframe} · {product.backtest.durationMs}ms · {product.backtest.symbol}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <Metric label="Win Rate" value={`${product.backtest.winRate}%`} tone="text-cyan-400" />
                      <Metric label="Operaciones" value={product.backtest.totalTrades} />
                      <Metric label="Profit Factor" value={product.backtest.profitFactor} />
                      <Metric label="Max Drawdown" value={`-${product.backtest.maxDrawdown}%`} tone="text-rose-400" />
                      <Metric label="Sharpe" value={product.backtest.sharpe} />
                      <Metric label="Sortino" value={product.backtest.sortino} />
                      <Metric label="Retorno total" value={`${product.backtest.totalReturn >= 0 ? "+" : ""}${product.backtest.totalReturn}%`} tone={product.backtest.totalReturn >= 0 ? "text-emerald-400" : "text-rose-400"} />
                      <Metric label="Anualizado" value={`${product.backtest.annualizedReturn >= 0 ? "+" : ""}${product.backtest.annualizedReturn}%`} />
                      <Metric label="Balance final" value={`${product.backtest.finalBalance} USDT`} />
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl bg-background/40 border border-border p-6 text-center">
                    <p className="text-sm text-muted-foreground">Este bot aún no tiene resultados de backtest publicados.</p>
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="opiniones" className="space-y-3 mt-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{product.rating}</span>
                <div>
                  <Stars n={Math.round(product.rating)} />
                  <p className="text-xs text-muted-foreground">{product.reviews} valoraciones verificadas</p>
                </div>
              </div>
              {product.testimonials?.map((t, i) => (
                <div key={i} className="rounded-xl bg-background/40 border border-border p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <Stars n={t.stars} />
                  </div>
                  <p className="text-xs text-muted-foreground">{t.text}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {/* Checkout con link de pago USDT */}
          <div className="mt-6">
            {isBot && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setPay("rent")}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${pay === "rent" ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
                >
                  Alquilar · ${product.rentPrice}/mes
                </button>
                <button
                  onClick={() => setPay("buy")}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${pay === "buy" ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
                >
                  Comprar · ${product.buyPrice}
                </button>
              </div>
            )}
            <PaymentLink product={product} mode={isBot ? pay : "buy"} price={price} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}