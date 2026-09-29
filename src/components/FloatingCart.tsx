import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, cartCount, cartTotal } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";

export function FloatingCart() {
  const items = useCart();
  const count = cartCount(items);
  const total = cartTotal(items);
  const { format: formatCurrency } = useCurrency();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // Ne pas afficher si le panier est vide ou si l'utilisateur est déjà sur la page /panier
  if (count === 0 || pathname === "/panier") {
    return null;
  }

  return (
    <aside
      aria-label="Aperçu du panier"
      className="fixed bottom-[calc(4.85rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-35 max-w-[calc(100vw-1.5rem)] animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <Link
        to="/panier"
        className="group flex items-center gap-3 rounded-full bg-emerald-800 text-white px-4 sm:px-5 py-2.5 sm:py-3 shadow-[0_12px_30px_-5px_rgba(20,90,50,0.5)] border border-emerald-600/50 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition touch-manipulation"
      >
        <div className="relative grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white">
          <ShoppingBag className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-amber-400 px-1 text-[10px] font-black text-slate-950 shadow-xs">
            {count}
          </span>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold leading-tight">
            Panier en cours
          </span>
          <span className="text-xs sm:text-sm font-bold text-white leading-tight">
            {count} article{count > 1 ? "s" : ""} • {formatCurrency(total)}
          </span>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-white text-emerald-900 font-bold px-3 py-1.5 text-xs group-hover:bg-amber-400 group-hover:text-slate-950 transition ml-1 shrink-0">
          <span>Voir le panier</span>
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </div>
      </Link>
    </aside>
  );
}
