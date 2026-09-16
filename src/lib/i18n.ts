// Multilingual internationalization system (French, English, Spanish, German)
import { useEffect, useSyncExternalStore } from "react";

export type LanguageCode = "fr" | "en" | "es" | "de";

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: "fr", name: "Français", nativeName: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "es", name: "Espagnol", nativeName: "Español", flag: "🇪🇸" },
  { code: "de", name: "Allemand", nativeName: "Deutsch", flag: "🇩🇪" },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.shop": "Boutique",
    "nav.immunity": "Immunité",
    "nav.stress": "Stress",
    "nav.sleep": "Sommeil",
    "nav.energy": "Énergie",
    "nav.account": "Mon compte",
    "nav.cart": "Panier",
    "nav.admin": "Admin CMS",

    // Header & Global
    "site.tagline": "Herboristerie d'Excellence & Naturopathie Augmentée",
    "theme.label": "Thème",
    "currency.label": "Devise",
    "language.label": "Langue",

    // Hero
    "hero.badge": "Recherche intelligente & Phytothérapie",
    "hero.title": "Le bon produit naturel,",
    "hero.titleHighlight": "au bon moment.",
    "hero.subtitle":
      "Décrivez simplement ce que vous ressentez (stress, fatigue, sommeil difficile…). Notre IA vous oriente vers les produits adaptés.",
    "hero.searchPlaceholder": "Ex: insomnie, digestion lente, baisse d'énergie…",
    "hero.reassurance.shipping": "Livraison suivie en Europe & Monde",
    "hero.reassurance.bio": "Qualité bio & plantes certifiées",
    "hero.reassurance.payment": "Paiement sécurisé par carte & virement",

    // Sections
    "section.categories.title": "Catégories de Santé",
    "section.categories.subtitle": "Explorez par besoin de santé et bien-être.",
    "section.featured.title": "Produits Vedettes",
    "section.featured.subtitle": "Les essentiels plébiscités par nos clients.",
    "section.featured.viewAll": "Voir tout",
    "section.newest.title": "Nouveautés du Laboratoire",
    "section.reviews.title": "Ce que nos clients disent",
    "section.reviews.subtitle": "Des retours d'expérience authentiques sur l'efficacité de nos remèdes.",
    "section.faq.title": "Foire Aux Questions",
    "section.faq.subtitle": "Toutes les réponses à vos interrogations sur nos remèdes et nos livraisons.",

    // Products
    "product.addToCart": "Ajouter au panier",
    "product.inStock": "En stock",
    "product.outOfStock": "Rupture temporaire",
    "product.rating": "Avis vérifiés",
    "product.bioCertified": "Certifié Biologique",
    "product.freeShippingNotice": "Livraison offerte dès 50 € d'achat",
    "product.details": "Détails & Bienfaits",
    "product.usage": "Conseils d'utilisation",
    "product.ingredients": "Composition & Ingrédients",

    // Cart & Checkout
    "cart.title": "Mon panier",
    "cart.empty": "Votre panier est vide",
    "cart.emptySubtitle": "Découvrez notre gamme de remèdes naturels et commencez votre cure dès aujourd'hui.",
    "cart.explore": "Explorer la boutique",
    "cart.items": "articles",
    "cart.subtotal": "Sous-total",
    "cart.shipping": "Frais de livraison",
    "cart.shippingFree": "Offerte",
    "cart.promoCode": "Code de réduction",
    "cart.apply": "Appliquer",
    "cart.total": "Total à régler",
    "cart.checkout": "Règlement de la commande",
    "cart.paymentMethod": "Mode de règlement",
    "cart.ibanTransfer": "Virement Bancaire (IBAN / SEPA)",
    "cart.ibanTransferDesc": "Virement direct vers le compte officiel de la boutique",
    "cart.creditCard": "Carte Bancaire (Visa, Mastercard)",
    "cart.creditCardDesc": "Paiement international sécurisé 3D-Secure",
    "cart.whatsappOrder": "Commande assistée WhatsApp",
    "cart.whatsappOrderDesc": "Conseils directs & paiement assisté",
    "cart.deliveryDetails": "Coordonnées de livraison",
    "cart.fullName": "Nom et prénom complet",
    "cart.phone": "Numéro de téléphone (avec indicatif pays)",
    "cart.address": "Adresse complète (Rue, Ville, Code Postal, Pays)",
    "cart.notes": "Instructions particulières (optionnel)",
    "cart.placeOrder": "Valider ma commande",
    "cart.placeOrderCard": "Payer",
    "cart.placeOrderIban": "Valider et afficher l'IBAN",
    "cart.placeOrderWa": "Commander via WhatsApp",
    "cart.secureNotice": "Paiement chiffré et conforme aux normes européennes",
    "cart.copy": "Copier",
    "cart.copied": "Copié !",
    "cart.orderSuccess": "Commande enregistrée avec succès !",
    "cart.ibanInstructions": "Veuillez effectuer le virement en utilisant les coordonnées ci-dessous.",
    "cart.orderReference": "Motif du virement (Indispensable)",
    "cart.printReceipt": "Imprimer le récapitulatif / RIB",

    // Footer
    "footer.about": "Herboristerie premium & remèdes naturels sélectionnés avec soin.",
    "footer.quickLinks": "Liens rapides",
    "footer.customerService": "Espace Client",
    "footer.legal": "Informations Légales",
    "footer.rights": "Tous droits réservés. Ne remplace pas un avis médical.",
  },

  en: {
    // Navigation
    "nav.home": "Home",
    "nav.shop": "Shop",
    "nav.immunity": "Immunity",
    "nav.stress": "Stress Relief",
    "nav.sleep": "Sleep",
    "nav.energy": "Vitality",
    "nav.account": "My Account",
    "nav.cart": "Cart",
    "nav.admin": "CMS Admin",

    // Header & Global
    "site.tagline": "Premium Herbal Apothecary & AI-Powered Naturopathy",
    "theme.label": "Theme",
    "currency.label": "Currency",
    "language.label": "Language",

    // Hero
    "hero.badge": "Smart Search & Organic Herbal Medicine",
    "hero.title": "The right natural remedy,",
    "hero.titleHighlight": "at the right time.",
    "hero.subtitle":
      "Simply describe how you feel (stress, fatigue, sleeplessness…). Our AI guides you to the finest organic botanical formulas.",
    "hero.searchPlaceholder": "e.g. insomnia, sluggish digestion, low vitality…",
    "hero.reassurance.shipping": "Tracked worldwide & EU shipping",
    "hero.reassurance.bio": "Certified organic botanical quality",
    "hero.reassurance.payment": "Secure card & bank wire checkout",

    // Sections
    "section.categories.title": "Health & Wellness Categories",
    "section.categories.subtitle": "Explore formulas crafted for your specific needs.",
    "section.featured.title": "Featured Botanical Remedies",
    "section.featured.subtitle": "Our customer-favorite formulations.",
    "section.featured.viewAll": "View all",
    "section.newest.title": "New Laboratory Releases",
    "section.reviews.title": "What Our Clients Say",
    "section.reviews.subtitle": "Authentic feedback on the purity and potency of our remedies.",
    "section.faq.title": "Frequently Asked Questions",
    "section.faq.subtitle": "Everything you need to know about our remedies, payments, and delivery.",

    // Products
    "product.addToCart": "Add to Cart",
    "product.inStock": "In Stock",
    "product.outOfStock": "Temporarily Out of Stock",
    "product.rating": "Verified Reviews",
    "product.bioCertified": "Certified Organic",
    "product.freeShippingNotice": "Free international shipping over €50 ($54)",
    "product.details": "Benefits & Pharmacology",
    "product.usage": "Suggested Usage",
    "product.ingredients": "Botanical Ingredients",

    // Cart & Checkout
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.emptySubtitle": "Explore our hand-crafted botanical remedies and begin your wellness journey today.",
    "cart.explore": "Explore the apothecary",
    "cart.items": "items",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Shipping",
    "cart.shippingFree": "Free",
    "cart.promoCode": "Promo Code",
    "cart.apply": "Apply",
    "cart.total": "Total Amount",
    "cart.checkout": "Checkout & Order Review",
    "cart.paymentMethod": "Payment Method",
    "cart.ibanTransfer": "Bank Transfer (IBAN / SEPA)",
    "cart.ibanTransferDesc": "Direct international wire to our official laboratory account",
    "cart.creditCard": "Credit Card (Visa, Mastercard)",
    "cart.creditCardDesc": "Secure international 3D-Secure checkout",
    "cart.whatsappOrder": "WhatsApp Assisted Order",
    "cart.whatsappOrderDesc": "Direct consultation & personal delivery tracking",
    "cart.deliveryDetails": "Delivery Address & Contact",
    "cart.fullName": "Full Name",
    "cart.phone": "Phone number (with country code)",
    "cart.address": "Full street address, City, Postal Code, Country",
    "cart.notes": "Special delivery notes (optional)",
    "cart.placeOrder": "Place Order",
    "cart.placeOrderCard": "Pay Now",
    "cart.placeOrderIban": "Confirm & View Bank Details",
    "cart.placeOrderWa": "Order via WhatsApp",
    "cart.secureNotice": "Encrypted checkout complying with European standards",
    "cart.copy": "Copy",
    "cart.copied": "Copied!",
    "cart.orderSuccess": "Order recorded successfully!",
    "cart.ibanInstructions": "Please initiate your bank wire using the official IBAN coordinates below.",
    "cart.orderReference": "Payment Reference (Required)",
    "cart.printReceipt": "Print Order Summary / IBAN",

    // Footer
    "footer.about": "Premium organic apothecary and natural herbal solutions chosen with pharmaceutical care.",
    "footer.quickLinks": "Quick Links",
    "footer.customerService": "Customer Service",
    "footer.legal": "Legal & Compliance",
    "footer.rights": "All rights reserved. Not intended to replace professional medical advice.",
  },

  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.shop": "Tienda",
    "nav.immunity": "Inmunidad",
    "nav.stress": "Estrés",
    "nav.sleep": "Sueño",
    "nav.energy": "Vitalidad",
    "nav.account": "Mi Cuenta",
    "nav.cart": "Cesta",
    "nav.admin": "Admin CMS",

    // Header & Global
    "site.tagline": "Herbolario de Excelencia y Naturopatía Aumentada",
    "theme.label": "Tema",
    "currency.label": "Moneda",
    "language.label": "Idioma",

    // Hero
    "hero.badge": "Búsqueda inteligente y Fitoterapia",
    "hero.title": "El producto natural adecuado,",
    "hero.titleHighlight": "en el momento preciso.",
    "hero.subtitle":
      "Describe lo que sientes (estrés, cansancio, insomnio…). Nuestra IA te orienta hacia las mejores fórmulas botánicas.",
    "hero.searchPlaceholder": "Ej: insomnio, digestión lenta, falta de energía…",
    "hero.reassurance.shipping": "Envío con seguimiento a toda Europa y el mundo",
    "hero.reassurance.bio": "Calidad biológica certificada",
    "hero.reassurance.payment": "Pago seguro con tarjeta y transferencia",

    // Sections
    "section.categories.title": "Categorías de Bienestar",
    "section.categories.subtitle": "Explore por necesidad de salud y vitalidad.",
    "section.featured.title": "Productos Destacados",
    "section.featured.subtitle": "Nuestros remedios naturales más valorados.",
    "section.featured.viewAll": "Ver todo",
    "section.newest.title": "Novedades del Laboratorio",
    "section.reviews.title": "Opiniones de Nuestros Clientes",
    "section.reviews.subtitle": "Experiencias reales sobre la eficacia de nuestras plantas.",
    "section.faq.title": "Preguntas Frecuentes",
    "section.faq.subtitle": "Respuestas a todas sus consultas sobre envíos y pagos.",

    // Products
    "product.addToCart": "Añadir a la cesta",
    "product.inStock": "En stock",
    "product.outOfStock": "Agotado temporalmente",
    "product.rating": "Opiniones verificadas",
    "product.bioCertified": "Certificado Ecológico",
    "product.freeShippingNotice": "Envío gratuito a partir de 50 €",
    "product.details": "Beneficios y Propiedades",
    "product.usage": "Modo de empleo",
    "product.ingredients": "Composición Botánica",

    // Cart & Checkout
    "cart.title": "Mi Cesta",
    "cart.empty": "Tu cesta está vacía",
    "cart.emptySubtitle": "Descubre nuestros remedios naturales y comienza tu tratamiento hoy mismo.",
    "cart.explore": "Ver catálogo",
    "cart.items": "artículos",
    "cart.subtotal": "Subtotal",
    "cart.shipping": "Gastos de envío",
    "cart.shippingFree": "Gratis",
    "cart.promoCode": "Código de descuento",
    "cart.apply": "Aplicar",
    "cart.total": "Total a pagar",
    "cart.checkout": "Tramitación del pedido",
    "cart.paymentMethod": "Método de pago",
    "cart.ibanTransfer": "Transferencia Bancaria (IBAN / SEPA)",
    "cart.ibanTransferDesc": "Transferencia directa a la cuenta oficial del laboratorio",
    "cart.creditCard": "Tarjeta Bancaria (Visa, Mastercard)",
    "cart.creditCardDesc": "Pago internacional seguro 3D-Secure",
    "cart.whatsappOrder": "Pedido asistido por WhatsApp",
    "cart.whatsappOrderDesc": "Asesoramiento personal y seguimiento",
    "cart.deliveryDetails": "Datos de envío",
    "cart.fullName": "Nombre y apellidos completos",
    "cart.phone": "Teléfono con prefijo internacional",
    "cart.address": "Dirección completa, Ciudad, Código Postal, País",
    "cart.notes": "Instrucciones de entrega (opcional)",
    "cart.placeOrder": "Confirmar pedido",
    "cart.placeOrderCard": "Pagar ahora",
    "cart.placeOrderIban": "Confirmar y ver datos IBAN",
    "cart.placeOrderWa": "Pedir por WhatsApp",
    "cart.secureNotice": "Pago cifrado conforme a los estándares europeos",
    "cart.copy": "Copiar",
    "cart.copied": "¡Copiado!",
    "cart.orderSuccess": "¡Pedido registrado con éxito!",
    "cart.ibanInstructions": "Por favor realice la transferencia con las coordenadas bancarias siguientes.",
    "cart.orderReference": "Concepto de la transferencia (Obligatorio)",
    "cart.printReceipt": "Imprimir datos bancarios / Factura",

    // Footer
    "footer.about": "Herbolario ecológico premium y soluciones botánicas de alta eficacia.",
    "footer.quickLinks": "Enlaces rápidos",
    "footer.customerService": "Atención al Cliente",
    "footer.legal": "Información Legal",
    "footer.rights": "Todos los derechos reservados. No constituye asesoramiento médico.",
  },

  de: {
    // Navigation
    "nav.home": "Startseite",
    "nav.shop": "Shop",
    "nav.immunity": "Immunität",
    "nav.stress": "Stress & Ruhe",
    "nav.sleep": "Schlaf",
    "nav.energy": "Energie & Tonus",
    "nav.account": "Mein Konto",
    "nav.cart": "Warenkorb",
    "nav.admin": "CMS Admin",

    // Header & Global
    "site.tagline": "Exzellente Kräuterapotheke & KI-Naturheilkunde",
    "theme.label": "Design-Thema",
    "currency.label": "Währung",
    "language.label": "Sprache",

    // Hero
    "hero.badge": "Intelligente Suche & Phytotherapie",
    "hero.title": "Das richtige Naturheilmittel,",
    "hero.titleHighlight": "im richtigen Moment.",
    "hero.subtitle":
      "Beschreiben Sie einfach, wie Sie sich fühlen (Stress, Müdigkeit, Schlafstörungen…). Unsere KI empfiehlt die passenden Pflanzen.",
    "hero.searchPlaceholder": "Z.B.: Schlaflosigkeit, Verdauung, Erschöpfung…",
    "hero.reassurance.shipping": "Sendungsverfolgung EU & Weltweit",
    "hero.reassurance.bio": "Zertifizierte Bio-Qualität",
    "hero.reassurance.payment": "Sichere Kartenzahlung & Überweisung",

    // Sections
    "section.categories.title": "Gesundheitskategorien",
    "section.categories.subtitle": "Entdecken Sie Heilmittel nach persönlichem Bedarf.",
    "section.featured.title": "Beliebte Bestseller",
    "section.featured.subtitle": "Von unseren Kunden besonders geschätzte Rezepturen.",
    "section.featured.viewAll": "Alle ansehen",
    "section.newest.title": "Neuheiten aus dem Labor",
    "section.reviews.title": "Kundenstimmen",
    "section.reviews.subtitle": "Echte Erfahrungsberichte über die Reinheit unserer Pflanzen.",
    "section.faq.title": "Häufig Gestellte Fragen",
    "section.faq.subtitle": "Alle Antworten zu Heilmitteln, Zahlung und Versand.",

    // Products
    "product.addToCart": "In den Warenkorb",
    "product.inStock": "Auf Lager",
    "product.outOfStock": "Vorübergehend vergriffen",
    "product.rating": "Verifizierte Bewertungen",
    "product.bioCertified": "Bio-Zertifiziert",
    "product.freeShippingNotice": "Kostenloser Versand ab 50 €",
    "product.details": "Wirkung & Details",
    "product.usage": "Anwendungsempfehlung",
    "product.ingredients": "Botanische Inhaltsstoffe",

    // Cart & Checkout
    "cart.title": "Warenkorb",
    "cart.empty": "Ihr Warenkorb ist leer",
    "cart.emptySubtitle": "Entdecken Sie unsere natürlichen Heilmittel und starten Sie Ihre Kur heute.",
    "cart.explore": "Zum Shop",
    "cart.items": "Artikel",
    "cart.subtotal": "Zwischensumme",
    "cart.shipping": "Versandkosten",
    "cart.shippingFree": "Kostenlos",
    "cart.promoCode": "Rabattcode",
    "cart.apply": "Anwenden",
    "cart.total": "Gesamtbetrag",
    "cart.checkout": "Kasse & Bestellabschluss",
    "cart.paymentMethod": "Zahlungsmethode",
    "cart.ibanTransfer": "Banküberweisung (IBAN / SEPA)",
    "cart.ibanTransferDesc": "Direkte Überweisung auf unser offizielles Geschäftskonto",
    "cart.creditCard": "Kreditkarte (Visa, Mastercard)",
    "cart.creditCardDesc": "Sichere internationale 3D-Secure Zahlung",
    "cart.whatsappOrder": "WhatsApp-Bestellservice",
    "cart.whatsappOrderDesc": "Persönliche Beratung und Begleitung",
    "cart.deliveryDetails": "Lieferadresse",
    "cart.fullName": "Vor- und Nachname",
    "cart.phone": "Telefonnummer mit Landesvorwahl",
    "cart.address": "Vollständige Adresse (Straße, Stadt, PLZ, Land)",
    "cart.notes": "Lieferhinweise (optional)",
    "cart.placeOrder": "Bestellung aufgeben",
    "cart.placeOrderCard": "Jetzt bezahlen",
    "cart.placeOrderIban": "Bestätigen & IBAN anzeigen",
    "cart.placeOrderWa": "Per WhatsApp bestellen",
    "cart.secureNotice": "Verschlüsselte Zahlung nach europäischen Standards",
    "cart.copy": "Kopieren",
    "cart.copied": "Kopiert!",
    "cart.orderSuccess": "Bestellung erfolgreich übermittelt!",
    "cart.ibanInstructions": "Bitte führen Sie die Überweisung mit folgenden Bankdaten aus.",
    "cart.orderReference": "Verwendungszweck (Erforderlich)",
    "cart.printReceipt": "Bankverbindung drucken / Quittung",

    // Footer
    "footer.about": "Premium Bio-Apotheke und sorgfältig ausgewählte Pflanzenextrakte.",
    "footer.quickLinks": "Schnellzugriff",
    "footer.customerService": "Kundenservice",
    "footer.legal": "Rechtliche Hinweise",
    "footer.rights": "Alle Rechte vorbehalten. Ersetzt keinen ärztlichen Rat.",
  },
};

const STORAGE_KEY = "phyto_selected_language_v1";
const listeners = new Set<() => void>();
let currentLanguage: LanguageCode = "fr";
let initialized = false;

function hydrate() {
  if (initialized || typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode;
    if (saved && TRANSLATIONS[saved]) {
      currentLanguage = saved;
    } else {
      // Detect browser language
      const navLang = navigator.language?.slice(0, 2).toLowerCase();
      if (navLang && (navLang === "en" || navLang === "es" || navLang === "de")) {
        currentLanguage = navLang as LanguageCode;
      }
    }
  } catch {}
  initialized = true;
}

export const i18nStore = {
  get(): LanguageCode {
    hydrate();
    return currentLanguage;
  },
  set(lang: LanguageCode) {
    if (!TRANSLATIONS[lang]) return;
    currentLanguage = lang;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
      } catch {}
    }
    listeners.forEach((l) => l());
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  t(key: string, fallback?: string): string {
    const lang = i18nStore.get();
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.fr[key] || fallback || key;
  },
};

export function useI18n() {
  const lang = useSyncExternalStore(
    (cb) => i18nStore.subscribe(cb),
    () => i18nStore.get(),
    () => "fr" as LanguageCode
  );

  useEffect(() => {
    hydrate();
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return {
    lang,
    languages: SUPPORTED_LANGUAGES,
    currentLanguageInfo: SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0],
    setLang: (newLang: LanguageCode) => i18nStore.set(newLang),
    t: (key: string, fallback?: string) => i18nStore.t(key, fallback),
  };
}
