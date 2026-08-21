import React from "react";
import { Copy, Wand2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { SAMPLE_PRODUCTS } from "@/data/products";

function Panel({ children, className = "" }) {
  return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;
}

export default function ProductsAffiliationTable({ onCreateLanding }) {
  const products = SAMPLE_PRODUCTS.filter((p) => p.affiliate);

  const copyLink = (p) => {
    navigator.clipboard?.writeText(`https://crowmarket.ai/r/AFF8421X/${p.id}`);
    toast({ title: "Link copiado", description: `Link de afiliado de ${p.name} copiado.` });
  };

  return (
    <Panel>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Package className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Productos & Afiliaciones</h3>
          <p className="text-xs text-muted-foreground">Marketplace interno disponible para promover</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="font-medium px-2 py-3">Producto</th>
              <th className="font-medium px-2 py-3">Tipo</th>
              <th className="font-medium px-2 py-3">Comisión Venta Directa</th>
              <th className="font-medium px-2 py-3">Residual / Alquiler</th>
              <th className="font-medium px-2 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-semibold text-xs">
                      {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.creator}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-2 py-3">
                  <span className="text-primary font-semibold">{p.commission}%</span>
                </td>
                <td className="px-2 py-3 text-muted-foreground">
                  {p.period === "mes" ? `$${(p.price * 0.1).toFixed(0)}/mes` : "—"}
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="outline" className="bg-transparent" onClick={() => copyLink(p)}>
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar Link
                    </Button>
                    <Button size="sm" onClick={() => onCreateLanding?.(p)}>
                      <Wand2 className="w-3.5 h-3.5 mr-1.5" /> Crear Landing
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}