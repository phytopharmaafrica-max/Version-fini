import { createFileRoute } from "@tanstack/react-router";
import { useCms } from "@/lib/cms-store";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de Confidentialité — Phytocare" },
      { name: "description", content: "Protection de vos données de santé et informations personnelles" },
    ],
  }),
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
  const cms = useCms();
  const page = cms.customPages.find((p) => p.slug === "confidentialite");

  return (
    <div className="container-page py-12 max-w-4xl">
      <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
        <Lock className="h-4 w-4" />
        <span>Sécurité & Vie Privée RGPD</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-navy">
        {page?.title || "Politique de Confidentialité"}
      </h1>
      {page?.subtitle && (
        <p className="mt-2 text-muted-foreground text-base">{page.subtitle}</p>
      )}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-10 shadow-xs prose max-w-none text-foreground/90 space-y-4">
        {page?.content ? (
          <div className="whitespace-pre-line leading-relaxed text-sm md:text-base">
            {page.content}
          </div>
        ) : (
          <p>Chargement de la politique de confidentialité…</p>
        )}
      </div>
    </div>
  );
}
