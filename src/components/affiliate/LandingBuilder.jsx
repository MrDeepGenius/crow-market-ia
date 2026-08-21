import React, { useState } from "react";
import { Wand2, Loader2, Check, Link2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { SAMPLE_PRODUCTS } from "@/data/products";

function Panel({ children, className = "" }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

const affiliateProducts = SAMPLE_PRODUCTS.filter((p) => p.affiliate);

export default function LandingBuilder() {
  const [productId, setProductId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!productId) {
      toast({ variant: "destructive", title: "Selecciona un producto", description: "Elige un bot o producto del marketplace." });
      return;
    }
    setGenerating(true);
    setResult(null);
    // Simulación de generación con IA (el endpoint real se conecta después)
    await new Promise((r) => setTimeout(r, 1800));
    const product = affiliateProducts.find((p) => p.id === productId);
    setResult({
      title: `${product.name}: la forma más inteligente de operar con IA`,
      affiliateLink: `https://crowmarket.ai/r/AFF8421X/${product.id}`,
      sections: ["Hero persuasivo", "Métricas del bot", "Preguntas frecuentes", "Gráfico de rendimiento", "CTA con tu link de afiliado"],
    });
    setGenerating(false);
  };

  const copyLink = (link) => {
    navigator.clipboard?.writeText(link);
    toast({ title: "Link copiado", description: "Tu link de afiliado está en el portapapeles." });
  };

  return (
    <Panel>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Creador de Landings IA (1 clic)</h3>
          <p className="text-xs text-muted-foreground">Selecciona producto → Clic en Generar → ¡Tu web con tu link de afiliado está lista!</p>
        </div>
      </div>

      <div className="mt-5 grid lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Elige un Bot o Producto del Marketplace</Label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full h-11 rounded-xl bg-secondary/50 border border-border px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">— Selecciona un producto —</option>
              {affiliateProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.category} · {p.commission}% comisión
                </option>
              ))}
            </select>
          </div>

          <Button className="w-full h-12 text-base font-semibold" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando landing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" /> Generar Landing con IA
              </>
            )}
          </Button>

          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
            <span className="text-primary font-semibold">Vinculación automática:</span> todos los botones (Comprar, Alquilar, Probar) incluyen directamente tu link de afiliado.
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/20 p-4 min-h-[220px]">
          {generating && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-sm">Construyendo títulos, métricas y gráficos...</p>
            </div>
          )}
          {!generating && !result && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 text-center">
              <BarChart3 className="w-7 h-7" />
              <p className="text-sm">Tu landing generada aparecerá aquí.</p>
            </div>
          )}
          {!generating && result && (
            <div className="space-y-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Título generado</p>
                <p className="font-semibold text-sm mt-0.5">{result.title}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Secciones incluidas</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.sections.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <Check className="w-3 h-3" /> {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-background/60 border border-border p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Tu link de afiliado</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono break-all flex-1">{result.affiliateLink}</code>
                  <Button size="sm" variant="outline" className="bg-transparent shrink-0" onClick={() => copyLink(result.affiliateLink)}>
                    <Link2 className="w-3.5 h-3.5" /> Copiar
                  </Button>
                </div>
              </div>
              <Button className="w-full h-10">Ver landing publicada</Button>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}