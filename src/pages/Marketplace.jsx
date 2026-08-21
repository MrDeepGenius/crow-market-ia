import React, { useState, useMemo } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SAMPLE_PRODUCTS, MARKET_CATEGORIES } from "@/data/products";
import BotCard from "@/components/marketplace/BotCard";
import InfoCard from "@/components/marketplace/InfoCard";
import ProductModal from "@/components/marketplace/ProductModal";
import FilterBar from "@/components/marketplace/FilterBar";
import PublicNavbar from "@/components/PublicNavbar";
import { useAuth } from "@/lib/AuthContext";

export default function Marketplace() {
  const [cat, setCat] = useState("Todos");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("populares");
  const [payType, setPayType] = useState("all");
  const [maxPrice, setMaxPrice] = useState(500);
  const [selected, setSelected] = useState(null);
  const { isAuthenticated } = useAuth();

  const suggestions = useMemo(() => {
    if (!q) return [];
    const ql = q.toLowerCase();
    return SAMPLE_PRODUCTS.filter((p) => p.name.toLowerCase().includes(ql) || p.creator.toLowerCase().includes(ql)).slice(0, 5);
  }, [q]);

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
    let list = SAMPLE_PRODUCTS.filter(
      (p) =>
        (cat === "Todos" || p.category === cat) &&
        (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.creator.toLowerCase().includes(q.toLowerCase())) &&
        matchesFilters(p)
    );
    return applySort(list);
  }, [cat, q, sort, payType, maxPrice]);

  const bots = filtered.filter((p) => p.type === "bot");
  const others = filtered.filter((p) => p.type !== "bot");

  return (
    <div className="min-h-screen bg-background">
      {!isAuthenticated && <PublicNavbar />}
      <div className="fixed inset-0 -z-10 grid-bg opacity-20" />
      <div className="fixed -top-1/4 left-1/3 -z-10 w-[50rem] h-[50rem] rounded-full bg-[radial-gradient(circle,hsl(276_91%_55%_/_0.14),transparent_60%)] blur-3xl" />
      <div className="fixed top-1/3 -right-1/4 -z-10 w-[40rem] h-[40rem] rounded-full bg-[radial-gradient(circle,hsl(190_90%_50%_/_0.10),transparent_60%)] blur-3xl" />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-8 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary mb-5">
          <Sparkles className="w-3 h-3" /> Marketplace Crow Market
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl tracking-tight max-w-3xl mx-auto leading-tight">
          Descubre herramientas, <span className="text-gradient-violet">bots de trading e IA</span> validados para potenciar tu negocio
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm sm:text-base">
          Compra o alquila bots auditados, infoproductos y herramientas de IA. Resultados verificados, conversion rapida.
        </p>

        {/* Busqueda con autocompletado */}
        <div className="relative max-w-xl mx-auto mt-7">
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

        {/* Tabs de categorias */}
        <div className="flex flex-wrap justify-center gap-2 mt-7">
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
      </section>

      {/* CONTENIDO + FILTROS */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 grid lg:grid-cols-[260px_1fr] gap-6">
        <FilterBar sort={sort} setSort={setSort} payType={payType} setPayType={setPayType} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />

        <div className="space-y-10">
          {/* Bots destacados */}
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

          {/* Infoproductos & herramientas */}
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