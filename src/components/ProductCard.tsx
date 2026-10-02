import { Link, useNavigate } from "@tanstack/react-router";
import { Star, ShoppingCart, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { cart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import type React from "react";

export type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  images?: string[] | null;
  video_url?: string | null;
  badge: string | null;
  rating: number;
};

export function ProductCard({ product }: { product: Product }) {
  const { format: formatCurrency } = useCurrency();
  const navigate = useNavigate();

  // Consolider l'ensemble des photos disponibles pour ce produit
  const allImages = useMemo(() => {
    const list: string[] = [];
    if (product.image_url) list.push(product.image_url);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0
      ? list
      : ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80"];
  }, [product.image_url, product.images]);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Rotation automatique fluide des photos pour attirer le regard des visiteurs
  useEffect(() => {
    if (allImages.length <= 1) return;
    // Défilement automatique toutes les 3.2 secondes
    const interval = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % allImages.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [allImages.length]);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePhotoIndex((prev) => (prev + 1) % allImages.length);
  };

  const add = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    cart.add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      currency: product.currency,
      image_url: allImages[activePhotoIndex] || product.image_url,
    });
    toast.success("Ajouté au panier", {
      description: product.name,
      action: {
        label: "Voir le panier →",
        onClick: () => navigate({ to: "/panier" }),
      },
    });
  };

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      {/* Zone visuelle avec photos tournantes (carrousel animé) */}
      <div className="relative aspect-square overflow-hidden bg-mint/40 select-none">
        {allImages.map((src, index) => (
          <img
            key={`${src}-${index}`}
            src={src}
            alt={`${product.name} - vue ${index + 1}`}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${
              index === activePhotoIndex
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-105 pointer-events-none z-0"
            }`}
          />
        ))}

        {/* Badge produit vedette */}
        {product.badge && (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-navy/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-xs">
            {product.badge}
          </span>
        )}

        {/* Indicateur du nombre de photos tournantes (ex: 📷 1/4) */}
        {allImages.length > 1 && (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
            <Camera className="h-3 w-3" />
            <span>
              {activePhotoIndex + 1}/{allImages.length}
            </span>
          </div>
        )}

        {/* Flèches de navigation manuelle au survol */}
        {allImages.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
            <button
              type="button"
              onClick={handlePrevPhoto}
              aria-label="Photo précédente"
              className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full bg-white/90 dark:bg-slate-900/90 text-foreground shadow-md hover:bg-white active:scale-95 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              aria-label="Photo suivante"
              className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full bg-white/90 dark:bg-slate-900/90 text-foreground shadow-md hover:bg-white active:scale-95 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Puces indicatrices de position des photos tournantes */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 z-20 flex justify-center items-center gap-1.5 px-3">
            {allImages.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                aria-label={`Voir photo ${dotIdx + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActivePhotoIndex(dotIdx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  dotIdx === activePhotoIndex
                    ? "h-1.5 w-4 bg-primary shadow-xs"
                    : "h-1.5 w-1.5 bg-white/70 hover:bg-white dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
        )}

        {/* Bouton d'ajout rapide au panier */}
        <button
          type="button"
          onClick={add}
          aria-label="Ajouter au panier"
          className="absolute bottom-3 right-3 z-30 hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition group-hover:opacity-100 hover:scale-105 active:scale-95 touch-manipulation"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
        </div>
        <h3 className="font-display text-sm sm:text-base font-semibold leading-tight text-foreground line-clamp-2">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground">
            {product.short_description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2.5">
          <span className="font-display text-sm sm:text-base md:text-lg font-bold text-navy dark:text-emerald-400">
            {formatCurrency(Number(product.price))}
          </span>
          <button
            type="button"
            onClick={add}
            className="inline-flex sm:hidden items-center justify-center min-h-[36px] rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary active:scale-95 touch-manipulation"
          >
            Ajouter
          </button>
        </div>
      </div>
    </Link>
  );
}
