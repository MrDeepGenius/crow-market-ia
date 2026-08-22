import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SAMPLE_PRODUCTS, MARKET_CATEGORIES, normalizeEntityProduct } from "@/data/products";
import BotCard from "@/components/marketplace/BotCard";
import InfoCard from "@/components/marketplace/InfoCard";
import ProductModal from "@/components/marketplace/ProductModal";
import FilterBar from "@/components/marketplace/FilterBar";
import { base44 } from "@/api/base44Client";

// Núcleo reutilizable del Marketplace: búsqueda, categorías, filtros, grilla y modal.
// Se usa tanto en la página pública /marketplace como dentro del panel de creador.
export default function MarketplaceBrowser() {
  const [cat, setCat] = useState("Todos");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("populares");
  const [payType, setPayType] = useState("all");
  const [maxPrice, setMaxPrice] = useState(500);
  const [selected, setSelected] = useState(null);
  const [userProducts, setUserProducts] = useState([]);

  useEffect(() => {
    let active = true;
    base44.functions.invoke("listPublishedProducts", {})
      .then((res) => {
        if (!active) return;
        const rows = res?.data?.products || res?.products || [];
        setUserProducts(rows.map(normalizeEntityProduct));
      })
      .catch(() => {
        /* catálogo curado sigue disponible */
      });
    return () => { active = false; };
  }, []);

  const catalog = useMemo(() => [...userProducts, ...SAMPLE_PRODUCTS], [userProducts]);

  const suggestions = useMemo(() => {
    if (!q) return [];
    const ql = q.toLowerCase();
    return catalog.filter((p) => p.name.toLowerCase().includes(ql) || p.creator.toLowerCase().includes(ql)).slice(0, 5);
  }, [q, catalog]);

  const matchesFilters = (p) => {
    const price = p.type === "bot" ? Math.min(p.rentPrice, p.buyPrice) : p.price;
    if (price > maxPrice) return false;
    if (payType === "unique" && !(p.period === "pago unico" || (p.type === "bot" && p.buyPrice))) return p.period === "pago unico";
    if (payType === "rent" && !(p.period === "mes" || p.type === "bot")) return false;
    return true;
  };

  const applySort = (list) => {
    const arr = [...list];
    switch (sort) {
      case "calificados":
        return arr.sort((a, b) => b.rating - a.rating);
      case "rentabilidad":
        return arr.sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
      case "novedades":
        return arr.sort((a, b) => (a.tag === "Nuevo" ? -1 : 0) - (b.tag === "Nuevo" ? -1 : 0));
      default:
        return arr.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.reviews - a.reviews);
    }
  };

  const filtered = useMemo(() => {
    let list = catalog.filter(
      (p) =>
        (cat === "Todos" || p.category === cat) &&
        (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.creator.toLowerCase().includes(q.toLowerCase())) &&
        matchesFilters(p)
    );
    return applySort(list);
  }, [catalog, cat, q, sort, payType, maxPrice]);

  const bots = filtered.filter((p) => p.type === "bot");
  const others = filtered.filter((p) => p.type !== "bot");

  return (
    <div className="space-y-8">
      {/* Búsqueda + categorías */}
      <div className="text-center">
        <div className="relative max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar bots, cursos, herramientas..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-12 pl-11 pr-4 text-base bg-secondary/50 border-border rounded-2xl"
            />
          </div>
          {suggestions.length > 0 && (
            <div className="absolute z-20 top-full mt-2 w-full glass-strong rounded-xl border border-border overflow-hidden text-left">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelected(s); setQ(""); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/60 transition text-sm"
                >
                  <Search className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{s.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {MARKET_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${cat === c ? "bg-primary text-primary-foreground glow-violet" : "glass text-muted-foreground hover:text-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros + grilla */}
      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <FilterBar sort={sort} setSort={setSort} payType={payType} setPayType={setPayType} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />

        <div className="space-y-10">
          {bots.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-xl">Bots de Trading & IA</h2>
                <span className="text-xs text-muted-foreground">{bots.length} bots</span>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {bots.map((p, i) => (
                  <BotCard key={p.id} p={p} i={i} onOpen={setSelected} />
                ))}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-xl">Infoproductos & Herramientas</h2>
                <span className="text-xs text-muted-foreground">{others.length} productos</span>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {others.map((p, i) => (
                  <InfoCard key={p.id} p={p} i={i} onOpen={setSelected} />
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">No se encontraron productos con esos filtros.</div>
          )}
        </div>
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}