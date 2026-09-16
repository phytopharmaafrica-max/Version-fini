import { Link } from "@tanstack/react-router";
import { Leaf, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { useCms } from "@/lib/cms-store";

export function Footer() {
  const cms = useCms();

  const legalPages = cms.customPages.filter((p) =>
    ["cgv", "mentions", "confidentialite"].includes(p.slug)
  );

  const otherPages = cms.customPages.filter(
    (p) => !["cgv", "mentions", "confidentialite"].includes(p.slug) && p.published && p.showInFooter
  );

  return (
    <footer className="mt-20 border-t border-border bg-mint/40">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        {/* Colonne 1 : Marque & Slogan */}
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-navy">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </span>
            {cms.siteName || "Phytocare"}
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {cms.brandDescription ||
              "Produits de bien-être et phytothérapie sélectionnés pour vous accompagner au quotidien en harmonie avec la nature."}
          </p>
          <div className="pt-2 text-xs text-muted-foreground space-y-1">
            {cms.contact.email && (
              <p className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" /> {cms.contact.email}
              </p>
            )}
            {cms.contact.phone && (
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" /> {cms.contact.phone}
              </p>
            )}
            {cms.contact.address && (
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {cms.contact.address}
              </p>
            )}
          </div>
        </div>

        {/* Colonne 2 : Boutique */}
        <div>
          <h4 className="text-sm font-semibold text-foreground">Boutique & Gammes</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/produits" className="hover:text-foreground">
                Tous les produits
              </Link>
            </li>
            <li>
              <Link to="/category/$slug" params={{ slug: "immunite" }} className="hover:text-foreground">
                Immunité & Défenses
              </Link>
            </li>
            <li>
              <Link to="/category/$slug" params={{ slug: "stress" }} className="hover:text-foreground">
                Stress & Sérénité
              </Link>
            </li>
            <li>
              <Link to="/category/$slug" params={{ slug: "sommeil" }} className="hover:text-foreground">
                Sommeil Réparateur
              </Link>
            </li>
            <li>
              <Link to="/category/$slug" params={{ slug: "energie" }} className="hover:text-foreground">
                Vitalité & Tonus
              </Link>
            </li>
          </ul>
        </div>

        {/* Colonne 3 : Compte & Partenariat */}
        <div>
          <h4 className="text-sm font-semibold text-foreground">Espace Client</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/compte" className="hover:text-foreground">
                Suivi de commande
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Connexion / Créer un compte
              </Link>
            </li>
            <li>
              <Link to="/panier" className="hover:text-foreground">
                Mon panier & Règlement
              </Link>
            </li>
            <li>
              <Link to="/affiliation" className="hover:text-foreground">
                Programme d'affiliation (15%)
              </Link>
            </li>
            {otherPages.map((page) => (
              <li key={page.id}>
                <Link to={"/page/" + page.slug as never} className="hover:text-foreground">
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Colonne 4 : Légal & Banques */}
        <div>
          <h4 className="text-sm font-semibold text-foreground">Aide & Informations Légales</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>WhatsApp : {cms.contact.whatsapp || "+229 65 54 96 97"}</li>
            <li>
              <Link to="/cgv" className="hover:text-foreground">
                Conditions Générales de Vente
              </Link>
            </li>
            <li>
              <Link to="/mentions" className="hover:text-foreground">
                Mentions Légales
              </Link>
            </li>
            <li>
              <Link to="/confidentialite" className="hover:text-foreground">
                Politique de Confidentialité
              </Link>
            </li>
            <li className="pt-2 text-[11px] text-emerald-800">
              Virements bancaires internationaux (IBAN / SEPA) acceptés
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {cms.siteName || "Phytocare"}. Les informations présentées ne constituent pas un avis médical.
      </div>
    </footer>
  );
}
