import React from "react";
import { motion } from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";

export default function InfoCard({ p, i = 0, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: i * 0.05 }}
      onClick={() => onOpen(p)}
      className="group glass rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative h-40 overflow-hidden">
        <Image src={p.image} alt={p.name} className="w-full h-full" fittingType="fill" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 uppercase tracking-wider">
          {p.tag}
        </span>
        {p.verified && (
          <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Verificado
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <p className="text-[11px] text-muted-foreground">{p.creator}</p>
        <h3 className="font-semibold text-base leading-tight">{p.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
        <div className="flex items-center gap-1 text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{p.rating}</span>
          <span className="text-muted-foreground">· {p.reviews} valoraciones</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold">${p.price}</span>
            <span className="text-[11px] text-muted-foreground">{p.period === "pago unico" ? "/ pago unico" : "/mes"}</span>
          </div>
          <Button size="sm" variant="outline" className="h-9 bg-transparent" onClick={(e) => { e.stopPropagation(); onOpen(p); }}>
            {p.type === "info" ? "Obtener Acceso" : "Ver Detalles"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}