import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Check, Copy, Wand2, Search } from "lucide-react";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/AuthContext";

const categories = ["Todos", "Bot de Trading", "Infoproducto", "Herramienta", "Herramienta IA"];

export default function AffiliateMarketplace({ onCreateLanding }) {
  const { user } = useAuth();
  const affiliateCode = user?.id ? user.id.slice(0, 8).toUpperCase() : "AFFILIATE";
  const [cat, setCat] = useState("Todos");
  const [q, setQ] = useState("");

  const filtered = SAMPLE_PRODUCTS.filter(
    (p) =>
      (cat === "Todos" || p.category === cat) &&
      (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.creator.toLowerCase().includes(q.toLowerCase()))
  );

  const copyLink = (p) => {
    navigator.clipboard?.writeText(`https://crowmarket.ai/r/${affiliateCode}/${p.id}`);
    toast({ title: "Link copiado", description: `Link de afiliado de ${p.name} (código ${affiliateCode}).` });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-heading font-bold text-xl">Marketplace</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Promueve bots y herramientas con tu link de afiliado único (código <strong className="text-primary">{affiliateCode}</strong>).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11 bg-secondary/50 border-border pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                cat === c ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group glass rounded-2xl overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1"
          >
            <div className="relative h-40 overflow-hidden">
              <Image src={p.image} alt={p.name} className="w-full h-full" fittingType="fill" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <span className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary">
                {p.tag}
              </span>
              {p.affiliate && (
                <span className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-400/15 border border-green-400/30 text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Afiliados
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{p.creator}</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {p.rating} · {p.reviews}
                </span>
              </div>
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <span className="font-bold text-lg">US${p.price}</span>
                  <span className="text-xs text-muted-foreground"> / {p.period}</span>
                </div>
                {p.affiliate && (
                  <span className="text-xs font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/10">
                    Comisión {p.commission}%
                  </span>
                )}
              </div>
              {p.affiliate ? (
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="flex-1 h-10" onClick={() => onCreateLanding?.(p)}>
                    <Wand2 className="w-3.5 h-3.5 mr-1.5" /> Crear Landing
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-10 bg-transparent border-border hover:bg-secondary" onClick={() => copyLink(p)}>
                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Mi link
                  </Button>
                </div>
              ) : (
                <div className="mt-4 text-xs text-muted-foreground text-center py-2 rounded-xl bg-secondary/30 border border-border">
                  Programa de afiliados no disponible
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">No se encontraron productos.</div>
      )}
    </div>
  );
}