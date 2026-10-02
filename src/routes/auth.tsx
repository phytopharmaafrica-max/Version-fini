import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type React from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import {
  Check,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Mail,
  KeyRound,
  RotateCcw,
  Sparkles,
  Inbox,
  Copy,
} from "lucide-react";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Connexion & Vérification E-mail — Phytocare" }] }),
  component: AuthPage,
});

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "verify">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [lastDispatchedCode, setLastDispatchedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      if (data?.session) navigate({ to: (redirect as never) ?? "/compte" });
    });
  }, [navigate, redirect]);

  // Écouter les événements d'envoi d'e-mail pour afficher l'alerte en direct
  useEffect(() => {
    const handleEmailEvent = (e: any) => {
      const detail = e.detail;
      if (detail?.code) {
        setLastDispatchedCode(detail.code);
        toast.info(`📨 E-mail envoyé à ${detail.to}`, {
          description: `Code de confirmation reçu : ${detail.code}`,
          duration: 10000,
        });
      }
    };
    window.addEventListener("phytocare:email-sent", handleEmailEvent);
    return () => window.removeEventListener("phytocare:email-sent", handleEmailEvent);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        if (password.length < 6) {
          toast.error("Le mot de passe doit comporter au moins 6 caractères.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Les deux mots de passe ne correspondent pas.");
          setLoading(false);
          return;
        }

        const res = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });

        if (res.error) throw res.error;

        if (res.data?.needsVerification) {
          setLastDispatchedCode(res.data.code);
          setMode("verify");
          toast.success("Un code de vérification à 6 chiffres a été envoyé à votre adresse e-mail !");
        } else {
          toast.success("Compte créé avec succès !");
          navigate({ to: (redirect as never) ?? "/compte" });
        }
      } else if (mode === "signin") {
        const res = await supabase.auth.signInWithPassword({ email, password });

        if (res.error) {
          if (res.error.message === "EMAIL_NOT_VERIFIED") {
            setLastDispatchedCode((res.error as any).code || null);
            setMode("verify");
            toast.warning("Votre adresse e-mail n'a pas encore été validée. Un code de sécurité vous a été envoyé.");
            return;
          }
          throw res.error;
        }

        toast.success("Connexion réussie !");
        navigate({ to: (redirect as never) ?? "/compte" });
      } else if (mode === "verify") {
        if (!verificationCode || verificationCode.trim().length !== 6) {
          toast.error("Veuillez saisir le code complet à 6 chiffres.");
          setLoading(false);
          return;
        }

        const res = await supabase.auth.verifyOtp({
          email,
          token: verificationCode.trim(),
          type: "signup",
        });

        if (res.error) throw res.error;

        toast.success("Adresse e-mail vérifiée avec succès ! Bienvenue sur Phytocare.");
        navigate({ to: (redirect as never) ?? "/compte" });
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'authentification.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Veuillez renseigner votre adresse e-mail.");
      return;
    }
    setLoading(true);
    try {
      const res = await supabase.auth.resendVerificationCode(email);
      if (res.error) throw res.error;
      setLastDispatchedCode(res.data?.code || null);
      toast.success(`Nouveau code de vérification envoyé à ${email} !`);
    } catch (err: any) {
      toast.error(err.message || "Impossible de renvoyer le code.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (userEmail?: string, userName?: string) => {
    setLoading(true);
    try {
      const selectedEmail = userEmail || "emmaguscul@gmail.com";
      const selectedName =
        userName ||
        (selectedEmail === "emmaguscul@gmail.com" ? "Emmanuel Guscul" : selectedEmail.split("@")[0]);

      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        email: selectedEmail,
        name: selectedName,
      });

      if (result.error) {
        toast.error("Impossible de finaliser la connexion Google.");
        setLoading(false);
        return;
      }

      toast.success(`Connecté avec Google en tant que ${selectedName} !`);
      setShowGoogleModal(false);
      navigate({ to: (redirect as never) ?? "/compte" });
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue lors de la connexion Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)] space-y-6">
        {/* Header Icon & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Espace Client Sécurisé — Phytocare</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-navy dark:text-slate-100">
            {mode === "signin" && "Connexion à votre compte"}
            {mode === "signup" && "Créer un compte certifié"}
            {mode === "verify" && "Vérification de l'e-mail"}
          </h1>

          <p className="text-sm text-muted-foreground">
            {mode === "signin" && "Accédez à vos commandes, vos conseils personnalisés et vos remèdes."}
            {mode === "signup" && "Chaque compte est protégé par son mot de passe et une validation d'e-mail."}
            {mode === "verify" && (
              <>
                Saisissez le code de sécurité envoyé à{" "}
                <strong className="text-foreground">{email}</strong>.
              </>
            )}
          </p>
        </div>

        {/* MODE: VÉRIFICATION D'EMAIL (OTP) */}
        {mode === "verify" && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Boîte de réception simulée en direct */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-primary">
                <span className="flex items-center gap-1.5">
                  <Inbox className="h-4 w-4" /> Message de confirmation reçu
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px]">Instantané</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Le message a été expédié à <strong>{email}</strong> avec votre code unique de validation.
              </p>
              {lastDispatchedCode && (
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-primary/15">
                  <span className="text-xs font-mono font-bold text-navy dark:text-emerald-300">
                    Code reçu : <span className="text-base tracking-wider text-primary">{lastDispatchedCode}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationCode(lastDispatchedCode);
                      toast.success("Code inséré automatiquement !");
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-primary/20"
                  >
                    <Copy className="h-3 w-3" /> Insérer
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 text-center">
                Code à 6 chiffres reçu par e-mail
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full text-center font-mono text-3xl tracking-[0.4em] font-extrabold rounded-2xl border-2 border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="btn-hero w-full py-3.5 font-bold disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Vérification en cours…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Valider mon adresse e-mail
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Renvoyer un code
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                Modifier l'adresse
              </button>
            </div>
          </form>
        )}

        {/* MODES: CONNEXION OU INSCRIPTION */}
        {mode !== "verify" && (
          <>
            {/* Bouton Google */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background py-3 text-sm font-semibold text-foreground shadow-xs transition hover:bg-accent hover:border-border/80 active:scale-[0.99] disabled:opacity-60"
            >
              <GoogleIcon className="h-5 w-5 shrink-0" />
              <span>Continuer avec Google</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> ou par e-mail et mot de passe{" "}
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Nom & Prénom complets *
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Emmanuel Guscul"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Adresse e-mail *
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@domaine.com"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Mot de passe *
                  </label>
                  {mode === "signin" && (
                    <span className="text-[11px] text-muted-foreground">
                      Vérifié individuellement
                    </span>
                  )}
                </div>
                <input
                  required
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground"
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez votre mot de passe"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-hero w-full py-3.5 font-bold disabled:opacity-60 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Traitement en cours…
                  </>
                ) : mode === "signin" ? (
                  <>
                    <KeyRound className="h-4 w-4" /> Se connecter
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" /> Créer mon compte & Recevoir le code
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
              {mode === "signin" ? "Pas encore de compte client ?" : "Vous avez déjà un compte ?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-bold text-primary hover:underline ml-1"
              >
                {mode === "signin" ? "Créer un compte" : "Se connecter"}
              </button>
            </p>
          </>
        )}
      </div>

      {/* Modal de sélection Google */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm border border-border/60">
                <GoogleIcon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-navy dark:text-slate-100">
                Connexion via Google
              </h3>
              <p className="text-xs text-muted-foreground">
                Sélectionnez votre compte pour vous connecter à Phytocare
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleGoogleLogin("emmaguscul@gmail.com", "Emmanuel Guscul")}
                className="flex w-full items-center gap-3 rounded-2xl border border-border p-3 text-left transition hover:border-primary hover:bg-accent"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary text-sm">
                  EG
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-navy dark:text-slate-100 truncate">
                    Emmanuel Guscul
                  </p>
                  <p className="text-xs text-muted-foreground truncate">emmaguscul@gmail.com</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="rounded-2xl border border-dashed border-border p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Ou avec une autre adresse Google :
                </p>
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="nom@gmail.com"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary text-foreground"
                />
                <button
                  type="button"
                  disabled={!customGoogleEmail.includes("@") || loading}
                  onClick={() => handleGoogleLogin(customGoogleEmail)}
                  className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
                >
                  Continuer avec cette adresse
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
