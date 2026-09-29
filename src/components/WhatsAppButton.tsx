import { buildWhatsAppSupportLink } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

export function WhatsAppButton() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Masquer sur la page panier pour ne pas obstruer le formulaire de commande
  if (pathname === "/panier") {
    return null;
  }

  const href = buildWhatsAppSupportLink(
    "Bonjour, je sollicite une assistance ou des conseils personnalisés auprès de votre herboristerie Phytocare.",
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conseiller & Assistance WhatsApp (Canal Sécurisé & Protégé)"
      title="Échanger avec notre conseiller herboriste sur WhatsApp"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-[calc(1rem+env(safe-area-inset-right,0px))] sm:right-5 z-40 inline-flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)] transition hover:scale-105 active:scale-95 touch-manipulation"
    >
      <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
    </a>
  );
}

