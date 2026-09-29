import React, { useState } from "react";
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from "lucide-react";
import { usePWAInstall } from "@/lib/usePWAInstall";

interface PWAInstallButtonProps {
  variant?: "header" | "drawer" | "footer";
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = "drawer" }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed or running as standalone web app, hide
  if (isInstalled) {
    return null;
  }

  // If not installable and not iOS (e.g. standard browser that doesn't support or has already prompted),
  // on drawer or footer we can still provide a helpful badge or guidance
  if (!isInstallable && !isIOS && variant === "header") {
    return null;
  }

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General prompt for desktop or unsupported browsers
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === "header" && (
        <button
          type="button"
          onClick={handleClick}
          className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all touch-manipulation"
          title="Installer l'application sur votre appareil"
          aria-label="Installer l'application"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Installer l'App</span>
        </button>
      )}

      {variant === "drawer" && (
        <div className="rounded-xl border border-border bg-slate-50 dark:bg-slate-900/60 p-3 my-1">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">Application Mobile Phytocare</p>
              <p className="text-[11px] text-muted-foreground truncate">
                Accès instantané sur Android & iPhone
              </p>
            </div>
            <button
              type="button"
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:brightness-110 active:scale-95 transition touch-manipulation"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Installer</span>
            </button>
          </div>
        </div>
      )}

      {variant === "footer" && (
        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-accent transition touch-manipulation"
        >
          <Smartphone className="h-4 w-4 text-primary" />
          <span>Installer sur smartphone (PWA)</span>
        </button>
      )}

      {/* Guide d'installation iOS Safari / autres navigateurs */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
                  <Smartphone className="h-4 w-4" />
                </div>
                <h3 className="font-display font-bold text-foreground text-sm sm:text-base">
                  Installer sur votre écran
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Pour accéder à l'application comme une application native depuis votre smartphone ou tablette :
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl bg-accent/40 p-3 text-xs">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/20 text-primary font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    Appuyez sur <Share className="h-3.5 w-3.5 text-primary inline" /> Partager
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Dans la barre de navigation Safari (en bas sur iPhone ou en haut sur iPad).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-accent/40 p-3 text-xs">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/20 text-primary font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    Sélectionnez <PlusSquare className="h-3.5 w-3.5 text-primary inline" /> "Sur l'écran d'accueil"
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Faites défiler le menu vers le bas pour trouver l'option.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <p className="text-[11px]">
                  L'icône Phytocare s'installera directement sur votre écran avec chargement ultra-rapide et utilisation plein écran.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-full bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition active:scale-98"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
