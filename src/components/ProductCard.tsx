import { Link } from "@tanstack/react-router";
import { Star, ShoppingCart } from "lucide-react";
import { cart, formatPrice } from "@/lib/cart";
import { toast } from "sonner";

export type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  badge: string | null;
  rating: number;
};

export function ProductCard({ product }: { product: Product }) {
  const add = (e: React.MouseEvent) => {
    e.preventDefault();
    cart.add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      currency: product.currency,
      image_url: product.image_url,
    });
    toast.success("Ajouté au panier", { description: product.name });
  };

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-square overflow-hidden bg-mint/40">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">Image</div>
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            {product.badge}
          </span>
        )}
        <button
          type="button"
          onClick={add}
          aria-label="Ajouter au panier"
          className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition group-hover:opacity-100"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
        </div>
        <h3 className="font-display text-base font-semibold leading-tight text-foreground">{product.name}</h3>
        {product.short_description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-lg font-bold text-navy">
            {formatPrice(Number(product.price), product.currency)}
          </span>
          <button
            type="button"
            onClick={add}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary sm:hidden"
          >
            Ajouter
          </button>
        </div>
      </div>
    </Link>
  );
}
