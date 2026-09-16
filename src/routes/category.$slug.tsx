import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";

const catQO = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data: cat, error } = await supabase
        .from("categories")
        .select("id, slug, name, description")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!cat) return null;
      const { data: products, error: e2 } = await supabase
        .from("products")
        .select("id, slug, name, short_description, price, currency, image_url, badge, rating")
        .eq("active", true)
        .eq("category_id", cat.id)
        .order("created_at", { ascending: false });
      if (e2) throw e2;
      return { cat, products: products ?? [] };
    },
  });

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Phytocare` },
      { name: "description", content: `Produits de la catégorie ${params.slug}.` },
    ],
  }),
  loader: async ({ context, params }) => {
    const r = await context.queryClient.ensureQueryData(catQO(params.slug));
    if (!r) throw notFound();
  },
  notFoundComponent: () => (
    <div className="container-page py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Catégorie introuvable</h1>
    </div>
  ),
  errorComponent: ({ error }: { error: any }) => (
    <div className="container-page py-20 text-center text-muted-foreground">{(error as any)?.message || "Erreur"}</div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(catQO(slug));
  if (!data) return null;
  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-extrabold capitalize text-navy sm:text-4xl">{data.cat.name}</h1>
      {data.cat.description && <p className="mt-2 max-w-2xl text-muted-foreground">{data.cat.description}</p>}
      {data.products.length === 0 ? (
        <p className="mt-10 text-muted-foreground">Aucun produit dans cette catégorie pour l'instant.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.products.map((p: any) => (
            <ProductCard key={p.id} product={{ ...p, price: Number(p.price), rating: Number(p.rating) }} />
          ))}
        </div>
      )}
    </div>
  );
}
