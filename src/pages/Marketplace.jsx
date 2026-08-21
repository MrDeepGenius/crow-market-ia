import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Check } from "lucide-react";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = ["Todos", "Bot de Trading", "Infoproducto", "Herramienta", "Herramienta IA"];

export default function Marketplace() {
  const [cat, setCat] = useState("Todos");
  const [q, setQ] = useState("");

  const filtered = SAMPLE_PRODUCTS.filter(
    (p) =>
      (cat === "Todos" || p.category === cat) &&
      (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.creator.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 grid-bg opacity-20" />
      <div className="fixed -top-1/4 left-1/3 -z-10 w-[50rem] h-[50rem] rounded-full bg-[radial-gradient(circle,hsl(276_91%_55%_/_0.12),transparent_60%)] blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground mt-2">Descubre bots validados, herramientas e infoproductos premium.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Buscar productos..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-11 bg-secondary/50 border-border"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                cat === c ? "bg-primary text-primary-foreground glow-violet" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">No se encontraron productos.</div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ p, i = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.06 }}
      className="group glass rounded-2xl overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden">
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
        <div className="flex gap-2 mt-4">
          <Button size="sm" className="flex-1 h-10">Comprar ahora</Button>
          {p.affiliate && (
            <Button size="sm" variant="outline" className="flex-1 h-10 bg-transparent border-border hover:bg-secondary">
              Afiliarme
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}