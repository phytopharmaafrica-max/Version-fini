import { createFileRoute } from "@tanstack/react-router";
import { useCms } from "@/lib/cms-store";
import { FileText, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/cgv")({
  head: () => ({
    meta: [
      { title: "Conditions Générales de Vente — Phytocare" },
      { name: "description", content: "CGV et garanties de Phytocare" },
    ],
  }),
  component: CgvPage,
});

function CgvPage() {
  const cms = useCms();
  const cgvPage = cms.customPages.find((p) => p.slug === "cgv");

  return (
    <div className="container-page py-12 max-w-4xl">
      <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
        <ShieldCheck className="h-4 w-4" />
        <span>Normes & Réglementation Internationale</span>
      </div>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold text-navy">
        {cgvPage?.title || "Conditions Générales de Vente"}
      </h1>
      {cgvPage?.subtitle && (
        <p className="mt-2 text-muted-foreground text-base">
          {cgvPage.subtitle}
        </p>
      )}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-10 shadow-xs prose prose-emerald max-w-none text-foreground/90 space-y-4">
        {cgvPage?.content ? (
          <div className="whitespace-pre-line leading-relaxed text-sm md:text-base">
            {cgvPage.content}
          </div>
        ) : (
          <p>Chargement des conditions générales de vente…</p>
        )}
      </div>
    </div>
  );
}
