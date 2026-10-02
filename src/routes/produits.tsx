import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { AiSearchBar } from "@/components/AiSearchBar";
import { SEED_CATEGORIES } from "@/data/phytocare-seed";
import { Sparkles, Heart } from "lucide-react";

const allProductsQO = queryOptions({
  queryKey: ["products", "all"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, short_description, price, currency, image_url, badge, rating, category_id, images, video_url")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const Route = createFileRoute("/produits")({
  head: () => ({
    meta: [
      { title: "Boutique — Tous les produits | Phytocare" },
      { name: "description", content: "Tous nos remèdes naturels : Immunité, Énergie, Sommeil, Digestion, Santé Intime & Vigueur." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allProductsQO),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products } = useSuspenseQuery(allProductsQO);
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const filteredProducts = selectedCat === "all"
    ? products
    : products.filter((p: any) => p.category_id === selectedCat);

  return (
    <div className="container-page py-10 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">Boutique & Remèdes Naturels</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length} préparations herboristes biologiques disponibles.
        </p>
      </div>

      <div className="max-w-2xl">
        <AiSearchBar size="md" />
      </div>

      {/* FILTRES PAR CATÉGORIES (AVEC LA SECTION SANTÉ INTIME & VIGUEUR À CÔTÉ D'IMMUNITÉ ET ÉNERGIE) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          type="button"
          onClick={() => setSelectedCat("all")}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition border ${
            selectedCat === "all"
              ? "bg-primary text-primary-foreground border-primary shadow-xs"
              : "bg-card border-border text-muted-foreground hover:border-primary/50"
          }`}
        >
          Tous ({products.length})
        </button>

        {SEED_CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          const count = products.filter((p: any) => p.category_id === cat.id).length;
          const isIntimate = cat.id === "cat-6-intimite";

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition border ${
                isSelected
                  ? isIntimate
                    ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                    : "bg-primary text-primary-foreground border-primary shadow-xs"
                  : isIntimate
                  ? "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:border-rose-400"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {isIntimate && <Heart className="h-3.5 w-3.5 fill-current" />}
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Aucun produit dans cette catégorie pour le moment.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((p: any) => (
            <ProductCard key={p.id} product={{ ...p, price: Number(p.price), rating: Number(p.rating) }} />
          ))}
        </div>
      )}
    </div>
  );
}
