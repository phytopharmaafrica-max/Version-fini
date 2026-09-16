// Ultra-Premium Theme Manager for Phytocare
import { useEffect, useSyncExternalStore } from "react";

export type ThemeId = "emerald" | "gold" | "sapphire" | "rose" | "midnight";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  isDark: boolean;
  preview: {
    primary: string;
    bg: string;
    accent: string;
    border: string;
  };
  cssVariables: Record<string, string>;
}

export const PRESET_THEMES: Record<ThemeId, ThemeDefinition> = {
  emerald: {
    id: "emerald",
    name: "Émeraude Royale",
    subtitle: "Herboristerie de prestige & fraîcheur végétale",
    isDark: false,
    preview: {
      primary: "#145A32",
      bg: "#FBFBEE",
      accent: "#D4EFDF",
      border: "#D5D8DC",
    },
    cssVariables: {
      "--background": "45 25% 98%",
      "--foreground": "220 20% 16%",
      "--card": "0 0% 100%",
      "--card-foreground": "220 20% 16%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "220 20% 16%",
      "--primary": "156 72% 28%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "45 20% 93%",
      "--secondary-foreground": "156 72% 20%",
      "--muted": "45 15% 94%",
      "--muted-foreground": "220 10% 46%",
      "--accent": "156 35% 94%",
      "--accent-foreground": "156 72% 20%",
      "--border": "45 15% 88%",
      "--input": "45 15% 88%",
      "--ring": "156 72% 28%",
    },
  },

  gold: {
    id: "gold",
    name: "Or Impérial & Ébène",
    subtitle: "Luxe intemporel, ambre doré & haute joaillerie",
    isDark: false,
    preview: {
      primary: "#B78103",
      bg: "#FAF8F5",
      accent: "#F9E79F",
      border: "#E0D7C6",
    },
    cssVariables: {
      "--background": "38 28% 97%",
      "--foreground": "28 35% 14%",
      "--card": "0 0% 100%",
      "--card-foreground": "28 35% 14%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "28 35% 14%",
      "--primary": "43 85% 37%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "38 25% 92%",
      "--secondary-foreground": "43 85% 25%",
      "--muted": "38 20% 93%",
      "--muted-foreground": "28 15% 45%",
      "--accent": "43 45% 92%",
      "--accent-foreground": "43 85% 25%",
      "--border": "38 20% 86%",
      "--input": "38 20% 86%",
      "--ring": "43 85% 37%",
    },
  },

  sapphire: {
    id: "sapphire",
    name: "Nordique & Saphir",
    subtitle: "Épure scandinave, minéralité et modernité",
    isDark: false,
    preview: {
      primary: "#1B4F72",
      bg: "#F8FAFC",
      accent: "#D4E6F1",
      border: "#CBD5E1",
    },
    cssVariables: {
      "--background": "210 20% 98%",
      "--foreground": "215 28% 17%",
      "--card": "0 0% 100%",
      "--card-foreground": "215 28% 17%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "215 28% 17%",
      "--primary": "205 65% 28%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "210 20% 93%",
      "--secondary-foreground": "205 65% 20%",
      "--muted": "210 16% 94%",
      "--muted-foreground": "215 16% 47%",
      "--accent": "205 35% 93%",
      "--accent-foreground": "205 65% 20%",
      "--border": "210 16% 87%",
      "--input": "210 16% 87%",
      "--ring": "205 65% 28%",
    },
  },

  rose: {
    id: "rose",
    name: "Rose Botanique & Sauge",
    subtitle: "Douceur florale, élixirs bien-être & spa holistique",
    isDark: false,
    preview: {
      primary: "#8E3B46",
      bg: "#FAF7F7",
      accent: "#FADBD8",
      border: "#E8D7D8",
    },
    cssVariables: {
      "--background": "350 20% 98%",
      "--foreground": "350 25% 18%",
      "--card": "0 0% 100%",
      "--card-foreground": "350 25% 18%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "350 25% 18%",
      "--primary": "352 45% 40%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "350 20% 93%",
      "--secondary-foreground": "352 45% 25%",
      "--muted": "350 15% 94%",
      "--muted-foreground": "350 15% 46%",
      "--accent": "352 35% 93%",
      "--accent-foreground": "352 45% 25%",
      "--border": "350 15% 87%",
      "--input": "350 15% 87%",
      "--ring": "352 45% 40%",
    },
  },

  midnight: {
    id: "midnight",
    name: "Nocturne Prestige",
    subtitle: "Mode sombre luxueux, reflets dorés et ambiance officine",
    isDark: true,
    preview: {
      primary: "#D4AF37",
      bg: "#0B0F17",
      accent: "#1E293B",
      border: "#334155",
    },
    cssVariables: {
      "--background": "222 47% 7%",
      "--foreground": "45 25% 95%",
      "--card": "222 47% 10%",
      "--card-foreground": "45 25% 95%",
      "--popover": "222 47% 10%",
      "--popover-foreground": "45 25% 95%",
      "--primary": "43 75% 52%",
      "--primary-foreground": "222 47% 8%",
      "--secondary": "222 35% 15%",
      "--secondary-foreground": "43 75% 65%",
      "--muted": "222 30% 16%",
      "--muted-foreground": "220 15% 65%",
      "--accent": "222 35% 18%",
      "--accent-foreground": "43 75% 70%",
      "--border": "222 30% 20%",
      "--input": "222 30% 20%",
      "--ring": "43 75% 52%",
    },
  },
};

const STORAGE_KEY = "phyto_selected_theme_v2";
const listeners = new Set<() => void>();
let currentTheme: ThemeId = "emerald";
let initialized = false;

export function applyThemeToDOM(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  const theme = PRESET_THEMES[themeId] || PRESET_THEMES.emerald;
  const root = document.documentElement;

  // Set data-theme attribute
  root.setAttribute("data-theme", theme.id);

  // Set dark class
  if (theme.isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Set all HSL variables
  Object.entries(theme.cssVariables).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
}

function hydrate() {
  if (initialized || typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId;
    if (saved && PRESET_THEMES[saved]) {
      currentTheme = saved;
    }
  } catch {}
  initialized = true;
  applyThemeToDOM(currentTheme);
}

export const themeStore = {
  get(): ThemeId {
    hydrate();
    return currentTheme;
  },
  set(id: ThemeId) {
    if (!PRESET_THEMES[id]) return;
    currentTheme = id;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, id);
      } catch {}
      applyThemeToDOM(id);
    }
    listeners.forEach((l) => l());
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};

export function useTheme() {
  const themeId = useSyncExternalStore(
    (cb) => themeStore.subscribe(cb),
    () => themeStore.get(),
    () => "emerald" as ThemeId
  );

  useEffect(() => {
    hydrate();
    applyThemeToDOM(themeId);
  }, [themeId]);

  return {
    theme: themeId,
    themeConfig: PRESET_THEMES[themeId],
    themes: Object.values(PRESET_THEMES),
    setTheme: (id: ThemeId) => themeStore.set(id),
  };
}
