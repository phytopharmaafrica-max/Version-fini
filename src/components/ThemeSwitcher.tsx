import { useState, useRef, useEffect } from "react";
import { Palette, Check, Sparkles, Globe, DollarSign, ChevronDown } from "lucide-react";
import { useTheme, type ThemeId, PRESET_THEMES } from "@/lib/theme";
import { useCurrency, type CurrencyCode } from "@/lib/currency";
import { useI18n, type LanguageCode } from "@/lib/i18n";

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentConfig = PRESET_THEMES[theme];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-border bg-white dark:bg-slate-900 px-2 sm:px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-colors hover:border-primary hover:bg-accent touch-manipulation"
        title="Changer le thème visuel"
        aria-label="Changer le thème"
      >
        <span
          className="h-3 w-3 rounded-full border border-border/80 shadow-xs shrink-0"
          style={{ backgroundColor: currentConfig?.preview.primary || "#145A32" }}
        />
        <Palette className="h-3.5 w-3.5 text-foreground shrink-0" />
        <span className="hidden md:inline text-[11px] font-bold">{currentConfig?.name.split(" ")[0]}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-white dark:bg-slate-900 p-2.5 shadow-2xl z-50">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-foreground border-b border-border flex items-center justify-between">
            <span>Thèmes & Couleurs</span>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="mt-2 space-y-1">
            {themes.map((t) => {
              const active = t.id === theme;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-all ${
                    active
                      ? "bg-primary/15 text-primary font-bold border border-primary/30"
                      : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1 shrink-0">
                      <span
                        className="h-4 w-4 rounded-full border border-white dark:border-slate-800 shadow-xs"
                        style={{ backgroundColor: t.preview.primary }}
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-white dark:border-slate-800 shadow-xs"
                        style={{ backgroundColor: t.preview.accent }}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-xs leading-none text-foreground">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{t.subtitle}</div>
                    </div>
                  </div>
                  {active && <Check className="h-4 w-4 text-primary shrink-0 ml-2 font-bold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function LanguageSwitcher() {
  const { lang, setLang, languages, currentLanguageInfo } = useI18n();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-border bg-white dark:bg-slate-900 px-2 sm:px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-colors hover:border-primary hover:bg-accent touch-manipulation"
        title="Changer de langue"
        aria-label="Changer de langue"
      >
        <span className="text-sm leading-none shrink-0">{currentLanguageInfo.flag}</span>
        <span className="text-[11px] font-bold uppercase">{currentLanguageInfo.code}</span>
        <ChevronDown className="h-3 w-3 text-foreground opacity-70 shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-white dark:bg-slate-900 p-2 shadow-2xl z-50">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground border-b border-border">
            Langue / Language
          </div>
          <div className="mt-1.5 space-y-0.5">
            {languages.map((l) => {
              const active = l.code === lang;
              return (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all ${
                    active
                      ? "bg-primary/15 text-primary font-bold border border-primary/30"
                      : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{l.flag}</span>
                    <span className="text-xs font-semibold">{l.name}</span>
                  </div>
                  {active && <Check className="h-3.5 w-3.5 text-primary shrink-0 font-bold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function CurrencySwitcher() {
  const { currency, setCurrency, currencies, config } = useCurrency();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-border bg-white dark:bg-slate-900 px-2 sm:px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-colors hover:border-primary hover:bg-accent touch-manipulation"
        title="Changer la devise"
        aria-label="Changer la devise"
      >
        <span className="font-bold text-primary shrink-0">{config.symbol}</span>
        <span className="text-[11px] font-bold">{currency}</span>
        <ChevronDown className="h-3 w-3 text-foreground opacity-70 shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-white dark:bg-slate-900 p-2 shadow-2xl z-50">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground border-b border-border">
            Devise / Currency
          </div>
          <div className="mt-1.5 space-y-0.5">
            {currencies.map((c) => {
              const active = c.code === currency;
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all ${
                    active
                      ? "bg-primary/15 text-primary font-bold border border-primary/30"
                      : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.flag}</span>
                    <span className="text-xs font-semibold">
                      {c.code} ({c.symbol})
                    </span>
                  </div>
                  {active && <Check className="h-3.5 w-3.5 text-primary shrink-0 font-bold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
