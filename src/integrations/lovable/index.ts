import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
  email?: string;
  name?: string;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple" | "microsoft" | "lovable", opts?: SignInOptions) => {
      try {
        if (supabase.auth?.signInWithOAuth) {
          const res = await supabase.auth.signInWithOAuth({
            provider: provider === "lovable" ? "google" : provider,
            options: {
              redirectTo: opts?.redirect_uri || (typeof window !== "undefined" ? window.location.origin : ""),
              email: opts?.email,
              name: opts?.name,
            },
          });
          return { ...res, redirected: false };
        }
      } catch (e) {
        console.warn("[OAuth fallback]", e);
        return { redirected: false, error: e };
      }
      return { redirected: false, error: null };
    },
  },
};
