import { Link } from "@tanstack/react-router";
import { Leaf, ShieldCheck, Mail, Phone, MapPin, MessageCircle, Lock } from "lucide-react";
import { useCms } from "@/lib/cms-store";
import { buildWhatsAppSupportLink, buildWhatsAppPaymentLink } from "@/lib/whatsapp";
import { PWAInstallButton } from "./PWAInstallButton";

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
          <div className="pt-2 text-xs text-muted-foreground space-y-1.5">
            {cms.contact.email && (
              <p>
                <a
                  href={`mailto:${cms.contact.email}`}
                  className="flex items-center gap-1.5 hover:text-primary transition"
                  title="Envoyer un email à notre équipe"
                >
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{cms.contact.email}</span>
                </a>
              </p>
            )}
            {cms.contact.phone && (
              <p>
                <a
                  href={buildWhatsAppSupportLink("Bonjour, je souhaite contacter l'assistance et les conseillers Phytocare.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-primary transition"
                  title="Contacter notre service d'assistance"
                >
                  <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{cms.contact.phone}</span>
                </a>
              </p>
            )}
            {cms.contact.address && (
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{cms.contact.address}</span>
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
            <li>
              <a
                href={buildWhatsAppSupportLink("Bonjour, je souhaite contacter l'assistance et conseil Phytocare.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                Assistance WhatsApp (Canal Sécurisé)
              </a>
            </li>
            <li>
              <a
                href={buildWhatsAppPaymentLink({
                  orderNumber: "DEMANDE-INFO",
                  items: [],
                  total: 0,
                  paymentMethod: "Règlement WhatsApp",
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs"
              >
                <Lock className="h-3 w-3 text-primary" />
                Service Paiements (Canal Chiffré)
              </a>
            </li>
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
            <li className="pt-2">
              <PWAInstallButton variant="footer" />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] text-center text-xs text-muted-foreground container-page flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} {cms.siteName || "Phytocare"}. Tous droits réservés.</p>
        <p className="text-[11px] text-muted-foreground/80">
          Accessible sur smartphone, Android, iOS iPhone, tablette et PC.
        </p>
      </div>
    </footer>
  );
}
