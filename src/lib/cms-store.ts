// Store CMS & Personnalisation du site pour l'administrateur (Emmaguscul@gmail.com)
// Permet de modifier l'intégralité du site sans coder : Thème, Textes, Hero, Bannière, Sections, Pages, Banque & IBAN.

import { useEffect, useState, useSyncExternalStore } from "react";

export interface ReassuranceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface HomepageSection {
  id: string;
  type: "hero" | "categories" | "featured_products" | "newest_products" | "custom_content" | "reviews" | "faq" | "ai_banner" | "trust_banner";
  title: string;
  subtitle: string;
  enabled: boolean;
  order: number;
  data?: Record<string, any>;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string; // Markdown or formatted text
  metaDescription?: string;
  headerImage?: string;
  showInHeader?: boolean;
  showInFooter?: boolean;
  published: boolean;
  updatedAt: string;
}

export interface BankDetails {
  accountHolder: string;
  bankName: string;
  iban: string;
  bicSwift: string;
  bankCountry: string;
  instructions: string;
  instantTransfer: boolean;
  referencePrefix: string;
}

export interface PaymentMethodsConfig {
  bankTransfer: {
    enabled: boolean;
    title: string;
    description: string;
  };
  card: {
    enabled: boolean;
    title: string;
    description: string;
  };
  paypal: {
    enabled: boolean;
    email: string;
    description: string;
  };
  whatsapp: {
    enabled: boolean;
    title: string;
    description: string;
  };
}

export interface SiteConfig {
  // Identité & Image de marque
  siteName: string;
  tagline: string;
  slogan: string;
  brandDescription: string;
  currency: "EUR";
  currencySymbol: "€";
  themeColor: "emerald" | "forest" | "sage" | "amber" | "navy" | "rose";
  themeStyle: "luxe" | "nature" | "minimaliste";

  // Bannière d'annonce supérieure
  announcement: {
    enabled: boolean;
    text: string;
    linkText: string;
    linkUrl: string;
  };

  // Coordonnées & Contact
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    openingHours: string;
  };

  // En-tête Hero de la page d'accueil
  hero: {
    badge: string;
    title: string;
    titleHighlight: string;
    subtitle: string;
    imageUrl: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
    floatingCardBadge: string;
    floatingCardTitle: string;
    floatingCardSubtitle: string;
  };

  // Coordonnées bancaires & Virements internationaux (IBAN)
  bank: BankDetails;

  // Moyens de paiement actifs
  payments: PaymentMethodsConfig;

  // Éléments de rassurance
  reassurance: ReassuranceItem[];

  // Sections modulaires de la page d'accueil
  sections: HomepageSection[];

  // Pages personnalisées
  customPages: CustomPage[];
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: "Phytocare — Aura Wellness",
  tagline: "Herboristerie d'Excellence & Naturopathie Augmentée",
  slogan: "Le bon produit naturel, au bon moment.",
  brandDescription: "Herboristerie premium certifiée aux normes internationales. Synergies de plantes médicinales, compléments biologiques et conseils personnalisés par intelligence artificielle.",
  currency: "EUR",
  currencySymbol: "€",
  themeColor: "emerald",
  themeStyle: "luxe",

  announcement: {
    enabled: true,
    text: "🌿 Expédition internationale sous 24/48h | Livraison offerte dès 50 € | -10% de bienvenue avec le code BIENVENUE10",
    linkText: "Découvrir nos remèdes",
    linkUrl: "/produits",
  },

  contact: {
    email: "contact@phytocare-wellness.com",
    phone: "+33 1 89 71 42 00",
    whatsapp: "+229 65 54 96 97",
    address: "Laboratoire Herboristerie & Expéditions Internationales — 12 Avenue des Sciences Naturelles, 75008 Paris",
    openingHours: "Lundi au Samedi : 8h30 - 19h30 (CET)",
  },

  hero: {
    badge: "Conseils Naturopathiques Certifiés & IA Dorine",
    title: "L'intelligence des plantes,",
    titleHighlight: "au service de votre santé.",
    subtitle: "Découvrez nos extraits végétaux standardisés, tisanes thérapeutiques et super-aliments biologiques. Paiement sécurisé en euros et expédition internationale suivie.",
    imageUrl: "https://images.unsplash.com/photo-1611077418273-fac2d8b9b8f8?w=1000&q=80",
    ctaPrimaryText: "Explorer la boutique",
    ctaPrimaryLink: "/produits",
    ctaSecondaryText: "Consulter Dorine (IA)",
    ctaSecondaryLink: "#dorine",
    floatingCardBadge: "Formule Best-seller",
    floatingCardTitle: "Ashwagandha KSM-66 & Rhodiola",
    floatingCardSubtitle: "Régulation du cortisol et énergie sereine.",
  },

  bank: {
    accountHolder: "Emmanuel Guscul / Phytocare International",
    bankName: "Compte Bancaire Professionnel & Réseau SEPA Européen",
    iban: "FR76 3000 4000 0123 4567 8901 234",
    bicSwift: "BNPAFRPPXXX",
    bankCountry: "France / Union Européenne",
    instructions: "Indiquez impérativement la référence de votre commande dans le libellé de votre virement bancaire. Les virements instantanés (10 secondes) sont automatiquement validés.",
    instantTransfer: true,
    referencePrefix: "PHYTO",
  },

  payments: {
    bankTransfer: {
      enabled: true,
      title: "Virement Bancaire Immédiat / SEPA & International",
      description: "Réglez directement depuis votre application bancaire avec notre compte officiel protégé. Virement instantané ou standard supporté.",
    },
    card: {
      enabled: true,
      title: "Carte Bancaire Sécurisée (Visa, Mastercard, CB, Apple Pay)",
      description: "Paiement chiffré SSL 256-bits avec authentification 3D-Secure immédiate.",
    },
    paypal: {
      enabled: true,
      email: "paiement@phytocare-wellness.com",
      description: "Règlement sécurisé en 1 clic via votre solde ou compte PayPal.",
    },
    whatsapp: {
      enabled: true,
      title: "Commande Assistée WhatsApp & Conseil Herboriste",
      description: "Échangez directement avec notre herboriste pour valider votre panier et vos modalités de réception.",
    },
  },

  reassurance: [
    {
      id: "r-1",
      icon: "BadgeCheck",
      title: "100% Plantes Certifiées",
      description: "Traçabilité botanique rigoureuse et principes actifs titrés en laboratoire.",
    },
    {
      id: "r-2",
      icon: "ShieldCheck",
      title: "Paiements Sécurisés en Euros",
      description: "Transactions chiffrées par carte 3D-Secure et virement bancaire protégé.",
    },
    {
      id: "r-3",
      icon: "Truck",
      title: "Expédition Suivie & Rapide",
      description: "Colis préparés sous 24h ouvrées avec emballage hermétique et éco-responsable.",
    },
    {
      id: "r-4",
      icon: "Sparkles",
      title: "Dorine : Naturopathe IA 24/7",
      description: "Orientation bien-être personnalisée en phytothérapie sans attente.",
    },
  ],

  sections: [
    {
      id: "sec-hero",
      type: "hero",
      title: "En-tête & Recherche Intelligente",
      subtitle: "Bannière principale avec moteur de recherche",
      enabled: true,
      order: 1,
    },
    {
      id: "sec-categories",
      type: "categories",
      title: "Explorez par besoin de santé",
      subtitle: "Immunité, stress, sommeil réparateur, confort digestif, vitalité.",
      enabled: true,
      order: 2,
    },
    {
      id: "sec-featured",
      type: "featured_products",
      title: "Nos Remèdes Vedettes",
      subtitle: "Les formules plébiscitées pour leur efficacité prouvée.",
      enabled: true,
      order: 3,
    },
    {
      id: "sec-custom-story",
      type: "custom_content",
      title: "Une herboristerie respectueuse des cycles vivants",
      subtitle: "Notre engagement pour la pureté botanique",
      enabled: true,
      order: 4,
      data: {
        tag: "Notre Philosophie",
        content: "Chaque plante que nous sélectionnons provient de terroirs préservés où la cueillette s'effectue dans le respect des cycles lunaires et végétatifs. Nous refusons les solvants chimiques et privilégions les extractions douces pour préserver l'intégrité du totum de la plante. Nos formulations combinent la sagesse des traditions ancestrales et les validations de la recherche moderne.",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80",
        highlights: [
          "Plantes sauvages et cultures biologiques contrôlées",
          "Zéro conservateur, arôme artificiel ni colorant",
          "Concentration garantie en principes actifs majeurs",
          "Conseil naturopathique accessible à tous",
        ],
        buttonText: "Consulter le catalogue",
        buttonLink: "/produits",
      },
    },
    {
      id: "sec-newest",
      type: "newest_products",
      title: "Dernières Récoltes & Nouveautés",
      subtitle: "Nouveaux complexes et huiles précieuses fraîchement élaborés.",
      enabled: true,
      order: 5,
    },
    {
      id: "sec-reviews",
      type: "reviews",
      title: "Ce que disent nos clients",
      subtitle: "Plus de 4 800 personnes accompagnées vers un équilibre naturel durable.",
      enabled: true,
      order: 6,
      data: {
        reviews: [
          {
            author: "Dr. Sophie M.",
            role: "Cliente vérifiée — Paris",
            rating: 5,
            comment: "L'Ashwagandha et la tisane sommeil ont transformé mes nuits après des mois d'insomnie liée au surmenage. Qualité remarquable des plantes.",
          },
          {
            author: "Marc L.",
            role: "Client vérifié — Bruxelles",
            rating: 5,
            comment: "Commande par virement bancaire ultra simple et rapide. Reçu en 48h dans un colis soigné. L'huile de nigelle est d'une pureté exceptionnelle.",
          },
          {
            author: "Amina K.",
            role: "Cliente vérifiée — Genève",
            rating: 5,
            comment: "Dorine l'assistante IA m'a orientée précisément vers la bonne synergie pour ma digestion. En 4 jours, les lourdeurs avaient totalement disparu !",
          },
        ],
      },
    },
    {
      id: "sec-faq",
      type: "faq",
      title: "Foire Aux Questions",
      subtitle: "Tout savoir sur nos produits, la livraison et les paiements.",
      enabled: true,
      order: 7,
      data: {
        items: [
          {
            q: "Comment fonctionne le paiement par virement bancaire sécurisé ?",
            a: "Lors de votre commande, sélectionnez le mode 'Virement Bancaire'. Dès validation de votre panier, vos coordonnées bancaires officielles (IBAN protégé, code BIC/SWIFT) ainsi que votre référence de transaction unique vous sont délivrées sur votre reçu sécurisé. Vous pouvez ainsi effectuer le virement sereinement depuis votre espace bancaire habituel.",
          },
          {
            q: "Dans quels pays expédiez-vous les commandes ?",
            a: "Nous expédions vers l'ensemble de l'Union Européenne (France, Belgique, Suisse, Luxembourg, Allemagne, Espagne, etc.) ainsi qu'à l'international dans plus de 45 pays, avec suivi de colis en direct.",
          },
          {
            q: "Les plantes sont-elles compatibles avec mes traitements médicaux ?",
            a: "Chaque fiche produit détaille les bienfaits et contre-indications. Dorine, notre herboriste IA, vous rappelle également les précautions. En cas de pathologie ou de traitement lourd, demandez toujours l'avis de votre médecin traitant.",
          },
          {
            q: "Quels sont les délais de livraison ?",
            a: "Les colis sont expédiés en 24h ouvrées. La livraison prend en moyenne 2 à 4 jours ouvrés selon votre pays de résidence.",
          },
        ],
      },
    },
    {
      id: "sec-trust",
      type: "trust_banner",
      title: "Garanties d'Excellence",
      subtitle: "Votre bien-être entre de bonnes mains",
      enabled: true,
      order: 8,
    },
  ],

  customPages: [
    {
      id: "page-cgv",
      slug: "cgv",
      title: "Conditions Générales de Vente",
      subtitle: "Règles contractuelles et garanties Phytocare",
      published: true,
      showInFooter: true,
      updatedAt: "2026-09-15",
      content: `## 1. Préambule et Champ d'Application
Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des transactions commerciales conclues sur le site internet **Phytocare — Aura Wellness AI**. Tout achat implique l'adhésion entière et sans réserve du client aux présentes conditions.

## 2. Tarifs et Devises
Tous les prix affichés sur le site sont exprimés en **Euros (€)**, toutes taxes comprises (TTC). Phytocare se réserve le droit de modifier ses prix à tout moment, étant entendu que les produits commandés sont facturés sur la base des tarifs en vigueur au moment de l'enregistrement de la commande.

## 3. Modalités de Paiement
Le règlement des achats s'effectue au choix de l'acheteur via :
- **Virement Bancaire International (IBAN / SEPA)** : avec communication automatique de la référence de commande.
- **Carte Bancaire (Visa, MasterCard, CB)** : transactions sécurisées avec protocole 3D Secure et chiffrement TLS 256 bits.
- **PayPal** : règlement instantané garanti.
- **Paiement à la livraison / Confirmation WhatsApp** (selon zones éligibles).

## 4. Expédition et Livraison
Les produits sont expédiés sous 24 à 48 heures ouvrées suivant la validation du paiement. La livraison est effectuée avec numéro de suivi international à l'adresse indiquée par le client.

## 5. Droit de Rétractation et Retours
Conformément à la législation sur la protection des consommateurs, vous disposez d'un délai de 14 jours calendaires pour exercer votre droit de rétractation. Par mesure d'hygiène et de sécurité sanitaire, les produits descellés, ouverts ou consommés ne peuvent faire l'objet d'un retour.

## 6. Avertissement Médical
Nos remèdes, tisanes et compléments alimentaires s'inscrivent dans une démarche de confort et de bien-être naturel. Ils ne constituent pas des médicaments et ne peuvent en aucun cas se substituer à un diagnostic ou une prescription médicale formulée par un médecin.`,
    },
    {
      id: "page-mentions",
      slug: "mentions",
      title: "Mentions Légales & Hébergement",
      subtitle: "Informations réglementaires et éditeur du site",
      published: true,
      showInFooter: true,
      updatedAt: "2026-09-15",
      content: `## Édition du Site
Le site **Phytocare — Aura Wellness AI** est édité par l'administrateur **Emmanuel Guscul** (\`emmaguscul@gmail.com\`).
Directeur de la publication : Emmanuel Guscul.

## Hébergement Haute Sécurité
Le site et ses services applicatifs sont hébergés sur l'infrastructure Cloud Google Cloud Platform (Cloud Run) et protégés par un chiffrement SSL HTTPS haute sécurité.

## Données Personnelles (RGPD)
Conformément au Règlement Général sur la Protection des Données (RGPD), les informations collectées lors de la commande sont strictement destinées au traitement et à l'acheminement de vos colis. Aucune donnée n'est revendue à des tiers. Vous disposez d'un droit d'accès, de rectification et d'effacement sur simple demande à l'adresse \`emmaguscul@gmail.com\`.`,
    },
    {
      id: "page-confidentialite",
      slug: "confidentialite",
      title: "Politique de Confidentialité",
      subtitle: "Protection de vos données et respect de votre vie privée",
      published: true,
      showInFooter: true,
      updatedAt: "2026-09-15",
      content: `Chez **Phytocare**, la confidentialité de vos données de santé et de vos informations personnelles est une priorité absolue.

### 1. Données collectées
Nous collectons uniquement les données strictement nécessaires à votre expérience : nom, prénom, adresse de livraison, email pour le suivi, et préférences de recherche bien-être.

### 2. Confidentialité des échanges avec Dorine (IA)
Les conversations avec notre assistante naturopathe Dorine ont une vocation exclusivement informative et de conseil en herboristerie. Aucun historique médical sensible n'est archivé à des fins publicitaires.

### 3. Sécurité des Paiements
Aucune coordonnée bancaire (numéro de carte de crédit, cryptogramme) n'est stockée sur nos serveurs. Les transactions sont directement traitées par des passerelles de paiement bancaires agréées et sécurisées.`,
    },
    {
      id: "page-histoire",
      slug: "notre-histoire",
      title: "Notre Histoire & Nos Engagements",
      subtitle: "La renaissance de l'herboristerie noble guidée par la science",
      published: true,
      showInFooter: true,
      updatedAt: "2026-09-15",
      content: `### L'Origine de Phytocare
Fondée avec la volonté de redonner ses lettres de noblesse à la médecine végétale, **Phytocare** est née au croisement de deux mondes : la sagesse millénaire des herboristes traditionnels et la rigueur de l'intelligence artificielle appliquée à la santé naturelle.

### Une Traçabilité Totale du Champ au Flacon
Nous travaillons en partenariat direct avec des cultivateurs passionnés et des coopératives éthiques. De la graine de nigelle d'Égypte au moringa pur en passant par la camomille matricaire et la spiruline artisanale, chaque lot est analysé pour garantir l'absence totale de métaux lourds, pesticides ou contaminants.

### Une Accessibilité Sans Frontières
Parce que le bien-être naturel ne devrait connaître aucune barrière, nous avons conçu une plateforme internationale moderne, acceptant les paiements en euros par virement bancaire (IBAN) et cartes, avec une expédition soignée à travers le monde.`,
    },
  ],
};

const STORAGE_KEY = "phytocare_cms_config_v2";
const listeners = new Set<() => void>();
let currentConfig: SiteConfig = DEFAULT_SITE_CONFIG;
let isLoaded = false;

function loadConfig(): SiteConfig {
  if (isLoaded) return currentConfig;
  if (typeof window === "undefined") return DEFAULT_SITE_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Fusionner avec DEFAULT pour garantir la présence de toutes les clés
      currentConfig = {
        ...DEFAULT_SITE_CONFIG,
        ...parsed,
        bank: { ...DEFAULT_SITE_CONFIG.bank, ...(parsed.bank || {}) },
        payments: { ...DEFAULT_SITE_CONFIG.payments, ...(parsed.payments || {}) },
        hero: { ...DEFAULT_SITE_CONFIG.hero, ...(parsed.hero || {}) },
        announcement: { ...DEFAULT_SITE_CONFIG.announcement, ...(parsed.announcement || {}) },
        contact: { ...DEFAULT_SITE_CONFIG.contact, ...(parsed.contact || {}) },
        sections: parsed.sections && parsed.sections.length > 0 ? parsed.sections : DEFAULT_SITE_CONFIG.sections,
        customPages: parsed.customPages && parsed.customPages.length > 0 ? parsed.customPages : DEFAULT_SITE_CONFIG.customPages,
        reassurance: parsed.reassurance && parsed.reassurance.length > 0 ? parsed.reassurance : DEFAULT_SITE_CONFIG.reassurance,
      };
    } else {
      currentConfig = DEFAULT_SITE_CONFIG;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SITE_CONFIG));
    }
  } catch (e) {
    console.error("[CMS] Erreur de chargement config", e);
    currentConfig = DEFAULT_SITE_CONFIG;
  }
  isLoaded = true;
  return currentConfig;
}

function saveConfig(newConfig: SiteConfig) {
  currentConfig = newConfig;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error("[CMS] Erreur de sauvegarde config", e);
    }
  }
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("phytocare:cms-update", { detail: newConfig }));
  }
}

export const cmsStore = {
  get(): SiteConfig {
    return loadConfig();
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  update(patch: Partial<SiteConfig>) {
    const current = loadConfig();
    const updated: SiteConfig = {
      ...current,
      ...patch,
    };
    saveConfig(updated);
    return updated;
  },
  updateBank(bankPatch: Partial<BankDetails>) {
    const current = loadConfig();
    const updated: SiteConfig = {
      ...current,
      bank: { ...current.bank, ...bankPatch },
    };
    saveConfig(updated);
    return updated;
  },
  updateHero(heroPatch: Partial<SiteConfig["hero"]>) {
    const current = loadConfig();
    const updated: SiteConfig = {
      ...current,
      hero: { ...current.hero, ...heroPatch },
    };
    saveConfig(updated);
    return updated;
  },
  updateAnnouncement(patch: Partial<SiteConfig["announcement"]>) {
    const current = loadConfig();
    const updated: SiteConfig = {
      ...current,
      announcement: { ...current.announcement, ...patch },
    };
    saveConfig(updated);
    return updated;
  },
  updateSection(sectionId: string, patch: Partial<HomepageSection>) {
    const current = loadConfig();
    const updatedSections = current.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s));
    const updated: SiteConfig = { ...current, sections: updatedSections };
    saveConfig(updated);
    return updated;
  },
  addSection(section: Omit<HomepageSection, "id">) {
    const current = loadConfig();
    const newSec: HomepageSection = {
      ...section,
      id: "sec-custom-" + Math.random().toString(36).slice(2, 9),
      order: current.sections.length + 1,
    };
    const updated: SiteConfig = {
      ...current,
      sections: [...current.sections, newSec],
    };
    saveConfig(updated);
    return updated;
  },
  deleteSection(sectionId: string) {
    const current = loadConfig();
    const updated: SiteConfig = {
      ...current,
      sections: current.sections.filter((s) => s.id !== sectionId),
    };
    saveConfig(updated);
    return updated;
  },
  upsertCustomPage(page: Partial<CustomPage> & { title: string; slug: string; content: string }) {
    const current = loadConfig();
    const existingIndex = current.customPages.findIndex((p) => p.slug === page.slug || (page.id && p.id === page.id));
    let updatedPages: CustomPage[];
    if (existingIndex >= 0) {
      updatedPages = [...current.customPages];
      updatedPages[existingIndex] = {
        ...updatedPages[existingIndex],
        ...page,
        updatedAt: new Date().toISOString().split("T")[0],
      };
    } else {
      const newPage: CustomPage = {
        id: page.id || "page-" + Math.random().toString(36).slice(2, 9),
        slug: page.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        title: page.title,
        subtitle: page.subtitle || "",
        content: page.content,
        metaDescription: page.metaDescription || "",
        headerImage: page.headerImage || "",
        showInHeader: page.showInHeader ?? false,
        showInFooter: page.showInFooter ?? true,
        published: page.published ?? true,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      updatedPages = [...current.customPages, newPage];
    }
    const updated: SiteConfig = { ...current, customPages: updatedPages };
    saveConfig(updated);
    return updated;
  },
  deleteCustomPage(pageIdOrSlug: string) {
    const current = loadConfig();
    const updated: SiteConfig = {
      ...current,
      customPages: current.customPages.filter((p) => p.id !== pageIdOrSlug && p.slug !== pageIdOrSlug),
    };
    saveConfig(updated);
    return updated;
  },
  resetToDefaults() {
    saveConfig(DEFAULT_SITE_CONFIG);
    return DEFAULT_SITE_CONFIG;
  },
};

export function useCms() {
  const [cfg, setCfg] = useState<SiteConfig>(() => loadConfig());

  useEffect(() => {
    setCfg(loadConfig());
    const unsub = cmsStore.subscribe(() => {
      setCfg({ ...cmsStore.get() });
    });
    return () => {
      unsub();
    };
  }, []);

  return cfg;
}
