import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Menu, X, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCart, cartCount } from "@/lib/cart";
import { useRoles } from "@/lib/use-roles";
import { useCms } from "@/lib/cms-store";
import { useI18n } from "@/lib/i18n";
import { ThemeSwitcher, LanguageSwitcher, CurrencySwitcher } from "./ThemeSwitcher";

export function Header() {
  const items = useCart();
  const count = cartCount(items);
  const { isAdmin, user } = useRoles();
  const cms = useCms();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const isMasterAdmin = (user?.email || "").toLowerCase().trim() === "emmaguscul@gmail.com";

  const navLinks = [
    { to: "/", label: t("nav.home", "Accueil") },
    { to: "/produits", label: t("nav.shop", "Boutique") },
    { to: "/category/$slug", params: { slug: "immunite" }, label: t("nav.immunity", "Immunité") },
    { to: "/category/$slug", params: { slug: "stress" }, label: t("nav.stress", "Stress") },
    { to: "/category/$slug", params: { slug: "sommeil" }, label: t("nav.sleep", "Sommeil") },
    { to: "/category/$slug", params: { slug: "energie" }, label: t("nav.energy", "Énergie") },
  ];

  return (
    <>
      {/* Announcement Bar from CMS */}
      {cms.announcement.enabled && cms.announcement.text && (
        <div className="bg-primary text-primary-foreground py-1.5 px-4 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="h-3.5 w-3.5 shrink-0 opacity-80" />
          <span>{cms.announcement.text}</span>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-border bg-white dark:bg-slate-950 shadow-xs">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xs">
                <Leaf className="h-4 w-4" />
              </span>
              <span className="truncate max-w-[170px] sm:max-w-none">{cms.siteName || "Phytocare"}</span>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to as never}
                  params={l.params as never}
                  activeOptions={{ exact: l.to === "/" }}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* International & Premium Controls */}
            <div className="flex items-center gap-1">
              <ThemeSwitcher />
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>

            {(isAdmin || isMasterAdmin) && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 text-[11px] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition"
                aria-label="Studio d'administration"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t("nav.admin", "Admin CMS")}</span>
              </Link>
            )}

            <Link
              to="/compte"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground sm:inline-flex"
              aria-label={t("nav.account", "Mon compte")}
              title={t("nav.account", "Mon compte")}
            >
              <User className="h-4 w-4" />
            </Link>

            <Link
              to="/panier"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
              aria-label={t("nav.cart", "Panier")}
              title={t("nav.cart", "Panier")}
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-border bg-white dark:bg-slate-950 shadow-xl lg:hidden">
            <nav className="container-page flex flex-col gap-1 py-3">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to as never}
                  params={l.params as never}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/compte"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                {t("nav.account", "Mon compte")}
              </Link>
              {(isAdmin || isMasterAdmin) && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20"
                >
                  {t("nav.admin", "Panneau d'Administration CMS")}
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
