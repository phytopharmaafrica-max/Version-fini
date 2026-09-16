import { Sparkles, Search, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { aiSearchProducts, type SearchedProduct } from "@/lib/ai-search.functions";
import { formatPrice } from "@/lib/cart";

export function AiSearchBar({ size = "lg" }: { size?: "lg" | "md" }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchedProduct[] | null>(null);
  const [meta, setMeta] = useState<{ category: string | null } | null>(null);
  const search = useServerFn(aiSearchProducts);
  const ref = useRef<HTMLDivElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const r = await search({ data: { query: q } });
      setResults(r.results);
      setMeta({ category: r.category });
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <form
        onSubmit={onSubmit}
        className={`flex items-center gap-2 rounded-full border border-border bg-background pr-2 shadow-[var(--shadow-soft)] ${
          size === "lg" ? "p-2 pl-5" : "p-1.5 pl-4"
        }`}
      >
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Décrivez ce que vous ressentez : stress, fatigue, sommeil…"
          className={`flex-1 bg-transparent outline-none placeholder:text-muted-foreground ${
            size === "lg" ? "py-2.5 text-base" : "py-2 text-sm"
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="hidden sm:inline">Rechercher</span>
        </button>
      </form>

      {results && (
        <div className="absolute left-0 right-0 z-30 mt-2 max-h-[420px] overflow-auto rounded-2xl border border-border bg-popover p-3 shadow-xl">
          {meta?.category && (
            <p className="px-2 pb-2 text-xs text-muted-foreground">
              Catégorie suggérée :{" "}
              <Link
                to="/category/$slug"
                params={{ slug: meta.category }}
                className="font-semibold text-primary hover:underline"
                onClick={() => setResults(null)}
              >
                {meta.category}
              </Link>
            </p>
          )}
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Aucun produit ne correspond. Essayez d'autres mots-clés (ex. "j'ai du mal à dormir").
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    onClick={() => setResults(null)}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-accent"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-mint">
                      {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.short_description}</p>
                    </div>
                    <span className="text-sm font-semibold text-navy">{formatPrice(p.price, p.currency)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 px-2 text-[11px] text-muted-foreground">
            Les recommandations IA sont indicatives. Pour tout conseil médical, consultez un professionnel.
          </p>
        </div>
      )}
    </div>
  );
}
