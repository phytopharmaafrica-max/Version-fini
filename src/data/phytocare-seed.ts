export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  badge?: string | null;
  rating?: number | null;
  category_id?: string | null;
  stock: number;
  active: boolean;
  featured: boolean;
  benefits?: string[] | null;
  ingredients?: string[] | null;
  usage_instructions?: string | null;
  contraindications?: string | null;
  created_at?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  uses_count: number;
  max_uses?: number | null;
  min_order_amount?: number | null;
  created_at?: string;
}

export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-1-immunite",
    slug: "immunite",
    name: "Immunité",
    description: "Renforcer vos défenses naturelles avec nos synergies de plantes médicinales et d'antioxydants.",
    icon: "shield",
    sort_order: 1,
  },
  {
    id: "cat-2-stress",
    slug: "stress",
    name: "Stress & Sérénité",
    description: "Apaiser le mental, relâcher les tensions et retrouver un calme intérieur harmonieux.",
    icon: "leaf",
    sort_order: 2,
  },
  {
    id: "cat-3-sommeil",
    slug: "sommeil",
    name: "Sommeil",
    description: "Favoriser un endormissement rapide et un repos nocturne profond sans accoutumance.",
    icon: "moon",
    sort_order: 3,
  },
  {
    id: "cat-4-digestion",
    slug: "digestion",
    name: "Digestion",
    description: "Soutenir un transit fluide, éliminer les ballonnements et alléger la digestion.",
    icon: "sparkles",
    sort_order: 4,
  },
  {
    id: "cat-5-energie",
    slug: "energie",
    name: "Vitalité & Énergie",
    description: "Recharger votre organisme et stimuler vos facultés physiques et intellectuelles.",
    icon: "zap",
    sort_order: 5,
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-1-tisane-sommeil",
    slug: "tisane-sommeil-reparateur-bio",
    name: "Tisane Sommeil Réparateur Bio",
    short_description: "Infusion apaisante aux fleurs de camomille, mélisse et passiflore pour une nuit réparatrice.",
    description: "Formulée selon les traditions herboristes ancestrales, cette tisane associe la douceur de la camomille matricaire, la fraîcheur de la mélisse officinale et les vertus relaxantes de la passiflore. Elle invite à un lâcher-prise immédiat et prépare le corps à un sommeil profond et naturel, sans aucune somnolence au réveil.",
    price: 14.90,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
    badge: "Best-seller",
    rating: 4.9,
    category_id: "cat-3-sommeil",
    stock: 42,
    active: true,
    featured: true,
    benefits: [
      "Facilite l'endormissement dès 30 minutes",
      "Diminue les réveils nocturnes",
      "Calme l'agitation mentale et le stress",
      "100% plantes biologiques sans arôme ajouté"
    ],
    ingredients: ["Camomille matricaire", "Mélisse citronnée", "Passiflore", "Fleurs de tilleul", "Lavande vraie"],
    usage_instructions: "Infuser 1 cuillère à café dans une tasse d'eau frémissante (85°C) pendant 7 à 10 minutes. Boire 30 à 45 minutes avant le coucher.",
    contraindications: "Déconseillé aux enfants de moins de 6 ans sans avis médical.",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-2-etoile-immunite",
    slug: "etoile-immunite-moringa-curcuma",
    name: "Étoile d'Immunité (Moringa & Curcuma)",
    short_description: "Synergie fortifiante hautement concentrée en polyphénols, vitamine C et curcumine.",
    description: "Véritable bouclier biologique, cette cure associe la feuille de moringa africain réputée pour sa densité nutritionnelle hors du commun, au curcuma titré et au poivre noir pour une biodisponibilité maximale. Idéal lors des changements de saison et périodes de fatigue.",
    price: 19.90,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80",
    badge: "Populaire",
    rating: 4.85,
    category_id: "cat-1-immunite",
    stock: 35,
    active: true,
    featured: true,
    benefits: [
      "Stimule les défenses immunitaires naturelles",
      "Protection cellulaire antioxydante majeure",
      "Réduit la fatigue et les coups de pompe",
      "Riche en zinc, fer et vitamines A, C, E"
    ],
    ingredients: ["Poudre de Moringa oleifera pure", "Extrait sec de Curcuma longa", "Gingembre officinal", "Poivre noir de Penja"],
    usage_instructions: "Prendre 1 cuillère rase chaque matin mélangée dans un jus de fruits, un smoothie ou une boisson tiède avec un peu de miel.",
    contraindications: "Femmes enceintes ou personnes sous anticoagulants : consulter un praticien de santé.",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-3-ashwagandha-serenite",
    slug: "complexe-anti-stress-ashwagandha",
    name: "Complexe Anti-Stress & Sérénité",
    short_description: "Plantes adaptogènes pour réguler le cortisol, l'anxiété et la charge mentale quotidienne.",
    description: "Ce complexe adaptogène premium combine l'Ashwagandha KSM-66 à la Rhodiola rosea et au basilic sacré (Tulsi). Il aide votre organisme à s'adapter physiologiquement et émotionnellement face aux situations de surmenage, améliore la clarté d'esprit et protège le système nerveux.",
    price: 24.90,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
    badge: "Recommandé",
    rating: 4.95,
    category_id: "cat-2-stress",
    stock: 28,
    active: true,
    featured: true,
    benefits: [
      "Régule la sécrétion d'hormones de stress (cortisol)",
      "Apaise l'anxiété sans provoquer de somnolence",
      "Améliore la concentration et la résistance cognitive",
      "Favorise une humeur stable et positive"
    ],
    ingredients: ["Racine d'Ashwagandha (Withania somnifera)", "Extrait de Rhodiola Rosea", "Tulsi (Basilic sacré)", "Gélules végétales en pullulane"],
    usage_instructions: "2 gélules par jour le matin avec un grand verre d'eau. Cure conseillée de 30 à 60 jours.",
    contraindications: "Déconseillé en cas d'hyperthyroïdie sévère sans avis médical.",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-4-elixir-digestion",
    slug: "elixir-digestion-facile-artichaut",
    name: "Élixir Digestion Facile",
    short_description: "Synergie de menthe poivrée, fenouil doux et artichaut pour un ventre plat et léger.",
    description: "Une infusion aromatique digestive d'une grande efficacité. Les graines de fenouil et l'anis vert absorbent les gaz et apaisent les crampes d'estomac, tandis que l'artichaut et le romarin stimulent en douceur la fonction hépatique et biliaire.",
    price: 15.50,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80",
    badge: "Bio",
    rating: 4.75,
    category_id: "cat-4-digestion",
    stock: 50,
    active: true,
    featured: true,
    benefits: [
      "Soulage immédiatement les lourdeurs après repas",
      "Combat les ballonnements et gonflements intestinaux",
      "Favorise l'élimination des toxines hépatiques",
      "Saveur rafraîchissante et naturellement douce"
    ],
    ingredients: ["Feuilles de Menthe poivrée", "Graines de Fenouil doux", "Artichaut feuille", "Anis vert", "Romarin officinal"],
    usage_instructions: "Prendre une tasse après chaque repas copieux ou en fin de journée. Infuser 5 à 7 minutes.",
    contraindications: "Aucune aux doses recommandées.",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-5-energie-spiruline",
    slug: "dynamisme-vitalite-spiruline-ginseng",
    name: "Dynamisme & Vitalité (Spiruline & Ginseng)",
    short_description: "Concentré pur d'énergie naturelle : spiruline artisanale, ginseng rouge et maca.",
    description: "Formule coup de fouet saine et durable. Contrairement aux excitants artificiels à base de caféine de synthèse, notre synergie nourrit les glandes surrénales et apporte des acides aminés essentiels, du fer bio-disponible et des ginsénosides pour une endurance physique et mentale sans à-coups.",
    price: 22.90,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80",
    badge: "Nouveau",
    rating: 4.9,
    category_id: "cat-5-energie",
    stock: 24,
    active: true,
    featured: true,
    benefits: [
      "Énergie constante tout au long de la journée",
      "Oxygénation des tissus et récupération sportive",
      "Renforce la mémoire et la concentration",
      "Riche en chlorophylle et en phycocyanine détoxifiante"
    ],
    ingredients: ["Spiruline pure séchée à basse température", "Ginseng rouge coréen 6 ans d'âge", "Maca du Pérou", "Acérola bio"],
    usage_instructions: "2 comprimés le matin et 1 le midi au cours du repas.",
    contraindications: "Éviter la prise le soir après 17h.",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-6-huile-nigelle",
    slug: "huile-nigelle-pure-habba-sawda",
    name: "Huile de Nigelle Pure Première Pression",
    short_description: "L'or noir d'Égypte aux graines de cumin noir (Habba Sawda), 100% pure et pressée à froid.",
    description: "Reconnue depuis des millénaires dans toutes les médecines traditionnelles, notre huile de nigelle vierge est extraite à froid sans aucun traitement chimique. Riche en thymoquinone, oméga-6 et huiles essentielles actives, elle fortifie l'immunité et embellit la peau et les cheveux.",
    price: 18.50,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80",
    badge: "Pur & Brut",
    rating: 4.98,
    category_id: "cat-1-immunite",
    stock: 30,
    active: true,
    featured: false,
    benefits: [
      "Action anti-inflammatoire et antiallergique réputée",
      "Purifie les peaux à imperfections et renforce les cheveux",
      "Soutient les voies respiratoires et le système ORL",
      "Teneur garantie en thymoquinone supérieure à 1.5%"
    ],
    ingredients: ["100% Huile de graines de Nigella sativa première pression à froid"],
    usage_instructions: "Usage interne : 1 cuillère à café le matin à jeun. Usage externe : quelques gouttes en massage sur le visage, le cuir chevelu ou les zones sensibles.",
    contraindications: "Déconseillé aux femmes enceintes en usage interne.",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-7-baobab-poudre",
    slug: "poudre-fruit-baobab-bio-pain-de-singe",
    name: "Superfood Pulpe de Baobab Bio",
    short_description: "Trésor d'Afrique 6 fois plus riche en vitamine C que l'orange et exceptionnellement riche en calcium.",
    description: "Récolté de manière éthique et durable dans les savanes préservées, le fruit du baobab sèche naturellement sur l'arbre avant d'être moulu. Avec son goût acidulé et fruité incomparable, il apporte un apport micronutritionnel prodigieux pour toute la famille.",
    price: 12.90,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80",
    badge: "Super-Aliment",
    rating: 4.8,
    category_id: "cat-5-energie",
    stock: 60,
    active: true,
    featured: false,
    benefits: [
      "Concentration record en vitamine C naturelle",
      "Effet prébiotique stimulant le microbiote intestinal",
      "Antioxydant puissant et revitalisant cellulaire",
      "Convient aux enfants, femmes enceintes et sportifs"
    ],
    ingredients: ["100% Poudre de pulpe de fruit de Baobab (Adansonia digitata) biologique"],
    usage_instructions: "Diluer 1 à 2 cuillères à café dans un yaourt, une bouillie, de l'eau fraîche ou un smoothie.",
    contraindications: "Aucune.",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-8-baume-apaisant",
    slug: "baume-apaisant-musculaire-plantes",
    name: "Baume Apaisant Musculaire & Articulaire",
    short_description: "Onguent chauffant aux huiles essentielles de gaulthérie, eucalyptus citronné et menthol naturel.",
    description: "Ce baume artisanal formulé sur une base de beurre de karité brut sauvage et d'huile de sésame soulage rapidement les courbatures, contractures du dos et raideurs articulaires. Son parfum vivifiant dégage également les voies respiratoires.",
    price: 16.50,
    currency: "EUR",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
    badge: "Soulagement",
    rating: 4.88,
    category_id: "cat-2-stress",
    stock: 36,
    active: true,
    featured: false,
    benefits: [
      "Détente musculaire immédiate grâce à la chaleur naturelle",
      "Idéal après le sport ou pour dénouer les tensions de la nuque",
      "Base protectrice 100% beurre de karité pur non raffiné",
      "Pénètre sans laisser de film gras"
    ],
    ingredients: ["Beurre de Karité brut", "Huile de Gaulthérie couchée", "Eucalyptus citronné", "Menthol cristallisé", "Cire d'abeille bio"],
    usage_instructions: "Chauffer une noisette dans la paume des mains et masser vigoureusement la zone douloureuse pendant 3 à 5 minutes.",
    contraindications: "Usage externe uniquement. Éviter le contact avec les yeux et les muqueuses.",
    created_at: new Date().toISOString(),
  }
];

export const SEED_PROMOS: PromoCode[] = [
  {
    id: "promo-1",
    code: "BIENVENUE10",
    discount_percent: 10,
    active: true,
    uses_count: 14,
    min_order_amount: 30,
    created_at: new Date().toISOString(),
  },
  {
    id: "promo-2",
    code: "AURA2025",
    discount_percent: 15,
    active: true,
    uses_count: 8,
    min_order_amount: 50,
    created_at: new Date().toISOString(),
  },
  {
    id: "promo-3",
    code: "SANTE20",
    discount_percent: 20,
    active: true,
    uses_count: 3,
    min_order_amount: 75,
    created_at: new Date().toISOString(),
  }
];
