export const WHATSAPP_NUMBER = "22965549697";

export interface WhatsAppOrderPayload {
  orderNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  currency?: string;
  customerName?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  targetNumber?: string;
}

export function buildWhatsAppOrderLink(payload: WhatsAppOrderPayload): string {
  const currency = payload.currency || "€";
  const lines = [
    `🌿 *NOUVELLE COMMANDE PHYTOCARE* 🌿`,
    `N° de commande : *${payload.orderNumber}*`,
    payload.customerName ? `Client : ${payload.customerName}` : "",
    payload.phone ? `Téléphone : ${payload.phone}` : "",
    payload.address ? `Livraison : ${payload.address}` : "",
    payload.paymentMethod ? `Paiement : ${payload.paymentMethod}` : "",
    "",
    `*Articles commandés :*`,
    ...payload.items.map(
      (item) => `• ${item.name} × ${item.quantity} (${(item.price * item.quantity).toFixed(2)} ${currency})`
    ),
    "",
    `*Total à régler : ${payload.total.toFixed(2)} ${currency}*`,
    "",
    `Merci de bien vouloir valider ma commande et me communiquer les modalités d'expédition.`,
  ].filter(Boolean);

  const text = lines.join("\n");
  const rawNum = payload.targetNumber || WHATSAPP_NUMBER;
  const cleanNum = rawNum.replace(/[^0-9]/g, "") || WHATSAPP_NUMBER;
  return `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
}
