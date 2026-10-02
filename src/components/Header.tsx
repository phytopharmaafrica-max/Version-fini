import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Menu, X, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCart, cartCount } from "@/lib/cart";
import { useRoles } from "@/lib/use-roles";
import { useCms } from "@/lib/cms-store";
import { useI18n } from "@/lib/i18n";
import { ThemeSwitcher, LanguageSwitcher, CurrencySwitcher } from "./ThemeSwitcher";
import { PWAInstallButton } from "./PWAInstallButton";

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
    { to: "/category/$slug", params: { slug: "sante-intime" }, label: "Santé Intime" },
    { to: "/category/$slug", params: { slug: "energie" }, label: t("nav.energy", "Énergie") },
    { to: "/category/$slug", params: { slug: "sommeil" }, label: t("nav.sleep", "Sommeil") },
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
            <Link to="/" className="flex items-center gap-2 font-display text-base sm:text-lg font-bold text-foreground shrink-0">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xs shrink-0">
                <Leaf className="h-4 w-4" />
              </span>
              <span className="truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">{cms.siteName || "Phytocare"}</span>
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
            {/* International & Premium Controls visible on tablet, desktop, TV */}
            <div className="hidden sm:flex items-center gap-1">
              <ThemeSwitcher />
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>

            <PWAInstallButton variant="header" />

            {(isAdmin || isMasterAdmin) && (
              <Link
                to="/admin"
                className="hidden md:inline-flex h-8 items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 text-[11px] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition"
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

            {/* Bouton Panier mis en valeur et visible en permanence */}
            <Link
              to="/panier"
              className={`relative inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-1.5 transition text-xs sm:text-sm font-bold border shrink-0 ${
                count > 0
                  ? "bg-primary text-primary-foreground border-primary shadow-sm hover:brightness-110"
                  : "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground"
              }`}
              aria-label={`${t("nav.cart", "Panier")} (${count})`}
              title={t("nav.cart", "Mon panier")}
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span className="font-bold hidden xs:inline">{t("nav.cart", "Panier")}</span>
              <span
                className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-black leading-none ${
                  count > 0
                    ? "bg-amber-400 text-slate-950 shadow-2xs"
                    : "bg-primary/20 text-primary"
                }`}
              >
                {count}
              </span>
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
              {/* Entrée Panier bien visible dans le menu mobile */}
              <Link
                to="/panier"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground transition border border-primary/20 mb-1"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{t("nav.cart", "Mon panier")}</span>
                </span>
                <span className="rounded-full bg-primary text-primary-foreground px-2.5 py-0.5 text-xs font-bold">
                  {count} article{count > 1 ? "s" : ""}
                </span>
              </Link>

              {/* Préférences (Langue, Devise, Thème) sur mobile */}
              <div className="sm:hidden flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl my-1 border border-border">
                <span className="text-xs font-semibold text-muted-foreground">Préférences :</span>
                <div className="flex items-center gap-1">
                  <ThemeSwitcher />
                  <LanguageSwitcher />
                  <CurrencySwitcher />
                </div>
              </div>

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

              <div className="pt-2 border-t border-border mt-1">
                <PWAInstallButton variant="drawer" />
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
