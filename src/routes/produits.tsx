import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { AiSearchBar } from "@/components/AiSearchBar";

const allProductsQO = queryOptions({
  queryKey: ["products", "all"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, short_description, price, currency, image_url, badge, rating")
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
      { name: "description", content: "Tous nos produits de bien-être et phytothérapie." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allProductsQO),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products } = useSuspenseQuery(allProductsQO);
  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-extrabold text-navy sm:text-4xl">Boutique</h1>
      <p className="mt-2 text-muted-foreground">{products.length} produits disponibles.</p>
      <div className="mt-6 max-w-2xl"><AiSearchBar size="md" /></div>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p: any) => (
          <ProductCard key={p.id} product={{ ...p, price: Number(p.price), rating: Number(p.rating) }} />
        ))}
      </div>
    </div>
  );
}
