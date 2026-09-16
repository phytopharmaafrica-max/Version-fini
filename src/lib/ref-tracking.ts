import { useEffect } from "react";

const REF_STORAGE_KEY = "phytocare_affiliate_ref";

export function useRefCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get("ref") || urlParams.get("aff");
      if (ref) {
        localStorage.setItem(REF_STORAGE_KEY, ref.trim());
      }
    } catch {
      // ignore
    }
  }, []);
}

export function getStoredRef(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(REF_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearStoredRef(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(REF_STORAGE_KEY);
  } catch {
    // ignore
  }
}
