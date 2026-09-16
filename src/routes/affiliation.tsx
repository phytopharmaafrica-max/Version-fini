import { createFileRoute, Link } from "@tanstack/react-router";
import { Share2, Gift, Percent, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/affiliation")({
  head: () => ({
    meta: [
      { title: "Programme d'Affiliation & Partenariat — Phytocare" },
      { name: "description", content: "Rejoignez le programme d'affiliation Phytocare et gagnez des commissions sur chaque recommandation bien-être." },
    ],
  }),
  component: AffiliationPage,
});

function AffiliationPage() {
  const { user } = useAuth();

  return (
    <div className="container-page py-12 max-w-4xl">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1 text-xs font-semibold text-accent-foreground">
          <Share2 className="h-3.5 w-3.5" /> Programme Partenaire
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-extrabold text-navy">
          Partagez le pouvoir des plantes, soyez rémunéré
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Recommandez nos remèdes biologiques à votre communauté ou vos patients et touchez jusqu'à 15% de commission sur chaque commande en euros.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-12">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Share2 className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-navy">1. Lien unique</h3>
          <p className="mt-2 text-xs md:text-sm text-muted-foreground">
            Recevez votre lien de parrainage personnalisé à partager sur vos réseaux, blog ou en consultation.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Gift className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-navy">2. Avantage filleul</h3>
          <p className="mt-2 text-xs md:text-sm text-muted-foreground">
            Vos contacts profitent immédiatement d'une réduction de bienvenue de 10% sur leur premier panier.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Percent className="h-6 w-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-navy">3. Virements en Euros</h3>
          <p className="mt-2 text-xs md:text-sm text-muted-foreground">
            Vos commissions sont versées chaque mois directement par virement bancaire sur votre compte IBAN.
          </p>
        </div>
      </div>

      <div className="mt-12 rounded-3xl border border-border bg-mint/50 p-8 text-center max-w-xl mx-auto">
        <h2 className="font-display text-xl font-bold text-navy">Prêt à devenir partenaire ?</h2>
        <p className="mt-2 text-xs md:text-sm text-muted-foreground">
          {user ? "Rendez-vous dans votre espace compte pour obtenir votre lien d'affiliation." : "Connectez-vous à votre compte pour activer votre espace affilié."}
        </p>
        <Link
          to={user ? "/compte" : "/auth"}
          className="btn-hero mt-6 inline-flex"
        >
          {user ? "Accéder à mon espace" : "Se connecter / S'inscrire"}
        </Link>
      </div>
    </div>
  );
}
