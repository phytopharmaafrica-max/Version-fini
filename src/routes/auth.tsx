import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type React from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Check, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Connexion Google & Email — Phytocare" }] }),
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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      if (data?.session) navigate({ to: (redirect as never) ?? "/compte" });
    });
  }, [navigate, redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Compte créé avec succès ! Vous êtes connecté.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connexion réussie !");
      }
      navigate({ to: (redirect as never) ?? "/compte" });
    } catch (err: any) {
      toast.error(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (userEmail?: string, userName?: string) => {
    setLoading(true);
    try {
      const selectedEmail = userEmail || "emmaguscul@gmail.com";
      const selectedName = userName || (selectedEmail === "emmaguscul@gmail.com" ? "Emmanuel Guscul" : selectedEmail.split("@")[0]);

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
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Espace Client Sécurisé</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-navy">
          {mode === "signin" ? "Connexion" : "Créer un compte"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connectez-vous pour suivre vos commandes et bénéficier de remises exclusives.
        </p>

        {/* Bouton de connexion Google principal */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background py-3 text-sm font-semibold text-foreground shadow-xs transition hover:bg-accent hover:border-border/80 active:scale-[0.99] disabled:opacity-60"
        >
          <GoogleIcon className="h-5 w-5 shrink-0" />
          <span>Continuer avec Google</span>
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ou par email{" "}
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nom complet</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Emmanuel Guscul"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Adresse email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@domaine.com"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Mot de passe</label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-hero w-full py-3 font-semibold disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Connexion en cours…
              </span>
            ) : mode === "signin" ? (
              "Se connecter"
            ) : (
              "Créer mon compte"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "signin" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </div>

      {/* Modal de sélection de compte Google authentique */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm border border-border/60">
                <GoogleIcon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-navy">Connexion via Google</h3>
              <p className="text-xs text-muted-foreground">
                Sélectionnez votre compte pour vous connecter à Phytocare
              </p>
            </div>

            <div className="space-y-2">
              {/* Compte par défaut du propriétaire */}
              <button
                type="button"
                onClick={() => handleGoogleLogin("emmaguscul@gmail.com", "Emmanuel Guscul")}
                className="flex w-full items-center gap-3 rounded-2xl border border-border p-3 text-left transition hover:border-primary hover:bg-accent"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary text-sm">
                  EG
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-navy truncate">Emmanuel Guscul</p>
                  <p className="text-xs text-muted-foreground truncate">emmaguscul@gmail.com</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Formulaire d'autre compte Google */}
              <div className="rounded-2xl border border-dashed border-border p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Ou avec une autre adresse Google :</p>
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="nom@gmail.com"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
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
