import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Stethoscope,
  ShoppingBag,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Check,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { getDorineConsultation, type DorineRecommendation } from "@/lib/dorine-consultant";
import { cart, formatPrice } from "@/lib/cart";
import type { Product } from "@/data/phytocare-seed";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "dorine" | "user";
  text: string;
  recommendation?: DorineRecommendation;
}

const QUICK_SUGGESTIONS = [
  "J'ai du mal à dormir la nuit",
  "Je me sens stressé(e) et sous tension",
  "Ventre gonflé et digestion difficile",
  "Renforcer mon immunité",
  "Bienfaits de l'Huile de Nigelle",
  "Fatigue et manque d'énergie",
];

export function DorineAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "dorine",
      text:
        "Bonjour ! Je suis Dorine, votre herboriste et conseillère bien-être Phytocare. Décrivez-moi ce que vous ressentez (sommeil agité, stress, fatigue, digestion difficile, baisse d'immunité…) ou posez-moi vos questions sur nos plantes médicinales.",
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  // Initialisation reconnaissance vocale
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = "fr-FR";
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(transcript);
            setVoiceActive(false);
            send(transcript);
          }
        };

        recognition.onerror = () => {
          setVoiceActive(false);
        };

        recognition.onend = () => {
          setVoiceActive(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      toast.info("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }
    if (voiceActive) {
      recognitionRef.current.stop();
      setVoiceActive(false);
    } else {
      try {
        recognitionRef.current.start();
        setVoiceActive(true);
        toast.info("Je vous écoute… Parlez clairement.");
      } catch (e) {
        console.error(e);
        setVoiceActive(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");

    const userMsgId = "user-" + Date.now();
    setMessages((m) => [...m, { id: userMsgId, role: "user", text: q }]);
    setLoading(true);

    try {
      const rec = await getDorineConsultation(q);
      const dorineMsgId = "dorine-" + Date.now();
      setMessages((m) => [
        ...m,
        {
          id: dorineMsgId,
          role: "dorine",
          text: rec.text,
          recommendation: rec,
        },
      ]);
      speakText(rec.text);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        {
          id: "err-" + Date.now(),
          role: "dorine",
          text: "Je suis à votre écoute. Pouvez-vous me reformuler vos symptômes ou la plante que vous recherchez ?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = (product: Product) => {
    cart.add({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image_url: product.image_url,
    });
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    toast.success(`${product.name} ajouté au panier !`);
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2500);
  };

  const resetChat = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([
      {
        id: "welcome",
        role: "dorine",
        text:
          "Bonjour ! Je suis Dorine, votre herboriste et conseillère bien-être Phytocare. Décrivez-moi ce que vous ressentez ou posez-moi vos questions.",
      },
    ]);
  };

  return (
    <>
      {/* Bouton d'ouverture flottant */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-[calc(1rem+env(safe-area-inset-left,0px))] sm:left-5 z-40 inline-flex min-h-[44px] items-center gap-2.5 rounded-full bg-primary px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-primary-foreground shadow-[0_10px_25px_-5px_rgba(26,95,62,0.4)] transition hover:scale-105 active:scale-95 touch-manipulation"
        aria-label="Conseillère Dorine"
      >
        <span className="relative grid h-7 w-7 place-items-center rounded-full bg-white/20">
          <Stethoscope className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-300 ring-2 ring-primary animate-pulse" />
        </span>
        <span className="hidden sm:inline">Consulter Dorine (IA)</span>
        <span className="sm:hidden font-bold">Dorine IA</span>
      </button>

      {/* Fenêtre de consultation */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-start bg-black/40 p-0 backdrop-blur-xs sm:items-end sm:p-5">
          <div className="absolute inset-0" onClick={() => setOpen(false)} aria-hidden />

          <div className="relative flex h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl sm:h-[680px] sm:max-w-md sm:rounded-3xl animate-in fade-in slide-in-from-bottom-6 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-mint/50 px-4 py-3">
              <div className="relative grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <Stethoscope className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-card" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-display text-base font-bold text-navy">Dorine</p>
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Herboriste IA
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  Conseillère phytothérapie & santé naturelle
                </p>
              </div>

              {/* Contrôles d'en-tête */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSoundEnabled((v) => !v)}
                  className={`grid h-8 w-8 place-items-center rounded-full transition ${
                    soundEnabled ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                  }`}
                  title={soundEnabled ? "Désactiver la voix" : "Activer la voix"}
                  aria-label="Vocal"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={resetChat}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent"
                  title="Nouvelle consultation"
                  aria-label="Réinitialiser"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Corps des messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((m) => {
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                        {m.text}
                      </div>
                    </div>
                  );
                }

                // Message Dorine
                const rec = m.recommendation;
                return (
                  <div key={m.id} className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="max-w-[88%] space-y-2 rounded-2xl rounded-tl-sm bg-accent/70 p-3.5 text-sm text-foreground">
                        <p className="leading-relaxed">{m.text}</p>

                        {/* Conseils pratiques & posologie */}
                        {rec?.tips && rec.tips.length > 0 && (
                          <div className="mt-2.5 rounded-xl border border-border/80 bg-background/80 p-2.5 text-xs text-muted-foreground space-y-1.5">
                            <p className="font-semibold text-navy flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              Conseils d'utilisation & rituels :
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                              {rec.tips.map((t, idx) => (
                                <li key={idx}>{t}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Avertissement bienveillant */}
                        {rec?.disclaimer && (
                          <div className="mt-1 flex items-start gap-1.5 text-[11px] text-muted-foreground/80 italic">
                            <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" />
                            <span>{rec.disclaimer}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Produits recommandés intégrés */}
                    {rec?.products && rec.products.length > 0 && (
                      <div className="pl-10 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Remèdes recommandés ({rec.products.length})
                        </p>
                        <div className="space-y-2">
                          {rec.products.map((p) => {
                            const isAdded = addedIds[p.id];
                            return (
                              <div
                                key={p.id}
                                className="flex items-center gap-3 rounded-xl border border-border bg-background p-2.5 shadow-xs transition hover:border-primary/50"
                              >
                                <Link
                                  to="/product/$slug"
                                  params={{ slug: p.slug }}
                                  onClick={() => setOpen(false)}
                                  className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-mint"
                                >
                                  {p.image_url && (
                                    <img
                                      src={p.image_url}
                                      alt={p.name}
                                      className="h-full w-full object-cover transition hover:scale-105"
                                    />
                                  )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                  <Link
                                    to="/product/$slug"
                                    params={{ slug: p.slug }}
                                    onClick={() => setOpen(false)}
                                    className="block font-display text-sm font-semibold text-navy truncate hover:text-primary"
                                  >
                                    {p.name}
                                  </Link>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {p.short_description}
                                  </p>
                                  <div className="mt-1 flex items-center justify-between">
                                    <span className="font-bold text-sm text-navy">
                                      {formatPrice(p.price, p.currency)}
                                    </span>
                                    <button
                                      onClick={() => handleAddToCart(p)}
                                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                                        isAdded
                                          ? "bg-emerald-600 text-white"
                                          : "bg-primary text-primary-foreground hover:brightness-110 active:scale-95"
                                      }`}
                                    >
                                      {isAdded ? (
                                        <>
                                          <Check className="h-3 w-3" /> Ajouté
                                        </>
                                      ) : (
                                        <>
                                          <ShoppingBag className="h-3 w-3" /> Au panier
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 pl-10 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Dorine étudie votre situation et formule son conseil…</span>
                </div>
              )}
            </div>

            {/* Suggestions de questions rapides */}
            <div className="border-t border-border bg-background/50 px-3 py-2">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="whitespace-nowrap shrink-0 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-accent hover:border-primary/40 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Barre de saisie */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border bg-card p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-3"
            >
              <button
                type="button"
                onClick={toggleVoice}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${
                  voiceActive
                    ? "border-red-500 bg-red-50 text-red-600 animate-pulse"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                title={voiceActive ? "Arrêter d'écouter" : "Parler à Dorine au micro"}
                aria-label="Microphone"
              >
                {voiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={voiceActive ? "Parlez maintenant…" : "Décrivez vos besoins ou symptômes…"}
                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110 active:scale-95 disabled:opacity-40"
                aria-label="Envoyer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
