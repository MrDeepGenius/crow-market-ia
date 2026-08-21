import React, { useState } from "react";
import { Wand2, Loader2, Check, Link2, BarChart3, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { SAMPLE_PRODUCTS } from "@/data/products";
import LandingPreview from "@/components/affiliate/LandingPreview";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function Panel({ children, className = "" }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

const affiliateProducts = SAMPLE_PRODUCTS.filter((p) => p.affiliate);

export default function LandingBuilder() {
  const { user } = useAuth();
  const [productId, setProductId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [showFullPage, setShowFullPage] = useState(false);

  // Codigo de seguimiento unico por afiliado (derivado del id de usuario).
  const affiliateCode = user?.id ? user.id.slice(0, 8).toUpperCase() : "AFFILIATE";

  const handleGenerate = async () => {
    if (!productId) {
      toast({ variant: "destructive", title: "Selecciona un producto", description: "Elige un bot o producto del marketplace." });
      return;
    }
    setGenerating(true);
    setResult(null);
    try {
      const product = affiliateProducts.find((p) => p.id === productId);
      const res = await base44.functions.invoke("generateLanding", {
        productName: product.name,
        productDescription: product.description,
        category: product.category,
      });
      const landing = res?.landing || res;
      setResult({
        title: landing.title || `${product.name}: la forma más inteligente de operar con IA`,
        subtitle: landing.subtitle || "",
        benefits: Array.isArray(landing.benefits) ? landing.benefits : [],
        steps: Array.isArray(landing.steps) ? landing.steps : [],
        cta: landing.cta || "Comprar ahora",
        affiliateLink: `https://crowmarket.ai/r/${affiliateCode}/${product.id}`,
        affiliateCode,
      });
    } catch (err) {
      toast({ variant: "destructive", title: "No se pudo generar", description: err?.message || "Intenta de nuevo." });
    } finally {
      setGenerating(false);
    }
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

          {result && (
            <Dialog open={showFullPage} onOpenChange={setShowFullPage}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-11 bg-transparent">
                  <Eye className="w-4 h-4 mr-2" /> Ver landing completa (página real)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl w-full h-[90vh] p-0 overflow-y-auto gap-0 rounded-2xl">
                <DialogTitle className="sr-only">Landing page generada</DialogTitle>
                <LandingPreview
                  landing={result}
                  affiliateLink={result.affiliateLink}
                  product={affiliateProducts.find((p) => p.id === productId)}
                />
              </DialogContent>
            </Dialog>
          )}

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
                <p className="font-heading font-bold text-lg leading-tight">{result.title}</p>
                {result.subtitle && <p className="text-sm text-muted-foreground mt-1">{result.subtitle}</p>}
              </div>

              {result.benefits.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Beneficios</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.benefits.map((b, i) => (
                      <span key={i} className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                        <Check className="w-3 h-3" /> {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.steps.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Cómo funciona</p>
                  <div className="space-y-2">
                    {result.steps.map((s, i) => (
                      <div key={i} className="flex gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-background/60 border border-border p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Tu link de afiliado · código {result.affiliateCode}</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono break-all flex-1">{result.affiliateLink}</code>
                  <Button size="sm" variant="outline" className="bg-transparent shrink-0" onClick={() => copyLink(result.affiliateLink)}>
                    <Link2 className="w-3.5 h-3.5" /> Copiar
                  </Button>
                </div>
              </div>
              <Button className="w-full h-10">{result.cta}</Button>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}