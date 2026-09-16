import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useCms } from "@/lib/cms-store";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";

export const Route = createFileRoute("/page/$slug")({
  component: CustomPageView,
});

function CustomPageView() {
  const { slug } = Route.useParams();
  const cms = useCms();
  const page = cms.customPages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <div className="container-page py-16 text-center max-w-lg">
        <h1 className="font-display text-2xl font-bold text-navy">Page introuvable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          La page demandée n'existe pas ou n'est plus publiée.
        </p>
        <Link to="/" className="btn-hero mt-6 inline-flex">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <article className="container-page py-12 max-w-4xl">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Retour à l'accueil
      </Link>

      <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
        <BookOpen className="h-4 w-4" />
        <span>Publication Officielle Phytocare</span>
      </div>

      <h1 className="font-display text-3xl md:text-5xl font-extrabold text-navy">
        {page.title}
      </h1>

      {page.subtitle && (
        <p className="mt-3 text-lg text-muted-foreground">{page.subtitle}</p>
      )}

      {page.updatedAt && (
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground border-b border-border pb-4">
          <Calendar className="h-3.5 w-3.5" />
          <span>Mise à jour le {page.updatedAt}</span>
        </div>
      )}

      {page.headerImage && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-border shadow-xs max-h-96">
          <img
            src={page.headerImage}
            alt={page.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 md:p-10 shadow-xs prose max-w-none text-foreground/90 space-y-4 leading-relaxed">
        <div className="whitespace-pre-line text-base md:text-lg">
          {page.content}
        </div>
      </div>
    </article>
  );
}
