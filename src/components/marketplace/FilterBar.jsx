import React from "react";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

const sortOptions = [
  { id: "populares", label: "Mas Populares" },
  { id: "calificados", label: "Mejor Calificados" },
  { id: "rentabilidad", label: "Mayor Rentabilidad (Bots)" },
  { id: "novedades", label: "Novedades" },
];

export default function FilterBar({ sort, setSort, payType, setPayType, maxPrice, setMaxPrice }) {
  return (
    <aside className="glass rounded-2xl p-4 space-y-5 lg:sticky lg:top-4 h-fit">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <SlidersHorizontal className="w-4 h-4 text-primary" /> Filtros
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3" /> Ordenar por
        </p>
        <div className="space-y-1.5">
          {sortOptions.map((o) => (
            <button
              key={o.id}
              onClick={() => setSort(o.id)}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg transition ${sort === o.id ? "bg-primary/15 text-primary border border-primary/30" : "border border-transparent text-muted-foreground hover:bg-secondary/50"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Tipo de pago</p>
        <div className="space-y-1.5">
          {[
            { id: "all", label: "Todos" },
            { id: "unique", label: "Pago unico" },
            { id: "rent", label: "Alquiler mensual" },
          ].map((o) => (
            <button
              key={o.id}
              onClick={() => setPayType(o.id)}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg transition ${payType === o.id ? "bg-primary/15 text-primary border border-primary/30" : "border border-transparent text-muted-foreground hover:bg-secondary/50"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Precio maximo: ${maxPrice}</p>
        <input
          type="range"
          min={10}
          max={500}
          step={10}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[hsl(var(--primary))]"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>$10</span>
          <span>$500</span>
        </div>
      </div>
    </aside>
  );
}