import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import type React from "react";
import {
  Shield,
  Leaf,
  Moon,
  Sparkles,
  Zap,
  ArrowRight,
  Truck,
  BadgeCheck,
  MessageCircle,
  Star,
  HelpCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { AiSearchBar } from "@/components/AiSearchBar";
import { useCms } from "@/lib/cms-store";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  leaf: Leaf,
  moon: Moon,
  sparkles: Sparkles,
  zap: Zap,
};

const featuredQO = queryOptions({
  queryKey: ["products", "featured"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, short_description, price, currency, image_url, badge, rating")
      .eq("active", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw error;
    return data ?? [];
  },
});

const categoriesQO = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, description, icon")
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
});

const newestQO = queryOptions({
  queryKey: ["products", "newest"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, short_description, price, currency, image_url, badge, rating")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(4);
    if (error) throw error;
    return data ?? [];
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Phytocare — Boutique bien-être & phytothérapie biologique" },
      {
        name: "description",
        content:
          "Trouvez le produit naturel qu'il vous faut grâce à notre recherche intelligente. Règlements en Euros par virement IBAN ou carte.",
      },
      { property: "og:title", content: "Phytocare — Boutique bien-être & phytothérapie biologique" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(featuredQO),
      context.queryClient.ensureQueryData(categoriesQO),
      context.queryClient.ensureQueryData(newestQO),
    ]);
  },
  component: HomePage,
});

function HomePage() {
  const { data: featured } = useSuspenseQuery(featuredQO);
  const { data: categories } = useSuspenseQuery(categoriesQO);
  const { data: newest } = useSuspenseQuery(newestQO);
  const cms = useCms();

  const isSectionEnabled = (idOrType: string) => {
    const s = cms.sections.find((sec) => sec.id === idOrType || sec.type === idOrType);
    return s ? s.enabled : true;
  };

  const getSection = (id: string) => cms.sections.find((sec) => sec.id === id);

  const customSections = cms.sections.filter(
    (s) => s.type === "custom_content" && s.enabled
  );

  return (
    <div>
      {/* Hero Section Dynamic from CMS */}
      {isSectionEnabled("sec-hero") && (
        <section className="relative overflow-hidden bg-gradient-to-b from-mint/60 via-background to-background">
          <div className="container-page grid gap-10 py-12 md:py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {cms.hero.badge || "Recherche intelligente & Phytothérapie"}
              </span>

              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-navy sm:text-5xl lg:text-6xl">
                {cms.hero.title || "Le bon produit naturel,"}
                <br />
                <span className="text-primary">{cms.hero.titleHighlight || "au bon moment."}</span>
              </h1>

              <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg leading-relaxed">
                {cms.hero.subtitle ||
                  "Décrivez simplement ce que vous ressentez (stress, fatigue, sommeil difficile…). Notre IA vous oriente vers les produits adaptés."}
              </p>

              <div className="mt-6 max-w-2xl">
                <AiSearchBar />
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" /> Livraison suivie en Europe & International
                </div>
                <div className="inline-flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" /> Qualité bio sélectionnée
                </div>
                <div className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" /> Paiement sécurisé (Carte & Virement)
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-6 rounded-[40px] bg-primary/10 blur-2xl" />
              <img
                src={
                  cms.hero.imageUrl ||
                  "https://images.unsplash.com/photo-1611077418273-fac2d8b9b8f8?w=1000&q=80"
                }
                alt={cms.hero.title}
                className="relative aspect-[4/5] w-full rounded-[32px] object-cover shadow-[var(--shadow-card)]"
              />
              {cms.hero.floatingCardTitle && (
                <div className="absolute -bottom-6 -left-6 max-w-xs rounded-2xl border border-border bg-card p-4 shadow-xl">
                  {cms.hero.floatingCardBadge && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {cms.hero.floatingCardBadge}
                    </p>
                  )}
                  <p className="mt-1 font-display font-semibold text-navy">
                    {cms.hero.floatingCardTitle}
                  </p>
                  {cms.hero.floatingCardSubtitle && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cms.hero.floatingCardSubtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Catégories */}
      {isSectionEnabled("sec-categories") && (
        <section className="container-page py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
                {getSection("sec-categories")?.title || "Catégories"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {getSection("sec-categories")?.subtitle || "Explorez par besoin de santé et bien-être."}
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c: any) => {
              const Icon = ICONS[c.icon ?? ""] ?? Leaf;
              return (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-mint text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-base font-semibold text-navy">{c.name}</span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{c.description}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Produits vedettes */}
      {isSectionEnabled("sec-featured") && (
        <section className="container-page py-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
                {getSection("sec-featured")?.title || "Produits vedettes"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {getSection("sec-featured")?.subtitle || "Les essentiels plébiscités par nos clients."}
              </p>
            </div>
            <Link
              to="/produits"
              className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p: any) => (
              <ProductCard
                key={p.id}
                product={{ ...p, price: Number(p.price), rating: Number(p.rating) }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Nouveautés */}
      {isSectionEnabled("sec-newest") && (
        <section className="container-page py-14">
          <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
            {getSection("sec-newest")?.title || "Nouveautés du Laboratoire"}
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {newest.map((p: any) => (
              <ProductCard
                key={p.id}
                product={{ ...p, price: Number(p.price), rating: Number(p.rating) }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Sections personnalisées créées par l'administrateur */}
      {customSections.map((sec) => (
        <section key={sec.id} className="container-page py-12">
          <div className="rounded-3xl border border-border bg-card p-6 md:p-12 shadow-xs grid gap-8 md:grid-cols-2 items-center">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> Engagement Phytocare
              </span>
              <h2 className="font-display text-2xl md:text-4xl font-extrabold text-navy">
                {sec.title}
              </h2>
              {sec.subtitle && (
                <p className="mt-2 text-base text-muted-foreground font-medium">{sec.subtitle}</p>
              )}
              {sec.data?.content && (
                <p className="mt-4 text-sm md:text-base text-foreground/80 leading-relaxed whitespace-pre-line">
                  {sec.data.content}
                </p>
              )}
            </div>
            {sec.data?.imageUrl && (
              <div className="overflow-hidden rounded-2xl aspect-video md:aspect-square bg-muted shadow-sm">
                <img
                  src={sec.data.imageUrl}
                  alt={sec.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Avis & Témoignages clients (CMS) */}
      {isSectionEnabled("sec-reviews") && (
        <section className="bg-mint/20 py-16">
          <div className="container-page">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
              <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
                Ce que nos clients disent
              </h2>
              <p className="text-sm text-muted-foreground">
                Des retours d'expérience authentiques sur l'efficacité de nos remèdes naturels.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  name: "Sophie D.",
                  city: "Lyon, France",
                  text: "L'élixir Sommeil Réparateur a transformé mes nuits. Je m'endors plus vite et me réveille sans aucune lourdeur. Virement simple et commande reçue en 48h.",
                  product: "Sommeil Réparateur",
                },
                {
                  name: "Marc T.",
                  city: "Bruxelles, Belgique",
                  text: "Très sceptique au départ, l'Ashwagandha m'a permis de traverser une période de surmenage intense au travail avec un calme impressionnant.",
                  product: "Ashwagandha KSM-66",
                },
                {
                  name: "Dr. Aïcha K.",
                  city: "Cotonou",
                  text: "Des extraits titrés de haute qualité. La clarté des conseils donnés par Dorine et l'équipe WhatsApp est remarquable.",
                  product: "Complexe Immunité Pro",
                },
              ].map((rev, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/90 italic leading-relaxed">
                      « {rev.text} »
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-navy">{rev.name}</p>
                      <p className="text-muted-foreground">{rev.city}</p>
                    </div>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                      {rev.product}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Foire Aux Questions (FAQ) */}
      {isSectionEnabled("sec-faq") && (
        <section className="container-page py-16 max-w-4xl">
          <div className="text-center space-y-2 mb-10">
            <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
              Foire Aux Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Toutes les réponses à vos interrogations sur nos remèdes et nos livraisons.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Quels sont les modes de paiement acceptés ?",
                a: "Vous pouvez régler vos commandes en toute sécurité par Carte Bancaire (Visa, Mastercard, 3D-Secure), par Virement Bancaire protégé (les coordonnées officielles vous sont transmises sur votre reçu lors de la commande) ou via notre assistance WhatsApp.",
              },
              {
                q: "Comment s'effectue la livraison ?",
                a: "Les colis sont expédiés sous 24 à 48 heures dans des emballages soignés préservant les propriétés des plantes. Un numéro de suivi postal vous est transmis dès l'expédition.",
              },
              {
                q: "Vos remèdes sont-ils certifiés biologiques ?",
                a: "Oui, la totalité de nos extraits et plantes médicinales sont rigoureusement sélectionnés, issus de l'agriculture biologique ou de cueillette sauvage durable et sans pesticides.",
              },
              {
                q: "Comment contacter votre équipe en cas de question de santé ?",
                a: "Vous pouvez solliciter notre assistante d'orientation Dorine disponible 24h/24 en bas à droite de votre écran ou échanger directement par WhatsApp avec nos conseillers.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
                <h4 className="font-display font-bold text-sm md:text-base text-navy flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                  {faq.q}
                </h4>
                <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trust banner */}
      {isSectionEnabled("sec-reassurance") && (
        <section className="bg-mint/40 py-12">
          <div className="container-page grid gap-6 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: "Qualité & Pureté Certifiée",
                text: "Plantes rigoureusement sélectionnées et standardisées.",
              },
              {
                icon: Truck,
                title: "Livraison Rapide & Suivie",
                text: "Expédition sécurisée et soignée partout dans le monde.",
              },
              {
                icon: Lock,
                title: "Paiement Sécurisé & Garanti",
                text: "Transactions bancaires chiffrées et assistance dédiée 7j/7.",
              },
            ].map((b) => (
              <div key={b.title} className="flex items-start gap-3 rounded-2xl bg-background p-5 shadow-2xs">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display font-semibold text-navy">{b.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
