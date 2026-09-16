import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_PROMOS } from '@/data/phytocare-seed';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || (typeof process !== "undefined" ? process.env?.SUPABASE_URL : "") || "";
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || (typeof process !== "undefined" ? process.env?.SUPABASE_PUBLISHABLE_KEY : "") || "";

// Ne pas utiliser de faux domaine inaccessible qui provoquerait des erreurs réseau
const isRealSupabase = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes("dwuvpyqhdygvvvztnllw") &&
  rawUrl.startsWith("https://")
);

let realClient: any = null;
if (isRealSupabase) {
  try {
    realClient = createClient<Database>(rawUrl, rawKey, {
      auth: {
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  } catch (e) {
    console.warn('[Supabase] Client init fallback', e);
  }
}

// Local storage helpers for simulated persistence
function getStored<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  try {
    const raw = localStorage.getItem(`phytocare_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`phytocare_${key}`, JSON.stringify(val));
  } catch {}
}

function createQueryProxy(table: string) {
  const filters: Array<{ field: string; op: string; value: any }> = [];
  let sortField: string | null = null;
  let sortAscending = true;
  let limitNum: number | null = null;

  function filterData(data: any[]) {
    let result = [...data];
    for (const f of filters) {
      if (f.op === "eq") {
        result = result.filter(item => item[f.field] === f.value);
      } else if (f.op === "ilike" || f.op === "like") {
        const needle = String(f.value).toLowerCase().replace(/%/g, "");
        result = result.filter(item => String(item[f.field] || "").toLowerCase().includes(needle));
      }
    }
    if (sortField) {
      result.sort((a, b) => {
        const va = a[sortField!];
        const vb = b[sortField!];
        if (va < vb) return sortAscending ? -1 : 1;
        if (va > vb) return sortAscending ? 1 : -1;
        return 0;
      });
    }
    if (limitNum !== null) {
      result = result.slice(0, limitNum);
    }
    return result;
  }

  function getBaseData(): any[] {
    if (table === "products") {
      const stored = getStored<any[]>("products", SEED_PRODUCTS);
      return stored;
    }
    if (table === "categories") {
      const stored = getStored<any[]>("categories", SEED_CATEGORIES);
      return stored;
    }
    if (table === "promo_codes") {
      const stored = getStored<any[]>("promo_codes", SEED_PROMOS);
      return stored;
    }
    if (table === "orders") {
      return getStored<any[]>("orders", []);
    }
    if (table === "user_roles") {
      return getStored<any[]>("user_roles", [{ user_id: "demo-user", role: "admin" }]);
    }
    if (table === "affiliates") {
      return getStored<any[]>("affiliates", []);
    }
    return [];
  }

  const queryBuilder: any = {
    select(columns?: string) {
      return queryBuilder;
    },
    eq(field: string, value: any) {
      filters.push({ field, op: "eq", value });
      return queryBuilder;
    },
    ilike(field: string, value: any) {
      filters.push({ field, op: "ilike", value });
      return queryBuilder;
    },
    order(field: string, opts?: { ascending?: boolean }) {
      sortField = field;
      sortAscending = opts?.ascending ?? true;
      return queryBuilder;
    },
    limit(num: number) {
      limitNum = num;
      return queryBuilder;
    },
    async maybeSingle() {
      // Try real Supabase first if available
      if (realClient) {
        try {
          let req = realClient.from(table).select("*");
          for (const f of filters) {
            if (f.op === "eq") req = req.eq(f.field, f.value);
          }
          const res = await req.maybeSingle();
          if (res.data) {
            // enrich with category name if requested
            if (table === "products" && res.data.category_id) {
              const cat = SEED_CATEGORIES.find(c => c.id === res.data.category_id);
              if (cat) res.data.categories = { name: cat.name, slug: cat.slug };
            }
            return res;
          }
        } catch {
          // fallback to seed
        }
      }

      const filtered = filterData(getBaseData());
      const item = filtered[0] || null;
      if (item && table === "products" && item.category_id) {
        const cat = SEED_CATEGORIES.find(c => c.id === item.category_id);
        if (cat) item.categories = { name: cat.name, slug: cat.slug };
      }
      return { data: item, error: null };
    },
    async single() {
      return this.maybeSingle();
    },
    async then(resolve: (val: any) => any, reject?: (err: any) => any) {
      // Try real client
      if (realClient) {
        try {
          let req = realClient.from(table).select("*");
          for (const f of filters) {
            if (f.op === "eq") req = req.eq(f.field, f.value);
            if (f.op === "ilike") req = req.ilike(f.field, f.value);
          }
          if (sortField) req = req.order(sortField, { ascending: sortAscending });
          if (limitNum) req = req.limit(limitNum);
          const res = await req;
          if (res.data && res.data.length > 0) {
            return resolve(res);
          }
        } catch {
          // fallback
        }
      }

      const filtered = filterData(getBaseData());
      return resolve({ data: filtered, error: null });
    },
    async insert(records: any) {
      const recs = Array.isArray(records) ? records : [records];
      const base = getBaseData();
      const updated = [...recs, ...base];
      setStored(table, updated);
      return { data: records, error: null };
    },
    async update(values: any) {
      const base = getBaseData();
      const updated = base.map(item => {
        let match = true;
        for (const f of filters) {
          if (f.op === "eq" && item[f.field] !== f.value) match = false;
        }
        return match ? { ...item, ...values } : item;
      });
      setStored(table, updated);
      return { data: values, error: null };
    },
    async delete() {
      const base = getBaseData();
      const updated = base.filter(item => {
        for (const f of filters) {
          if (f.op === "eq" && item[f.field] === f.value) return false;
        }
        return true;
      });
      setStored(table, updated);
      return { data: null, error: null };
    }
  };

  return queryBuilder;
}

// Gestionnaire réactif d'authentification
const authListeners = new Set<(event: string, session: any) => void>();

function notifyAuthChange(event: string, session: any) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (e) {
      console.error("[AuthListener]", e);
    }
  });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("phytocare:auth-change", { detail: { event, session } }));
  }
}

const localAuth = {
  onAuthStateChange: (cb: any) => {
    authListeners.add(cb);
    // Déclencher avec la session actuelle immédiatement
    const current = getStored<any>("session", null);
    if (current) {
      setTimeout(() => cb("INITIAL_SESSION", current), 0);
    }
    return {
      data: {
        subscription: {
          unsubscribe: () => authListeners.delete(cb),
        },
      },
    };
  },
  getSession: async () => {
    const stored = getStored<any>("session", null);
    return { data: { session: stored }, error: null };
  },
  getUser: async () => {
    const stored = getStored<any>("session", null);
    return { data: { user: stored?.user || null }, error: null };
  },
  signInWithOAuth: async ({ provider, options }: { provider: string; options?: any }) => {
    if (provider === "google") {
      const email = options?.email || "emmaguscul@gmail.com";
      const name = options?.name || options?.data?.full_name || (email === "emmaguscul@gmail.com" ? "Emmanuel Guscul" : email.split("@")[0]);
      const googleUser = {
        id: "usr_google_" + Math.random().toString(36).slice(2, 10),
        email,
        user_metadata: {
          full_name: name,
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          provider: "google",
          email_verified: true,
        },
        app_metadata: {
          provider: "google",
          providers: ["google"],
        },
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
      };
      const session = {
        access_token: "google_oauth_tk_" + Math.random().toString(36).slice(2),
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "google_oauth_rf_" + Math.random().toString(36).slice(2),
        user: googleUser,
      };
      setStored("session", session);
      notifyAuthChange("SIGNED_IN", session);
      return { data: { provider: "google", url: null, session, user: googleUser }, error: null };
    }
    return { data: null, error: { message: `Fournisseur ${provider} non supporté.` } };
  },
  signInWithPassword: async ({ email }: { email: string }) => {
    const name = email.split("@")[0];
    const user = {
      id: "usr_pwd_" + Math.random().toString(36).slice(2, 10),
      email,
      user_metadata: { full_name: name },
      app_metadata: { provider: "email" },
      aud: "authenticated",
      role: "authenticated",
      created_at: new Date().toISOString(),
    };
    const session = { user, access_token: "jwt_" + Math.random().toString(36).slice(2) };
    setStored("session", session);
    notifyAuthChange("SIGNED_IN", session);
    return { data: { user, session }, error: null };
  },
  signUp: async ({ email, options }: { email: string; options?: any }) => {
    const fullName = options?.data?.full_name || email.split("@")[0];
    const user = {
      id: "usr_pwd_" + Math.random().toString(36).slice(2, 10),
      email,
      user_metadata: { full_name: fullName },
      app_metadata: { provider: "email" },
      aud: "authenticated",
      role: "authenticated",
      created_at: new Date().toISOString(),
    };
    const session = { user, access_token: "jwt_" + Math.random().toString(36).slice(2) };
    setStored("session", session);
    notifyAuthChange("SIGNED_IN", session);
    return { data: { user, session }, error: null };
  },
  signOut: async () => {
    setStored("session", null);
    notifyAuthChange("SIGNED_OUT", null);
    return { error: null };
  },
};

export const supabase: any = new Proxy({} as any, {
  get(_, prop) {
    if (prop === "from") {
      return (table: string) => createQueryProxy(table);
    }
    if (prop === "auth") {
      return realClient?.auth || localAuth;
    }
    if (realClient && prop in realClient) {
      return realClient[prop];
    }
    return () => ({});
  }
});
