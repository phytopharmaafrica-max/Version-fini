// Multi-currency manager with live formatting and conversion
import { useEffect, useSyncExternalStore } from "react";

export type CurrencyCode = "EUR" | "USD" | "GBP" | "CAD" | "CHF" | "XOF";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  rateFromEUR: number; // 1 EUR = rate * Currency
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "🇪🇺",
    rateFromEUR: 1.0,
    decimals: 2,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "🇺🇸",
    rateFromEUR: 1.08,
    decimals: 2,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "🇬🇧",
    rateFromEUR: 0.85,
    decimals: 2,
  },
  CAD: {
    code: "CAD",
    symbol: "CA$",
    name: "Dollar Canadien",
    flag: "🇨🇦",
    rateFromEUR: 1.48,
    decimals: 2,
  },
  CHF: {
    code: "CHF",
    symbol: "CHF",
    name: "Franc Suisse",
    flag: "🇨🇭",
    rateFromEUR: 0.96,
    decimals: 2,
  },
  XOF: {
    code: "XOF",
    symbol: "FCFA",
    name: "Franc CFA",
    flag: "🌍",
    rateFromEUR: 655.957,
    decimals: 0,
  },
};

const STORAGE_KEY = "phyto_selected_currency_v1";
const listeners = new Set<() => void>();
let currentCurrency: CurrencyCode = "EUR";
let initialized = false;

function hydrate() {
  if (initialized || typeof window === "undefined") return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      currentCurrency = saved;
    }
  } catch {}
  initialized = true;
}

export const currencyStore = {
  get(): CurrencyCode {
    hydrate();
    return currentCurrency;
  },
  set(code: CurrencyCode) {
    if (!SUPPORTED_CURRENCIES[code]) return;
    currentCurrency = code;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {}
    }
    listeners.forEach((l) => l());
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  convert(amountEUR: number, targetCurrency: CurrencyCode = currentCurrency): number {
    const config = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.EUR;
    const converted = amountEUR * config.rateFromEUR;
    return config.decimals === 0 ? Math.round(converted) : Math.round(converted * 100) / 100;
  },
  format(amountEUR: number, targetCurrency?: CurrencyCode): string {
    const code = targetCurrency || currencyStore.get();
    const config = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.EUR;
    const converted = currencyStore.convert(amountEUR, code);

    // Format with standard Intl
    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: code,
        minimumFractionDigits: config.decimals,
        maximumFractionDigits: config.decimals,
      }).format(converted);
    } catch {
      return `${converted.toFixed(config.decimals)} ${config.symbol}`;
    }
  },
};

export function useCurrency() {
  const code = useSyncExternalStore(
    (cb) => currencyStore.subscribe(cb),
    () => currencyStore.get(),
    () => "EUR" as CurrencyCode
  );

  useEffect(() => {
    hydrate();
  }, []);

  const config = SUPPORTED_CURRENCIES[code];

  return {
    currency: code,
    config,
    currencies: Object.values(SUPPORTED_CURRENCIES),
    setCurrency: (newCode: CurrencyCode) => currencyStore.set(newCode),
    convert: (amountEUR: number, customCode?: CurrencyCode) =>
      currencyStore.convert(amountEUR, customCode || code),
    format: (amountEUR: number, customCode?: CurrencyCode) =>
      currencyStore.format(amountEUR, customCode || code),
  };
}
