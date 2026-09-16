import { SEED_PRODUCTS, type Product } from "@/data/phytocare-seed";

export interface DorineRecommendation {
  text: string;
  category?: string;
  products: Product[];
  tips?: string[];
  disclaimer?: string;
}

const DEFAULT_DISCLAIMER =
  "Les plantes sont de précieuses alliées, mais elles ne remplacent pas une consultation médicale. En cas de pathologie chronique, de grossesse ou d'allaitement, demandez l'avis de votre médecin ou pharmacien.";

// Base de connaissances naturopathique complète de Dorine
interface TopicAdvice {
  keywords: string[];
  category: string;
  recommendedProductIds: string[];
  title: string;
  advice: string;
  tips: string[];
}

const KNOWLEDGE_BASE: TopicAdvice[] = [
  {
    keywords: ["sommeil", "dormir", "insomnie", "nuit", "reveil", "endormir", "nocturne", "fatigue matinale"],
    category: "sommeil",
    recommendedProductIds: ["prod-1-tisane-sommeil", "prod-2-elixir-stress"],
    title: "Retrouver un sommeil profond et réparateur",
    advice:
      "Pour un sommeil de qualité, la phytothérapie offre des solutions douces et sans accoutumance. La Camomille matricaire apaise le système nerveux, tandis que la Passiflore et la Mélisse calment l'agitation mentale et facilitent l'endormissement.",
    tips: [
      "Infusez 1 cuillère à café de Tisane Sommeil Réparateur dans une eau à 90°C pendant 7 à 10 minutes, à boire 30 minutes avant le coucher.",
      "Coupez les écrans (lumière bleue) au moins 45 minutes avant de dormir pour relancer la sécrétion naturelle de mélatonine.",
      "Maintenez votre chambre fraîche (entre 18°C et 20°C) et pratiquez 5 minutes de respiration lente (cohérence cardiaque).",
    ],
  },
  {
    keywords: ["stress", "angoisse", "anxiete", "surmenage", "tension", "pression", "panique", "nerveux", "burnout"],
    category: "stress",
    recommendedProductIds: ["prod-2-elixir-stress", "prod-1-tisane-sommeil"],
    title: "Apaiser le mental et relâcher les tensions",
    advice:
      "Le stress chronique épuise les surrénales et perturbe la production de cortisol. Pour restaurer l'équilibre, nous privilégions des extraits de plantes calmantes et adaptogènes comme l'Aubépine, la Lavande vraie et le Basilic sacré.",
    tips: [
      "Prenez 15 à 20 gouttes de notre Élixir Anti-Stress matin et soir diluées dans un demi-verre d'eau ou sous la langue.",
      "Pratiquez la technique de respiration 4-7-8 : inspirez sur 4 secondes, retenez 7 secondes, expirez lentement par la bouche sur 8 secondes.",
      "Réduisez les excitants (café fort, boissons énergisantes) après 14h pour ne pas surstimuler le système nerveux.",
    ],
  },
  {
    keywords: ["digestion", "ventre", "ballonnement", "gaz", "estomac", "reflux", "constipation", "lourdeur", "foie", "lourd"],
    category: "digestion",
    recommendedProductIds: ["prod-4-synergie-digestion", "prod-7-infusion-detox"],
    title: "Retrouver une digestion légère et un ventre plat",
    advice:
      "Une digestion difficile résulte souvent d'une mastication trop rapide, d'un déficit d'enzymes digestives ou d'une flore intestinale perturbée. Les graines de Fenouil, la Menthe poivrée et la Badiane sont remarquables pour dissiper les spasmes et gaz.",
    tips: [
      "Buvez une tasse tiède de la Synergie Digestion Légère 15 minutes après le repas principal.",
      "Prenez le temps de mastiquer chaque bouchée 15 à 20 fois pour pré-digérer les amidons grâce à la salive.",
      "Évitez de boire de grandes quantités d'eau glacée pendant le repas, ce qui dilue l'acide gastrique.",
    ],
  },
  {
    keywords: ["immunite", "malade", "rhume", "gorge", "froid", "grippe", "virus", "infection", "defense", "toux"],
    category: "immunite",
    recommendedProductIds: ["prod-3-immunite-forte", "prod-6-huile-nigelle"],
    title: "Renforcer vos défenses immunitaires naturelles",
    advice:
      "Pour protéger l'organisme des agressions saisonnières, l'alliance de la Propolis, de l'Échinacée, de l'Acérola (vitamine C naturelle) et de l'Huile de Nigelle offre un bouclier protecteur remarquable stimulant les globules blancs.",
    tips: [
      "Prenez 1 cuillère à café d'Huile de Nigelle à jeun le matin, pure ou mélangée avec une cuillère de miel pur d'acacia.",
      "Associez 2 gélules de Complexe Immunité Forte chaque matin pendant une cure de 21 jours renouvelable.",
      "Hydratez-vous avec des infusions tièdes de thym, gingembre frais et citron pour assainir les voies respiratoires.",
    ],
  },
  {
    keywords: ["energie", "fatigue", "epuise", "tonus", "vitalite", "coup de pompe", "faiblesse", "asthenie", "reveil difficile"],
    category: "energie",
    recommendedProductIds: ["prod-5-moringa-vitalite", "prod-8-spiruline"],
    title: "Revitaliser votre corps en profondeur",
    advice:
      "La fatigue constante provient souvent de carences minérales ou de micro-nutriments essentiels. Le Moringa et la Spiruline sont de véritables trésors nutritionnels concentrant fer assimilable, protéines végétales, antioxydants et vitamines B.",
    tips: [
      "Consommez 2 gélules de Moringa Bio chaque matin avec un grand verre d'eau au cours du petit-déjeuner.",
      "Ajoutez 1 cuillère de Spiruline artisanale dans vos smoothies, jus de fruits frais ou compotes.",
      "Exposez-vous à la lumière naturelle 15 minutes dès le réveil pour réguler votre horloge biologique circadienne.",
    ],
  },
  {
    keywords: ["nigelle", "habba sawda", "graine noire", "cumin noir", "huile de nigelle"],
    category: "immunite",
    recommendedProductIds: ["prod-6-huile-nigelle", "prod-3-immunite-forte"],
    title: "L'Huile de Nigelle pure (Habba Sawda) — Le remède universel",
    advice:
      "L'Huile de Nigelle (Nigella Sativa) pressée à froid est riche en thymoquinone, un puissant anti-inflammatoire et antioxydant naturel. Elle renforce le système immunitaire, protège la sphère respiratoire et apaise les peaux à imperfections ou irritées.",
    tips: [
      "En usage interne : 1 cuillère à café chaque matin à jeun avec un peu de miel.",
      "En usage externe : quelques gouttes massées délicatement sur le visage ou le cuir chevelu le soir.",
      "Conservez votre flacon à l'abri de la lumière et de la chaleur pour préserver tous les acides gras actifs.",
    ],
  },
  {
    keywords: ["moringa", "arbre de vie", "feuille de moringa"],
    category: "energie",
    recommendedProductIds: ["prod-5-moringa-vitalite"],
    title: "Le Moringa Bio — Le super-aliment complet",
    advice:
      "Surnommé l'Arbre de Vie, le Moringa Oleifera contient 7 fois plus de vitamine C que l'orange, 4 fois plus de calcium que le lait, et 3 fois plus de fer que les épinards. Il combat l'anémie, stimule la vitalité et stabilise l'énergie sans provoquer de nervosité.",
    tips: [
      "Cure idéale de 30 jours : 2 gélules le matin et 1 gélule le midi.",
      "Excellent soutien lors des périodes de jeûne, d'examens ou de convalescence.",
    ],
  },
  {
    keywords: ["spiruline", "micro algue", "fer", "anemie", "sport"],
    category: "energie",
    recommendedProductIds: ["prod-8-spiruline", "prod-5-moringa-vitalite"],
    title: "La Spiruline Pure Artisanale — Énergie et régénération",
    advice:
      "La Spiruline est une micro-algue d'eau douce contenant plus de 65% de protéines complètes, de la phycocyanine (pigment bleu antioxydant) et du fer hautement biodisponible. Idéale pour les sportifs, les végétariens et les personnes fatiguées.",
    tips: [
      "Prenez 3 à 5 grammes (ou comprimés) le matin accompagnés d'une source de vitamine C (orange, citron) pour maximiser l'absorption du fer.",
      "Commencez par une demi-dose les 3 premiers jours pour habituer doucement votre organisme.",
    ],
  },
  {
    keywords: ["detox", "toxine", "foie", "reins", "purifier", "kinkeliba", "drainage"],
    category: "digestion",
    recommendedProductIds: ["prod-7-infusion-detox", "prod-4-synergie-digestion"],
    title: "Cure Détox & Drainage des émonctoires",
    advice:
      "Le corps accumule naturellement des déchets métaboliques. Une cure de plantes dépuratives (Kinkeliba, Desmodium, Romarin, Pissenlit) stimule le travail du foie et des reins pour retrouver teint éclatant et légèreté.",
    tips: [
      "Buvez 1 litre d'Infusion Détox tiède tout au long de la matinée pendant 14 jours.",
      "Favorisez les légumes verts amers (artichaut, roquette, pissenlit) et réduisez les sucres raffinés et fritures.",
    ],
  },
];

// Consultation Dorine intelligente
export async function getDorineConsultation(userMessage: string): Promise<DorineRecommendation> {
  const query = userMessage.trim();
  if (!query) {
    return {
      text: "Bonjour ! Je suis Dorine, votre conseillère en herboristerie et santé naturelle chez Phytocare. Décrivez-moi vos ressentis (sommeil difficile, stress, fatigue, digestion…) et je vous guide vers les remèdes végétaux adaptés.",
      products: SEED_PRODUCTS.slice(0, 3),
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }

  // 1. Essai de l'endpoint IA côté serveur (Gemini) si actif
  try {
    const res = await fetch("/api/dorine/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: query }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.reply) {
        // Associer les produits pertinents selon les mots clés
        const matchedProducts = findMatchingProducts(query + " " + data.reply);
        return {
          text: data.reply,
          category: data.category,
          products: matchedProducts,
          tips: data.tips,
          disclaimer: DEFAULT_DISCLAIMER,
        };
      }
    }
  } catch {
    // Si l'API serveur n'est pas disponible, bascule immédiate sur l'IA experte locale
  }

  // 2. Moteur expert naturopathique local
  return generateExpertLocalConsultation(query);
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function findMatchingProducts(text: string): Product[] {
  const norm = normalize(text);
  const scored = SEED_PRODUCTS.map((p) => {
    let score = 0;
    const nameNorm = normalize(p.name);
    const descNorm = normalize(p.description + " " + (p.benefits?.join(" ") || ""));

    if (norm.includes(normalize(p.slug))) score += 10;
    if (nameNorm.split(" ").some((w) => w.length > 3 && norm.includes(w))) score += 5;
    if (descNorm.split(" ").some((w) => w.length > 4 && norm.includes(w))) score += 2;

    // Catégories
    if (norm.includes("sommeil") && p.category_id === "cat-3-sommeil") score += 6;
    if (norm.includes("stress") && p.category_id === "cat-2-stress") score += 6;
    if (norm.includes("digest") && p.category_id === "cat-4-digestion") score += 6;
    if ((norm.includes("immun") || norm.includes("rhume") || norm.includes("froid")) && p.category_id === "cat-1-immunite") score += 6;
    if ((norm.includes("fatigue") || norm.includes("energie") || norm.includes("tonus")) && p.category_id === "cat-5-energie") score += 6;
    if (norm.includes("nigelle") && p.slug.includes("nigelle")) score += 12;
    if (norm.includes("moringa") && p.slug.includes("moringa")) score += 12;
    if (norm.includes("spiruline") && p.slug.includes("spiruline")) score += 12;

    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored.filter((s) => s.score > 0).map((s) => s.product);
  return best.length > 0 ? best.slice(0, 3) : SEED_PRODUCTS.slice(0, 3);
}

function generateExpertLocalConsultation(query: string): DorineRecommendation {
  const norm = normalize(query);

  // Vérifier salutation simple
  const greetings = ["bonjour", "salut", "bonsoir", "coucou", "hello", "qui es tu", "qui es-tu", "aide moi"];
  const isGreeting = greetings.some((g) => norm === g || norm.startsWith(g + " "));
  if (isGreeting && norm.length < 25) {
    return {
      text: "Bonjour et bienvenue chez Phytocare ! Je suis Dorine, votre herboriste et conseillère bien-être. Dites-moi ce qui vous préoccupe actuellement (difficulté à dormir, surmenage, digestion lourde, besoin de tonus ou renfort immunitaire) et je vous orienterai vers la synergie végétale idéale.",
      products: [
        SEED_PRODUCTS.find((p) => p.slug.includes("sommeil"))!,
        SEED_PRODUCTS.find((p) => p.slug.includes("nigelle"))!,
        SEED_PRODUCTS.find((p) => p.slug.includes("moringa"))!,
      ].filter(Boolean),
      tips: [
        "Vous pouvez m'expliquer vos symptômes simplement en quelques phrases.",
        "N'hésitez pas à demander le mode d'emploi, la posologie ou les précautions d'une plante.",
      ],
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }

  // Vérifier contre-indications grossesse
  if (norm.includes("enceinte") || norm.includes("grossesse") || norm.includes("allaitement")) {
    return {
      text: "C'est une excellente précaution de vous renseigner. Pendant la grossesse et l'allaitement, plusieurs plantes médicinales sont contre-indiquées (notamment les huiles essentielles pures et les plantes stimulantes ou toniques utérines). Les tisanes très douces de camomille ou de mélisse légère restent généralement tolérées, mais toute cure doit être expressément validée par votre sage-femme ou médecin traitant.",
      category: "Précautions",
      products: [SEED_PRODUCTS.find((p) => p.slug.includes("sommeil"))!],
      tips: [
        "Évitez l'Huile de Nigelle en usage interne durant la grossesse par mesure de sécurité.",
        "Consultez systématiquement un professionnel de santé avant de démarrer un nouveau complément.",
      ],
      disclaimer: "Attention : avis médical impératif pour les femmes enceintes et allaitantes.",
    };
  }

  // Chercher dans la base de connaissances
  let bestMatch: TopicAdvice | null = null;
  let maxMatches = 0;

  for (const item of KNOWLEDGE_BASE) {
    let matchCount = 0;
    for (const kw of item.keywords) {
      if (norm.includes(normalize(kw))) {
        matchCount++;
      }
    }
    if (matchCount > maxMatches) {
      maxMatches = matchCount;
      bestMatch = item;
    }
  }

  if (bestMatch && maxMatches > 0) {
    const products = bestMatch.recommendedProductIds
      .map((id) => SEED_PRODUCTS.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));

    return {
      text: `${bestMatch.title} : ${bestMatch.advice}`,
      category: bestMatch.category,
      products: products.length > 0 ? products : SEED_PRODUCTS.slice(0, 3),
      tips: bestMatch.tips,
      disclaimer: DEFAULT_DISCLAIMER,
    };
  }

  // Réponse personnalisée sémantique générale
  const generalProducts = findMatchingProducts(query);
  return {
    text: `J'ai bien pris en compte votre recherche concernant : « ${query} ». En phytothérapie, nous cherchons toujours à soutenir l'organisme à sa racine. Voici les remèdes naturels de notre catalogue les plus appropriés pour répondre à votre besoin :`,
    products: generalProducts,
    tips: [
      "Pour une efficacité optimale, suivez une cure régulière d'au moins 2 à 3 semaines.",
      "Pensez à boire 1,5L d'eau par jour pour faciliter l'assimilation des principes actifs végétaux.",
      "Pour toute question spécifique sur la posologie, vous pouvez aussi nous écrire directement sur WhatsApp.",
    ],
    disclaimer: DEFAULT_DISCLAIMER,
  };
}
