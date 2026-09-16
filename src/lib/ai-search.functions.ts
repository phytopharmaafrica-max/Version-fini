import { createServerFn } from "@tanstack/react-start";

export type SearchedProduct = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  badge: string | null;
  rating: number;
  category_slug: string | null;
};

export const aiSearchProducts = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const q = (input as { query?: string })?.query?.toString().trim() ?? "";
    if (!q || q.length > 300) throw new Error("Recherche invalide");
    return { query: q };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Load categories and a lightweight product list
    const [{ data: cats }, { data: products }] = await Promise.all([
      supabaseAdmin.from("categories").select("id, slug, name, description"),
      supabaseAdmin
        .from("products")
        .select("id, slug, name, short_description, description, benefits, price, currency, image_url, badge, rating, category_id")
        .eq("active", true),
    ]);

    const geminiKey = process.env.GEMINI_API_KEY;
    let matchedCategorySlug: string | null = null;

    if (geminiKey && cats?.length) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const resp = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Catégories disponibles: ${(cats as any[])?.map((c: any) => `${c.slug} (${c.name} — ${c.description ?? ""})`).join(" ; ") ?? ""}\n\nDemande utilisateur: "${data.query}"\n\nClasse cette demande dans UNE catégorie produit. Réponds STRICTEMENT au format JSON: {"category": "slug_choisi"} ou {"category": null}. Pas d'autre texte.`,
        });
        const txt = resp.text || "";
        const m = txt.match(/\{[^}]*\}/);
        if (m) {
          const parsed = JSON.parse(m[0]);
          if (parsed?.category && (cats as any[])?.some((c: any) => c.slug === parsed.category)) {
            matchedCategorySlug = parsed.category;
          }
        }
      } catch (e) {
        console.error("Gemini search category classification failed", e);
      }
    }

    // Natural heuristic intent classifier fallback
    if (!matchedCategorySlug) {
      const qLower = data.query.toLowerCase();
      if (/dormir|sommeil|insomn|nuit|reveil|coucher/.test(qLower)) matchedCategorySlug = "sommeil";
      else if (/stress|anxiet|calme|nerveux|angoisse|serenit|tension|panique/.test(qLower)) matchedCategorySlug = "stress";
      else if (/immunit|defense|rhume|gorge|virus|infe|hiver/.test(qLower)) matchedCategorySlug = "immunite";
      else if (/digest|ventre|ballonn|estomac|gaz|foie|lourdeur|transit/.test(qLower)) matchedCategorySlug = "digestion";
      else if (/energi|vitalit|fatigu|tonus|sport|epuis|coup de barre|forme/.test(qLower)) matchedCategorySlug = "energie";
    }

    // Build keyword score as a fallback / boost
    const tokens = data.query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/\s+/)
      .filter((t: string) => t.length > 2);

    const catById = new Map(((cats as any[]) ?? []).map((c: any) => [c.id, c.slug as string]));

    const scored = ((products as any[]) ?? []).map((p: any) => {
      const hay = [p.name, p.short_description, p.description, p.benefits]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      let score = 0;
      for (const t of tokens) if (hay.includes(t)) score += 1;
      if (matchedCategorySlug && catById.get(p.category_id ?? "") === matchedCategorySlug) score += 5;
      return { p, score };
    });

    const filtered = scored
      .filter((s: { score: number }) => s.score > 0)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 12)
      .map(
        ({ p }: { p: any }): SearchedProduct => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          short_description: p.short_description,
          price: Number(p.price),
          currency: p.currency,
          image_url: p.image_url,
          badge: p.badge,
          rating: Number(p.rating),
          category_slug: (catById.get(p.category_id ?? "") as string) ?? null,
        }),
      );

    return {
      query: data.query,
      category: matchedCategorySlug,
      results: filtered,
    };
  });
