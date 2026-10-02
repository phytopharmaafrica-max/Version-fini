import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Star, ShoppingCart, Check, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cart, formatPrice } from "@/lib/cart";
import { buildWhatsAppConsultationLink } from "@/lib/whatsapp";
import { ProductMediaGallery } from "@/components/ProductMediaGallery";
import { SEED_PRODUCTS, SEED_CATEGORIES } from "@/data/phytocare-seed";

const productQO = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*, categories(slug, name)")
          .eq("slug", slug)
          .eq("active", true)
          .maybeSingle();

        if (!error && data) {
          return {
            ...data,
            // Respecter strictement les photos enregistrées par l'administrateur
            images: Array.isArray(data.images) ? data.images : [],
            video_url: data.video_url || null,
          };
        }
      } catch (e) {
        console.warn("Supabase fetch notice, falling back to seed:", e);
      }

      // Repli vers les graines initiales uniquement si le produit n'a jamais été chargé
      const found = SEED_PRODUCTS.find((sp) => sp.slug === slug);
      if (found) {
        const cat = SEED_CATEGORIES.find((c) => c.id === found.category_id);
        return {
          ...found,
          images: Array.isArray(found.images) ? found.images : [],
          categories: cat ? { slug: cat.slug, name: cat.name } : null,
          reviews_count: 24,
        };
      }
      return null;
    },
  });

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Phytocare` },
      { name: "description", content: `Découvrez ${params.slug} sur Phytocare.` },
      { property: "og:title", content: `${params.slug} — Phytocare` },
    ],
  }),
  loader: async ({ context, params }) => {
    const r = await context.queryClient.ensureQueryData(productQO(params.slug));
    if (!r) throw notFound();
  },
  notFoundComponent: () => (
    <div className="container-page py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Produit introuvable</h1>
      <Link to="/produits" className="mt-4 inline-block text-primary hover:underline">
        Retour à la boutique
      </Link>
    </div>
  ),
  errorComponent: ({ error }: { error: any }) => (
    <div className="container-page py-20 text-center text-muted-foreground">
      {(error as any)?.message || "Erreur"}
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: p } = useSuspenseQuery(productQO(slug));
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  // Invalider le cache et rafraîchir immédiatement la fiche produit dès qu'une modification est effectuée dans l'admin
  useEffect(() => {
    const handleProductsUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["product", slug] });
    };
    window.addEventListener("phytocare:products-updated", handleProductsUpdated);
    return () => window.removeEventListener("phytocare:products-updated", handleProductsUpdated);
  }, [queryClient, slug]);

  if (!p) return null;

  const addToCart = () => {
    cart.add(
      {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        currency: p.currency,
        image_url: p.image_url,
      },
      qty,
    );
    toast.success("Ajouté au panier", {
      description: `${p.name} (×${qty})`,
      action: {
        label: "Voir le panier →",
        onClick: () => navigate({ to: "/panier" }),
      },
    });
  };

  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="w-full">
          <ProductMediaGallery
            productName={p.name}
            coverImage={p.image_url}
            images={p.images}
            videoUrl={p.video_url}
            badge={p.badge}
          />
        </div>
        <div>
          {p.categories && (
            <Link
              to="/category/$slug"
              params={{ slug: p.categories.slug }}
              className="text-sm font-semibold uppercase tracking-wide text-primary hover:underline"
            >
              {p.categories.name}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl font-extrabold text-navy sm:text-4xl">{p.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold">{Number(p.rating).toFixed(1)}</span>
            <span className="text-muted-foreground">({p.reviews_count} avis)</span>
          </div>
          <p className="mt-4 text-base text-muted-foreground">{p.short_description}</p>
          <div className="mt-6 flex items-end gap-3">
            <span className="font-display text-4xl font-extrabold text-navy">
              {formatPrice(Number(p.price), p.currency)}
            </span>
            {p.stock > 0 ? (
              <span className="text-sm text-primary inline-flex items-center gap-1">
                <Check className="h-4 w-4" /> En stock
              </span>
            ) : (
              <span className="text-sm text-destructive">Rupture de stock</span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-11 w-11 text-lg"
              >
                −
              </button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="h-11 w-11 text-lg"
              >
                +
              </button>
            </div>
            <button type="button" onClick={addToCart} className="btn-hero flex-1 sm:flex-none">
              <ShoppingCart className="h-4 w-4" /> Ajouter au panier
            </button>
            <a
              href={buildWhatsAppConsultationLink(p.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-50 px-5 py-3 text-xs sm:text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" /> Poser une question à l'herboriste
            </a>
          </div>

          <div className="mt-8 border-t border-border pt-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-navy">Description & Utilisation</h2>
            <div className="prose prose-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {p.description}
            </div>
          </div>

          {p.benefits && p.benefits.length > 0 && (
            <div className="mt-6 rounded-2xl bg-mint/30 p-5 border border-primary/20">
              <h3 className="font-display text-base font-bold text-navy mb-3">Bienfaits & Propriétés</h3>
              <ul className="grid gap-2 text-sm text-foreground/90">
                {p.benefits.map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
