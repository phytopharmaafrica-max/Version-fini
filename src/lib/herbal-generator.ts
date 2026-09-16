// Herbal & Botanical Auto-Description Engine
// Generates rich, scientific, and marketing-ready product sheets from product names, images, or categories.
// Works 100% offline without any paid API, and enhances with server-side Gemini Flash if available.

export interface GeneratedProductData {
  name: string;
  badge: string;
  short_description: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  usage: string;
}

const CATEGORY_KNOWLEDGE: Record<string, {
  keywords: string[];
  defaultBenefits: string[];
  defaultIngredients: string[];
  defaultUsage: string;
}> = {
  "cat-1-immunite": {
    keywords: ["immunité", "défense", "propolis", "échinacée", "ravintsara", "zinc", "vitamine c", "sureau"],
    defaultBenefits: [
      "Stimule et renforce les défenses naturelles de l'organisme",
      "Action antivirale et antibactérienne d'origine végétale",
      "Aide à prévenir et soulager les affections saisonnières",
      "Riche en antioxydants protecteurs des cellules"
    ],
    defaultIngredients: ["Extrait pur de Propolis bio", "Échinacée purpurea titrée", "Vitamine C naturelle d'Acérola", "Huile essentielle de Ravintsara bio"],
    defaultUsage: "Prendre 1 à 2 gélules (ou 15 gouttes) le matin avec un grand verre d'eau tempérée. En cure de 3 semaines lors des changements de saison.",
  },
  "cat-2-stress": {
    keywords: ["stress", "anxiété", "calme", "sérénité", "ashwagandha", "rhodiole", "passiflore", "mélisse"],
    defaultBenefits: [
      "Régule naturellement le taux de cortisol et apaise le système nerveux",
      "Améliore la résistance physique et psychologique face aux tensions",
      "Favorise une détente mentale profonde sans provoquer de somnolence",
      "Aide à retrouver clarté d'esprit et équilibre émotionnel"
    ],
    defaultIngredients: ["Racine d'Ashwagandha KSM-66 bio", "Extrait titré de Rhodiole rose", "Feuilles de Mélisse officinale", "Fleurs de Passiflore bio"],
    defaultUsage: "Prendre 1 gélule le matin et 1 en fin d'après-midi au cours d'un repas. Déconseillé en cas de grossesse sans avis médical.",
  },
  "cat-3-sommeil": {
    keywords: ["sommeil", "insomnie", "nuit", "valériane", "eschscholtzia", "coquelicot", "camomille", "tilleul"],
    defaultBenefits: [
      "Réduit le temps d'endormissement sans créer d'accoutumance",
      "Favorise des cycles de sommeil profond et véritablement réparateurs",
      "Évite les réveils nocturnes liés à l'agitation mentale",
      "Réveil matinal lucide et sans effet de lourdeur"
    ],
    defaultIngredients: ["Racine de Valériane officinale", "Pavot de Californie (Eschscholtzia)", "Fleurs de Camomille matricaire", "Bractées de Tilleul sauvage"],
    defaultUsage: "Prendre 2 gélules ou 1 cuillère à café d'infusion 30 à 45 minutes avant le coucher avec une eau chaude non bouillante.",
  },
  "cat-4-digestion": {
    keywords: ["digestion", "foie", "ballonnement", "artichaut", "chardon marie", "menthe poivrée", "fenouil", "desmodium"],
    defaultBenefits: [
      "Favorise une digestion légère et fluide après chaque repas",
      "Détoxifie et protège la sphère hépatique (foie et vésicule)",
      "Élimine les gaz, crampes abdominales et sensations de pesanteur",
      "Soutient le confort intestinal et l'équilibre du microbiote"
    ],
    defaultIngredients: ["Graines de Chardon-Marie titrées en silymarine", "Feuilles d'Artichaut de Laon", "Graines de Fenouil doux", "Feuilles de Menthe poivrée bio"],
    defaultUsage: "Prendre 1 gélule (ou 20 gouttes) avant les 2 principaux repas, ou 1 tasse d'infusion après le repas.",
  },
  "cat-5-energie": {
    keywords: ["énergie", "vitalité", "moringa", "spiruline", "ginseng", "maca", "tonus", "fatigue"],
    defaultBenefits: [
      "Apporte un regain d'énergie naturel et durable tout au long de la journée",
      "Recharge l'organisme en minéraux essentiels, fer biodisponible et acides aminés",
      "Combat la fatigue chronique et soutient l'effort intellectuel et physique",
      "Formule 100% biodisponible sans excitants artificiels"
    ],
    defaultIngredients: ["Feuilles de Moringa oleifera bio séchées à froid", "Spiruline pure artisanale séchée à basse température", "Racine de Ginseng blanc Panax", "Maca du Pérou"],
    defaultUsage: "Prendre 1 cuillère à café de poudre dans un smoothie ou 2 gélules le matin au petit-déjeuner. Éviter la prise le soir.",
  },
};

export async function generateHerbalDescription(
  paramsOrName:
    | string
    | {
        name?: string;
        categoryId?: string;
        imageFileName?: string;
        imageBase64?: string;
      },
  maybeCategoryId?: string
): Promise<GeneratedProductData> {
  const params =
    typeof paramsOrName === "string"
      ? { name: paramsOrName, categoryId: maybeCategoryId }
      : paramsOrName;

  const rawName = (params.name || params.imageFileName || "Remède Végétal")
    .replace(/\.[^/.]+$/, "") // Remove file extension like .jpg or .png
    .replace(/[_-]/g, " ")
    .trim();

  // Try server-side AI first (free Gemini model on Cloud Run / Vite backend)
  try {
    const res = await fetch("/api/ai/describe-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: rawName,
        categoryId: params.categoryId,
        imageBase64: params.imageBase64 ? params.imageBase64.slice(0, 150000) : undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.product) {
        return data.product;
      }
    }
  } catch {
    // Graceful offline fallback
  }

  // Pure Offline Algorithmic Generator
  const catId = params.categoryId || "cat-1-immunite";
  const catKnowledge = CATEGORY_KNOWLEDGE[catId] || CATEGORY_KNOWLEDGE["cat-1-immunite"];

  // Format capitalized name
  const formattedName = rawName
    ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
    : "Synergie Végétale d'Élite";

  const shortDesc = `Élixir phyto-actif de haute pureté, formulé pour revitaliser l'organisme et restaurer l'équilibre physiologique de façon 100% naturelle.`;

  const fullDesc = `Issu de la tradition herboriste séculaire et validé par les recherches contemporaines en naturopathie, ce remède à base de ${formattedName.toLowerCase()} concentre les principes actifs les plus purs des plantes médicinales.

Récolté de manière éco-responsable dans des terroirs préservés, ce complexe bénéficie d'un procédé d'extraction douce à froid qui garantit l'intégrité intégrale des flavonoïdes, terpènes et micronutriments protecteurs. Il accompagne harmonieusement le métabolisme sans aucun effet secondaire indésirable.

Chaque lot fait l'objet d'un triple contrôle de pureté en laboratoire indépendant (absence de pesticides, métaux lourds et solvants de synthèse).`;

  return {
    name: formattedName,
    badge: "Formule Certifiée Pure",
    short_description: shortDesc,
    description: fullDesc,
    benefits: catKnowledge.defaultBenefits,
    ingredients: catKnowledge.defaultIngredients,
    usage: catKnowledge.defaultUsage,
  };
}
