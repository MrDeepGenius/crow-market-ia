import React, { useState } from "react";
import { Wand2, Loader2, Check, Link2, BarChart3, Eye, Pencil, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  const [editing, setEditing] = useState(false);

  // Codigo de seguimiento unico por afiliado (derivado del id de usuario).
  const affiliateCode = user?.id ? user.id.slice(0, 8).toUpperCase() : "AFFILIATE";

  const handleGenerate = async () => {
    if (!productId) {
      toast({ variant: "destructive", title: "Selecciona un producto", description: "Elige un bot o producto del marketplace." });
      return;
    }
    setGenerating(true);
    setResult(null);
    setEditing(false);
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

  // Editores manuales
  const updateField = (field, value) => setResult((r) => ({ ...r, [field]: value }));
  const updateBenefit = (i, value) =>
    setResult((r) => ({ ...r, benefits: r.benefits.map((b, idx) => (idx === i ? value : b)) }));
  const updateStep = (i, field, value) =>
    setResult((r) => ({ ...r, steps: r.steps.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)) }));

  return (
    <Panel>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Creador de Landings IA (1 clic)</h3>
          <p className="text-xs text-muted-foreground">Genera con IA o edita manualmente. El botón Comprar lleva a tu link de afiliado.</p>
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
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-11 bg-transparent" onClick={() => setEditing((e) => !e)}>
                {editing ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" /> Ver vista previa
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4 mr-2" /> Editar manualmente
                  </>
                )}
              </Button>
              <Dialog open={showFullPage} onOpenChange={setShowFullPage}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 h-11 bg-transparent">
                    <Eye className="w-4 h-4 mr-2" /> Ver página completa
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
            </div>
          )}

          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
            <span className="text-primary font-semibold">Vinculación automática:</span> todos los botones (Comprar, Alquilar, Probar) incluyen directamente tu link de afiliado y llevan a nuestra web.
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

          {/* Modo edición manual */}
          {!generating && result && editing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Pencil className="w-3.5 h-3.5" /> Edición manual
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Título</Label>
                <Input value={result.title} onChange={(e) => updateField("title", e.target.value)} className="h-10 bg-background/60" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Subtítulo</Label>
                <Input value={result.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} className="h-10 bg-background/60" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Beneficios</Label>
                <div className="space-y-1.5">
                  {result.benefits.map((b, i) => (
                    <Input key={i} value={b} onChange={(e) => updateBenefit(i, e.target.value)} className="h-9 bg-background/60" placeholder={`Beneficio ${i + 1}`} />
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pasos (cómo funciona)</Label>
                <div className="space-y-2">
                  {result.steps.map((s, i) => (
                    <div key={i} className="rounded-lg bg-background/40 border border-border p-2 space-y-1.5">
                      <Input value={s.title} onChange={(e) => updateStep(i, "title", e.target.value)} className="h-9 bg-background/60 text-sm" placeholder={`Paso ${i + 1} - título`} />
                      <Input value={s.desc} onChange={(e) => updateStep(i, "desc", e.target.value)} className="h-9 bg-background/60 text-xs" placeholder="Descripción" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Texto del botón (CTA)</Label>
                <Input value={result.cta} onChange={(e) => updateField("cta", e.target.value)} className="h-10 bg-background/60" />
              </div>
              <Button className="w-full h-10" onClick={() => setEditing(false)}>
                <Save className="w-4 h-4 mr-2" /> Guardar y ver vista previa
              </Button>
            </div>
          )}

          {/* Vista previa */}
          {!generating && result && !editing && (
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
              <a
                href={result.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center hover:bg-primary/90 transition"
              >
                {result.cta}
              </a>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}