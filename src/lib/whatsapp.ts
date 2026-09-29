/**
 * Module sécurisé WhatsApp Phytocare
 * Les numéros sont strictement protégés et masqués de l'affichage public
 * pour des raisons de sécurité et de prévention anti-fraude / anti-scraping.
 */

// Numéro sécurisé dédié aux PAIEMENTS & COMMANDES (+229 01 56 31 34 31)
export const WHATSAPP_PAYMENT_NUMBER = "2290156313431";

// Numéro sécurisé dédié à l'ASSISTANCE, CONSEILLER & CONSULTATION (+229 01 65 54 96 97)
export const WHATSAPP_SUPPORT_NUMBER = "2290165549697";

// Rétrocompatibilité
export const WHATSAPP_NUMBER = WHATSAPP_SUPPORT_NUMBER;

export const MASKED_PAYMENT_CHANNEL = "Canal Officiel de Paiement WhatsApp (Sécurisé & Chiffré)";
export const MASKED_SUPPORT_CHANNEL = "Assistance & Conseiller WhatsApp (Canal Protégé)";

export interface WhatsAppOrderPayload {
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  currency?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  notes?: string;
  paymentMethod?: string;
  targetNumber?: string;
}

/**
 * Génère le lien sécurisé pour transmettre le paiement et la commande
 * directement au responsable des paiements via WhatsApp (+2290156313431).
 */
export function buildWhatsAppPaymentLink(payload: WhatsAppOrderPayload): string {
  const currency = payload.currency || "€";
  const lines = [
    `🌿 *PAIEMENT & COMMANDE PHYTOCARE* 🌿`,
    `N° de commande : *#${payload.orderNumber}*`,
    payload.customerName ? `Client : ${payload.customerName}` : "",
    payload.phone ? `Téléphone : ${payload.phone}` : "",
    payload.address ? `Adresse de livraison : ${payload.address}` : "",
    payload.notes ? `Instructions : ${payload.notes}` : "",
    payload.paymentMethod ? `Mode sélectionné : ${payload.paymentMethod}` : "Règlement WhatsApp Direct",
    "",
    `*Articles commandés :*`,
    ...payload.items.map(
      (item) => `• ${item.name} × ${item.quantity} (${(item.price * item.quantity).toFixed(2)} ${currency})`
    ),
    "",
    `*TOTAL À RÉGLER : ${payload.total.toFixed(2)} ${currency}*`,
    "",
    `🔒 _Je transmets mon règlement et les informations de livraison pour validation et expédition rapide de ma commande._`,
  ].filter(Boolean);

  const text = lines.join("\n");
  const rawNum = payload.targetNumber || WHATSAPP_PAYMENT_NUMBER;
  const cleanNum = rawNum.replace(/[^0-9]/g, "") || WHATSAPP_PAYMENT_NUMBER;
  return `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
}

// Alias pour compatibilité
export const buildWhatsAppOrderLink = buildWhatsAppPaymentLink;

/**
 * Génère le lien pour échanger avec l'assistance, le conseiller ou pour une consultation (+2290165549697).
 */
export function buildWhatsAppSupportLink(customMessage?: string): string {
  const defaultMsg =
    "Bonjour, je souhaite échanger avec un conseiller ou obtenir une assistance sur vos produits Phytocare.";
  const text = customMessage || defaultMsg;
  return `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Génère le lien pour une consultation naturopathique / herboriste (+2290165549697).
 */
export function buildWhatsAppConsultationLink(concern?: string): string {
  const text = concern
    ? `Bonjour, je sollicite une consultation herboriste personnalisée au sujet de : ${concern}.`
    : "Bonjour, je souhaite bénéficier d'une consultation personnalisée avec votre conseiller herboriste Phytocare.";
  return `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(text)}`;
}

