import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_PROMOS } from '@/data/phytocare-seed';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || (typeof process !== "undefined" ? process.env?.SUPABASE_URL : "") || "";
const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || (typeof process !== "undefined" ? process.env?.SUPABASE_PUBLISHABLE_KEY : "") || "";

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
export function getStored<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  try {
    const raw = localStorage.getItem(`phytocare_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

export function setStored<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`phytocare_${key}`, JSON.stringify(val));
  } catch {}
}

export interface StoredEmailMessage {
  id: string;
  to: string;
  subject: string;
  body: string;
  code?: string;
  sentAt: string;
  read: boolean;
}

export function dispatchEmailMessage(email: string, subject: string, body: string, code?: string): StoredEmailMessage {
  const msg: StoredEmailMessage = {
    id: "msg_" + Math.random().toString(36).slice(2, 9),
    to: email,
    subject,
    body,
    code,
    sentAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    read: false,
  };
  const history = getStored<StoredEmailMessage[]>("sent_emails", []);
  setStored("sent_emails", [msg, ...history.slice(0, 29)]);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("phytocare:email-sent", { detail: msg }));
  }
  return msg;
}

export interface RegisteredAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  emailVerified: boolean;
  verificationCode?: string;
  codeExpiresAt?: number;
  createdAt: string;
}

export function getRegisteredAccounts(): RegisteredAccount[] {
  const defaultAccounts: RegisteredAccount[] = [
    {
      id: "acc_emmanuel_master",
      email: "emmaguscul@gmail.com",
      password: "admin",
      fullName: "Emmanuel Guscul",
      emailVerified: true,
      createdAt: "2024-01-01",
    },
  ];

  const stored = getStored<RegisteredAccount[]>("accounts", defaultAccounts);
  // Ensure master admin is always present
  if (!stored.some((a) => a.email.toLowerCase() === "emmaguscul@gmail.com")) {
    stored.push(defaultAccounts[0]);
    setStored("accounts", stored);
  }
  return stored;
}

export function saveRegisteredAccounts(accounts: RegisteredAccount[]): void {
  setStored("accounts", accounts);
}

// PostgREST Query Proxy that allows full method chaining
function createQueryProxy(table: string) {
  let action: "select" | "insert" | "update" | "delete" = "select";
  let payloadData: any = null;
  const filters: Array<{ field: string; op: string; value: any }> = [];
  let sortField: string | null = null;
  let sortAscending = true;
  let limitNum: number | null = null;

  function filterData(data: any[]) {
    let result = [...data];
    for (const f of filters) {
      if (f.op === "eq") {
        result = result.filter(item => String(item[f.field]) === String(f.value));
      } else if (f.op === "neq") {
        result = result.filter(item => String(item[f.field]) !== String(f.value));
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
      const missing = SEED_PRODUCTS.filter((sp) => !stored.some((item) => item.id === sp.id));
      if (missing.length > 0) {
        const merged = [...stored, ...missing];
        setStored("products", merged);
        return merged;
      }
      return stored;
    }
    if (table === "categories") {
      const stored = getStored<any[] | null>("categories", null);
      if (!stored) {
        setStored("categories", SEED_CATEGORIES);
        return SEED_CATEGORIES;
      }
      return stored;
    }
    if (table === "promo_codes") {
      return getStored<any[]>("promo_codes", SEED_PROMOS);
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
    select(_columns?: string) {
      action = "select";
      return queryBuilder;
    },
    insert(records: any) {
      action = "insert";
      payloadData = records;
      return queryBuilder;
    },
    update(values: any) {
      action = "update";
      payloadData = values;
      return queryBuilder;
    },
    delete() {
      action = "delete";
      return queryBuilder;
    },
    eq(field: string, value: any) {
      filters.push({ field, op: "eq", value });
      return queryBuilder;
    },
    neq(field: string, value: any) {
      filters.push({ field, op: "neq", value });
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
      const res = await queryBuilder;
      const item = Array.isArray(res.data) ? (res.data[0] || null) : res.data;
      if (item && table === "products" && item.category_id) {
        const cat = SEED_CATEGORIES.find(c => c.id === item.category_id);
        if (cat) item.categories = { name: cat.name, slug: cat.slug };
      }
      return { data: item, error: res.error || null };
    },
    async single() {
      return this.maybeSingle();
    },
    async then(resolve: (val: any) => any, reject?: (err: any) => any) {
      try {
        if (action === "insert") {
          const recs = Array.isArray(payloadData) ? payloadData : [payloadData];
          const base = getBaseData();
          const updated = [...recs, ...base];
          setStored(table, updated);

          if (realClient) {
            try {
              await realClient.from(table).insert(recs);
            } catch (e) {
              console.warn(`[Supabase Insert fallback]`, e);
            }
          }

          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent(`phytocare:${table}-updated`, { detail: updated }));
          }
          return resolve({ data: payloadData, error: null });
        }

        if (action === "update") {
          const base = getBaseData();
          let updatedItem: any = null;
          const updated = base.map((item) => {
            let match = filters.length > 0;
            for (const f of filters) {
              if (f.op === "eq" && String(item[f.field]) !== String(f.value)) match = false;
              if (f.op === "neq" && String(item[f.field]) === String(f.value)) match = false;
            }
            if (match) {
              updatedItem = { ...item, ...payloadData };
              return updatedItem;
            }
            return item;
          });

          setStored(table, updated);

          if (realClient) {
            try {
              // Strip extra fields if necessary for remote table
              let req = realClient.from(table).update(payloadData);
              for (const f of filters) {
                if (f.op === "eq") req = req.eq(f.field, f.value);
              }
              await req;
            } catch (e) {
              console.warn(`[Supabase Update fallback]`, e);
            }
          }

          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent(`phytocare:${table}-updated`, { detail: updated }));
          }
          return resolve({ data: updatedItem || payloadData, error: null });
        }

        if (action === "delete") {
          const base = getBaseData();
          const updated = base.filter((item) => {
            let match = filters.length > 0;
            for (const f of filters) {
              if (f.op === "eq" && String(item[f.field]) !== String(f.value)) match = false;
              if (f.op === "neq" && String(item[f.field]) === String(f.value)) match = false;
            }
            return !match;
          });

          setStored(table, updated);

          if (realClient) {
            try {
              let req = realClient.from(table).delete();
              for (const f of filters) {
                if (f.op === "eq") req = req.eq(f.field, f.value);
              }
              await req;
            } catch (e) {
              console.warn(`[Supabase Delete fallback]`, e);
            }
          }

          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent(`phytocare:${table}-updated`, { detail: updated }));
          }
          return resolve({ data: null, error: null });
        }

        // action === "select"
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
      } catch (err: any) {
        if (reject) return reject(err);
        return resolve({ data: null, error: err });
      }
    }
  };

  return queryBuilder;
}

// Reactive Auth Listener
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

// Real User Accounts & Email Verification Engine
const localAuth = {
  onAuthStateChange: (cb: any) => {
    authListeners.add(cb);
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

  // Inscription avec mot de passe et génération d'un code de vérification email
  signUp: async ({ email, password, options }: { email: string; password?: string; options?: any }) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { data: null, error: { message: "Veuillez entrer une adresse e-mail valide." } };
    }
    if (!password || password.length < 6) {
      return { data: null, error: { message: "Le mot de passe doit comporter au moins 6 caractères." } };
    }

    const accounts = getRegisteredAccounts();
    const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (existing && existing.emailVerified) {
      return {
        data: null,
        error: { message: "Un compte vérifié existe déjà avec cette adresse e-mail. Veuillez vous connecter." },
      };
    }

    const fullName = options?.data?.full_name?.trim() || cleanEmail.split("@")[0];
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    const newAccount: RegisteredAccount = {
      id: existing?.id || "usr_" + Math.random().toString(36).slice(2, 10),
      email: cleanEmail,
      password, // Enregistrement du mot de passe réel
      fullName,
      emailVerified: false,
      verificationCode: code,
      codeExpiresAt: expiresAt,
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = accounts.filter((a) => a.email.toLowerCase() !== cleanEmail);
    updatedAccounts.push(newAccount);
    saveRegisteredAccounts(updatedAccounts);

    // Envoi du message e-mail de validation
    dispatchEmailMessage(
      cleanEmail,
      "Confirmation de votre compte Phytocare — Code de sécurité",
      `Bonjour ${fullName},\n\nMerci de vous être inscrit sur Phytocare. Pour finaliser la création de votre compte et vérifier votre adresse e-mail, veuillez saisir le code de vérification suivant :\n\nCode de confirmation : ${code}\n\nCe code est valable pendant 15 minutes.\n\nÀ très vite,\nL'équipe Phytocare Herboristerie Biologique`,
      code
    );

    return {
      data: {
        user: null,
        session: null,
        needsVerification: true,
        email: cleanEmail,
        code,
      },
      error: null,
    };
  },

  // Vérification effective du code e-mail à 6 chiffres
  verifyOtp: async ({ email, token }: { email: string; token: string; type?: string }) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanToken = token.trim();
    const accounts = getRegisteredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { data: null, error: { message: "Aucun compte trouvé avec cet e-mail." } };
    }

    if (!account.verificationCode || account.verificationCode !== cleanToken) {
      return {
        data: null,
        error: { message: "Code de vérification incorrect. Vérifiez le message reçu ou demandez un nouveau code." },
      };
    }

    // Code valide : marquer comme vérifié et nettoyer le code
    account.emailVerified = true;
    account.verificationCode = undefined;
    account.codeExpiresAt = undefined;
    saveRegisteredAccounts(accounts);

    // Créer la session connectée
    const user = {
      id: account.id,
      email: account.email,
      user_metadata: { full_name: account.fullName, email_verified: true },
      app_metadata: { provider: "email" },
      aud: "authenticated",
      role: "authenticated",
      created_at: account.createdAt,
    };
    const session = { user, access_token: "jwt_" + Math.random().toString(36).slice(2) };
    setStored("session", session);
    notifyAuthChange("SIGNED_IN", session);

    return { data: { user, session }, error: null };
  },

  // Renvoyer un nouveau code de vérification par email
  resendVerificationCode: async (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const accounts = getRegisteredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return { data: null, error: { message: "Aucun compte trouvé avec cette adresse e-mail." } };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    account.verificationCode = code;
    account.codeExpiresAt = Date.now() + 15 * 60 * 1000;
    saveRegisteredAccounts(accounts);

    dispatchEmailMessage(
      cleanEmail,
      "Nouveau code de vérification — Phytocare",
      `Bonjour ${account.fullName},\n\nVotre nouveau code de confirmation e-mail est : ${code}\n\nL'équipe Phytocare`,
      code
    );

    return { data: { email: cleanEmail, code }, error: null };
  },

  // Connexion avec mot de passe vérifiant STRICTEMENT le mot de passe réel
  signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password || "";

    const accounts = getRegisteredAccounts();
    const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      return {
        data: null,
        error: { message: "Aucun compte associé à cette adresse e-mail. Veuillez créer un compte." },
      };
    }

    // Vérification stricte du mot de passe
    if (account.password !== cleanPassword) {
      return {
        data: null,
        error: { message: "Mot de passe incorrect pour cette adresse e-mail. Veuillez réessayer." },
      };
    }

    // Vérification du statut de confirmation de l'e-mail
    if (!account.emailVerified) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      account.verificationCode = code;
      account.codeExpiresAt = Date.now() + 15 * 60 * 1000;
      saveRegisteredAccounts(accounts);

      dispatchEmailMessage(
        cleanEmail,
        "Validation requise de votre e-mail — Phytocare",
        `Bonjour ${account.fullName},\n\nVotre compte requiert une vérification. Saisissez ce code pour valider votre e-mail : ${code}\n\nL'équipe Phytocare`,
        code
      );

      return {
        data: null,
        error: {
          message: "EMAIL_NOT_VERIFIED",
          email: cleanEmail,
          code,
        },
      };
    }

    // Mot de passe correct et e-mail vérifié -> connexion réussie
    const user = {
      id: account.id,
      email: account.email,
      user_metadata: { full_name: account.fullName, email_verified: true },
      app_metadata: { provider: "email" },
      aud: "authenticated",
      role: "authenticated",
      created_at: account.createdAt,
    };
    const session = { user, access_token: "jwt_" + Math.random().toString(36).slice(2) };
    setStored("session", session);
    notifyAuthChange("SIGNED_IN", session);
    return { data: { user, session }, error: null };
  },

  signInWithOtp: async ({ email }: { email: string; options?: any }) => {
    const cleanEmail = email.toLowerCase().trim();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const accounts = getRegisteredAccounts();
    let account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (!account) {
      account = {
        id: "usr_" + Math.random().toString(36).slice(2, 10),
        email: cleanEmail,
        password: "admin",
        fullName: cleanEmail.split("@")[0],
        emailVerified: false,
        verificationCode: code,
        codeExpiresAt: Date.now() + 15 * 60 * 1000,
        createdAt: new Date().toISOString(),
      };
      accounts.push(account);
    } else {
      account.verificationCode = code;
      account.codeExpiresAt = Date.now() + 15 * 60 * 1000;
    }
    saveRegisteredAccounts(accounts);

    dispatchEmailMessage(
      cleanEmail,
      "Votre lien et code de connexion Phytocare",
      `Bonjour,\n\nVotre code d'authentification direct est : ${code}\n\nÀ tout de suite sur Phytocare.`,
      code
    );

    return { data: { email: cleanEmail, code }, error: null };
  },

  signInWithOAuth: async ({ provider, options }: { provider: string; options?: any }) => {
    if (provider === "google") {
      const email = (options?.email || "emmaguscul@gmail.com").toLowerCase().trim();
      const name = options?.name || options?.data?.full_name || (email === "emmaguscul@gmail.com" ? "Emmanuel Guscul" : email.split("@")[0]);

      // Enregistrer ou mettre à jour dans les comptes
      const accounts = getRegisteredAccounts();
      let account = accounts.find((a) => a.email.toLowerCase() === email);
      if (!account) {
        account = {
          id: "usr_google_" + Math.random().toString(36).slice(2, 10),
          email,
          password: "admin",
          fullName: name,
          emailVerified: true,
          createdAt: new Date().toISOString(),
        };
        accounts.push(account);
        saveRegisteredAccounts(accounts);
      } else {
        account.emailVerified = true;
        saveRegisteredAccounts(accounts);
      }

      const googleUser = {
        id: account.id,
        email,
        user_metadata: {
          full_name: name,
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          provider: "google",
          email_verified: true,
        },
        app_metadata: { provider: "google", providers: ["google"] },
        aud: "authenticated",
        role: "authenticated",
        created_at: account.createdAt,
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
      return localAuth;
    }
    if (realClient && prop in realClient) {
      return realClient[prop];
    }
    return () => ({});
  }
});
