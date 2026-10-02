import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Star, ShoppingCart, Check, MessageCircle } from "lucide-react";
import { useState } from "react";
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
          const seedMatch = SEED_PRODUCTS.find((sp) => sp.slug === slug);
          return {
            ...data,
            images: data.images || seedMatch?.images || [],
            video_url: data.video_url || seedMatch?.video_url || null,
          };
        }
      } catch (e) {
        console.warn("Supabase fetch failed, falling back to seed:", e);
      }
      const found = SEED_PRODUCTS.find((sp) => sp.slug === slug);
      if (found) {
        const cat = SEED_CATEGORIES.find((c) => c.id === found.category_id);
        return {
          ...found,
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
      <Link to="/produits" className="mt-4 inline-block text-primary hover:underline">Retour à la boutique</Link>
    </div>
  ),
  errorComponent: ({ error }: { error: any }) => (
    <div className="container-page py-20 text-center text-muted-foreground">{(error as any)?.message || "Erreur"}</div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQO(slug));
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();
  if (!p) return null;

  const addToCart = () => {
    cart.add(
      {
        id: p.id, slug: p.slug, name: p.name,
        price: Number(p.price), currency: p.currency, image_url: p.image_url,
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
            <Link to="/category/$slug" params={{ slug: p.categories.slug }} className="text-sm font-semibold uppercase tracking-wide text-primary hover:underline">
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
            <span className="font-display text-4xl font-extrabold text-navy">{formatPrice(Number(p.price), p.currency)}</span>
            {p.stock > 0 ? (
              <span className="text-sm text-primary inline-flex items-center gap-1"><Check className="h-4 w-4" /> En stock</span>
            ) : (
              <span className="text-sm text-destructive">Rupture</span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-11 w-11 text-lg">−</button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button type="button" onClick={() => setQty((q) => q + 1)} className="h-11 w-11 text-lg">+</button>
            </div>
            <button type="button" onClick={addToCart} className="btn-hero flex-1 sm:flex-none">
              <ShoppingCart className="h-4 w-4" /> Ajouter au panier
            </button>
            <a
              href={buildWhatsAppConsultationLink(p.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 transition"
              title="Demander conseil à un herboriste avant de commander"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              Conseil Herboriste WhatsApp
            </a>
          </div>

          {p.description && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-bold text-navy">Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{p.description}</p>
            </div>
          )}
          {p.benefits && (
            <div className="mt-6">
              <h2 className="font-display text-lg font-bold text-navy">Bienfaits</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{p.benefits}</p>
            </div>
          )}
          {p.usage && (
            <div className="mt-6">
              <h2 className="font-display text-lg font-bold text-navy">Mode d'utilisation</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{p.usage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
