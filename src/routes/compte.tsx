import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { formatPrice } from "@/lib/cart";
import { toast } from "sonner";
import { User, LogOut, Package, Share2, MessageCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const Route = createFileRoute("/compte")({
  head: () => ({ meta: [{ title: "Mon compte — Phytocare" }] }),
  component: AccountPage,
});

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  en_attente: { label: "En attente", cls: "bg-amber-100 text-amber-900 border border-amber-200" },
  confirme: { label: "Confirmée", cls: "bg-blue-100 text-blue-900 border border-blue-200" },
  expedie: { label: "Expédiée", cls: "bg-purple-100 text-purple-900 border border-purple-200" },
  livre: { label: "Livrée", cls: "bg-emerald-100 text-emerald-900 border border-emerald-200" },
  annule: { label: "Annulée", cls: "bg-red-100 text-red-900 border border-red-200" },
};

function AccountPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/compte" } });
      return;
    }
    supabase.from("orders")
      .select("id, order_number, status, total, currency, items, created_at, customer_name, customer_address")
      .order("created_at", { ascending: false })
      .then(({ data, error }: any) => {
        if (error) console.error(error);
        setOrders(data ?? []);
        setBusy(false);
      });
  }, [user, loading, navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Vous avez été déconnecté avec succès.");
    navigate({ to: "/" });
  };

  if (loading || !user) return null;

  const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Client Phytocare";
  const isGoogle = user.app_metadata?.provider === "google" || user.user_metadata?.provider === "google";
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="container-page py-10 space-y-8">
      {/* Carte de profil utilisateur */}
      <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="h-16 w-16 rounded-full object-cover border-2 border-primary/30 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                  {fullName.charAt(0).toUpperCase()}
                </div>
              )}
              {isGoogle && (
                <span
                  title="Compte Google certifié"
                  className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow-sm border border-border/80"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-navy">{fullName}</h1>
                {isGoogle && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Google Connecté
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/affiliation"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition"
            >
              <Share2 className="h-3.5 w-3.5 text-primary" /> Espace Parrainage
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour, j'ai une question sur mon compte ou mes commandes Phytocare.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition"
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" /> Aide WhatsApp
            </a>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 text-destructive px-4 py-2 text-xs font-semibold hover:bg-destructive/10 transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Liste des commandes */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-navy flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Mes commandes
            </h2>
            <p className="text-xs text-muted-foreground">
              Historique complet de vos achats et suivi de livraison
            </p>
          </div>
          <Link to="/produits" className="text-xs font-semibold text-primary hover:underline">
            Explorer la boutique →
          </Link>
        </div>

        {busy ? (
          <p className="mt-6 text-sm text-muted-foreground">Chargement de vos commandes…</p>
        ) : orders.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-border p-10 text-center bg-card">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint text-primary mb-3">
              <Package className="h-6 w-6" />
            </div>
            <p className="font-display text-base font-bold text-navy">Aucune commande pour le moment</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Découvrez notre sélection de tisanes, huiles et compléments naturels.
            </p>
            <Link to="/produits" className="btn-hero mt-5 inline-flex">
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((o) => {
              const s = STATUS_LABELS[o.status] ?? { label: o.status, cls: "bg-muted text-foreground" };
              return (
                <div key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-border/80">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-navy">Commande #{o.order_number}</p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>
                          {s.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Passée le {new Date(o.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Montant total</p>
                      <p className="font-display text-lg font-bold text-navy">
                        {formatPrice(Number(o.total), o.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <ul className="space-y-1 text-sm text-foreground">
                      {(o.items as any[]).map((i, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="font-medium">{i.name}</span>
                          <span className="text-xs text-muted-foreground">× {i.quantity}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Bonjour, je souhaite avoir des nouvelles de ma commande #${o.order_number}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" /> Suivre sur WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
