import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy-initialisation du client Gemini côté serveur
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({ apiKey });
    }
  }
  return aiClient;
}

// Health check endpoint pour Cloud Run et monitoring
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "Aura Wellness AI — Phytocare",
    version: "1.0.0",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint IA : Auto-description intelligente de produit phytothérapeutique
app.post("/api/ai/describe-product", async (req, res) => {
  const { name, categoryId, imageBase64 } = req.body || {};
  const ai = getGeminiClient();

  if (!ai) {
    // Si pas de clé, le client utilisera le moteur local instantané
    res.json({ success: false, fallback: true });
    return;
  }

  try {
    const prompt = `Tu es un expert herboriste et formulateur phytothérapeutique de luxe pour Phytocare.
Génère une fiche descriptive commerciale et scientifique complète et prestigieuse pour ce remède végétal :
- Nom ou indice : ${name || "Remède naturel"}
- Catégorie : ${categoryId || "Bien-être"}
${imageBase64 ? "- Note: Une photo de produit a été fournie." : ""}

Réponds STRICTEMENT au format JSON valide suivant, sans markdown autour :
{
  "name": "Nom soigné et valorisant du produit",
  "badge": "Label d'excellence court (ex: Certifié Biologique, Récolte Sauvage, 100% Pur)",
  "short_description": "Phrase d'accroche percutante et élégante (max 150 caractères)",
  "description": "Description détaillée de 2 à 3 paragraphes abordant les origines botaniques, la pureté des actifs, les bienfaits physiologiques et la démarche d'excellence.",
  "benefits": ["Bienfait 1", "Bienfait 2", "Bienfait 3", "Bienfait 4"],
  "ingredients": ["Plante 1 (nom latin)", "Plante 2 (nom latin)", "Extrait végétal purifié"],
  "usage": "Posologie précise, moment idéal de prise et durée de cure conseillée."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const text = response.text || "{}";
    const product = JSON.parse(text);
    res.json({ success: true, product });
  } catch (err: any) {
    console.error("[Describe Product Error]", err);
    res.json({ success: false, fallback: true, error: err?.message || String(err) });
  }
});

// Endpoint IA Dorine
app.post("/api/dorine/chat", async (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== "string") {
    res.status(400).json({ success: false, error: "Message requis" });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Si pas de clé, fallback instantané sur le moteur local
    res.json({ success: false, fallback: true });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: message,
      config: {
        systemInstruction:
          "Tu es Dorine, herboriste et naturopathe diplômée, conseillère bien-être officielle de Phytocare (Aura Wellness AI). Tu réponds avec chaleur, bienveillance, clarté et rigueur scientifique en français. Tu donnes des conseils concrets en phytothérapie, plantes médicinales, infusions, posologies et hygiène de vie. Tu rappelles avec bienveillance que tes conseils complètent mais ne remplacent pas un avis médical. Si la question concerne un symptôme présent dans la boutique (sommeil, stress, digestion, immunité, énergie, nigelle, moringa, spiruline), tu orientes avec précision vers les remèdes végétaux adaptés.",
        temperature: 0.7,
      },
    });

    const reply = response.text || "";
    res.json({ success: true, reply });
  } catch (error: any) {
    console.error("[Dorine Gemini Error]", error);
    res.json({ success: false, fallback: true, error: error?.message || String(error) });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aura Wellness AI] Serveur démarré sur http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Erreur démarrage serveur :", err);
});
