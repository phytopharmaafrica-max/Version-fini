import { createFileRoute } from "@tanstack/react-router";
import { useCms } from "@/lib/cms-store";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/mentions")({
  head: () => ({
    meta: [
      { title: "Mentions Légales — Phytocare" },
      { name: "description", content: "Mentions légales et informations de l'éditeur Phytocare" },
    ],
  }),
  component: MentionsPage,
});

function MentionsPage() {
  const cms = useCms();
  const page = cms.customPages.find((p) => p.slug === "mentions");

  return (
    <div className="container-page py-12 max-w-4xl">
      <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
        <Building2 className="h-4 w-4" />
        <span>Éditeur & Hébergement</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-navy">
        {page?.title || "Mentions Légales"}
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
          <p>Chargement des mentions légales…</p>
        )}
      </div>
    </div>
  );
}
