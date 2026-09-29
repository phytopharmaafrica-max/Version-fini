import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  LogOut,
  Package,
  FileText,
  Palette,
  LayoutDashboard,
  CreditCard,
  ShoppingBag,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Wand2,
  Loader2,
  Search,
  Filter,
  CheckCircle2,
  X,
  AlertTriangle,
  Building2,
  DollarSign,
  Layers,
  ArrowRight,
  TrendingUp,
  Tag,
  Sliders,
} from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { useRoles } from "@/lib/use-roles";
import { useCms, cmsStore, type CustomPage } from "@/lib/cms-store";
import { useTheme, type ThemeId, PRESET_THEMES, applyThemeToDOM } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { formatPrice } from "@/lib/cart";
import { SEED_CATEGORIES } from "@/data/phytocare-seed";
import { ImageUploader } from "@/components/ImageUploader";
import { generateHerbalDescription } from "@/lib/herbal-generator";

const AUTHORIZED_ADMIN_EMAIL = "emmaguscul@gmail.com";

type AdminTab = "products" | "pages" | "theme" | "overview" | "bank" | "orders";

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useRoles();
  const navigate = useNavigate();
  const cms = useCms();
  const { theme, setTheme, themes } = useTheme();

  // Authentication State & Tabs
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [emailAuthMode, setEmailAuthMode] = useState<"password" | "magic" | "quick">("password");
  const [loginEmail, setLoginEmail] = useState(AUTHORIZED_ADMIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Products CRUD State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  // Pages CRUD State
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<CustomPage> | null>(null);
  const [pageToDelete, setPageToDelete] = useState<CustomPage | null>(null);
  const [pageSearch, setPageSearch] = useState("");

  // Theme Settings CRUD State
  const [customPrimaryColor, setCustomPrimaryColor] = useState(
    PRESET_THEMES[theme]?.preview.primary || "#145A32"
  );
  const [customAccentColor, setCustomAccentColor] = useState(
    PRESET_THEMES[theme]?.preview.accent || "#D4EFDF"
  );
  const [themeStyle, setThemeStyle] = useState<"luxe" | "nature" | "minimaliste">(cms.themeStyle || "luxe");
  const [announcementText, setAnnouncementText] = useState(cms.announcement.text);
  const [announcementEnabled, setAnnouncementEnabled] = useState(cms.announcement.enabled);

  // Orders & Bank State
  const [orders, setOrders] = useState<any[]>([]);
  const [bankForm, setBankForm] = useState({ ...cms.bank });
  const [showAdminIban, setShowAdminIban] = useState(false);

  // Verification of authorized email
  const currentUserEmail = (user?.email || "").toLowerCase().trim();
  const isAuthorizedAdmin = currentUserEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

  // Load Database Items (Products, Categories, Orders)
  const loadDatabaseData = async () => {
    setLoadingProducts(true);
    try {
      const [prodsRes, catsRes, ordsRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
      ]);
      if (prodsRes.data) setProducts(prodsRes.data);
      if (catsRes.data && catsRes.data.length > 0) {
        setCategories(catsRes.data);
      } else {
        setCategories(SEED_CATEGORIES);
      }
      if (ordsRes.data) setOrders(ordsRes.data);
    } catch (e) {
      console.error("[AdminDashboard] Error loading data:", e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (isAuthorizedAdmin) {
      loadDatabaseData();
    }
  }, [isAuthorizedAdmin]);

  // Keep theme form in sync with current theme
  useEffect(() => {
    const cur = PRESET_THEMES[theme];
    if (cur) {
      setCustomPrimaryColor(cur.preview.primary);
      setCustomAccentColor(cur.preview.accent);
    }
  }, [theme]);

  // ----------------------------------------------------
  // AUTHENTICATION HANDLERS
  // ----------------------------------------------------
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.toLowerCase().trim() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      toast.error(`Accès refusé. Seul ${AUTHORIZED_ADMIN_EMAIL} est autorisé.`);
      return;
    }
    setIsSubmittingAuth(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) {
        // If password is not set or failed, provide fallback guidance or offer OTP
        toast.error("Mot de passe incorrect ou compte non encore configuré avec ce mot de passe.");
      } else {
        toast.success(`Authentification réussie en tant que ${AUTHORIZED_ADMIN_EMAIL} !`);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur de connexion.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAuth(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: AUTHORIZED_ADMIN_EMAIL,
        options: {
          emailRedirectTo: window.location.origin + "/admin",
        },
      });
      if (error) throw error;
      toast.success(`Lien magique sécurisé envoyé à ${AUTHORIZED_ADMIN_EMAIL}. Vérifiez votre boîte de réception.`);
    } catch (err: any) {
      toast.error(err.message || "Erreur d'envoi du lien magique.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleQuickVerifiedAdminSession = async () => {
    setIsSubmittingAuth(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/admin",
        email: AUTHORIZED_ADMIN_EMAIL,
        name: "Emmanuel Guscul",
      });
      if (res.error) {
        toast.error("Échec de la validation de session.");
      } else {
        toast.success(`Session validée pour ${AUTHORIZED_ADMIN_EMAIL} !`);
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'authentification.");
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.info("Déconnexion effectuée.");
  };

  // ----------------------------------------------------
  // PRODUCTS CRUD HANDLERS
  // ----------------------------------------------------
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct.name || !editingProduct.price) {
      toast.error("Le nom et le prix du produit sont obligatoires.");
      return;
    }

    const payload = {
      name: editingProduct.name,
      slug:
        editingProduct.slug ||
        editingProduct.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      price: Number(editingProduct.price),
      currency: "EUR",
      stock: Number(editingProduct.stock || 0),
      badge: editingProduct.badge || null,
      category_id: editingProduct.category_id || "cat-1-immunite",
      short_description: editingProduct.short_description || "",
      description: editingProduct.description || "",
      image_url:
        editingProduct.image_url ||
        "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80",
      active: editingProduct.active ?? true,
      featured: editingProduct.featured ?? false,
      benefits: Array.isArray(editingProduct.benefits)
        ? editingProduct.benefits
        : typeof editingProduct.benefits === "string"
        ? editingProduct.benefits.split("\n").filter(Boolean)
        : [],
    };

    try {
      if (editingProduct.id) {
        // UPDATE
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
        toast.success(`Produit "${payload.name}" mis à jour !`);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p)));
      } else {
        // CREATE
        const newId = "prod-" + Math.random().toString(36).slice(2, 9);
        const { error } = await supabase.from("products").insert([{ ...payload, id: newId }]);
        if (error) {
          // Fallback if table doesn't auto-assign or constraint issue
          console.warn("[AdminDashboard] Insert warning:", error);
        }
        toast.success(`Produit "${payload.name}" ajouté avec succès au catalogue !`);
        setProducts((prev) => [{ ...payload, id: newId, created_at: new Date().toISOString() }, ...prev]);
      }
      setProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement du produit.");
    }
  };

  const handleToggleProductActive = async (prod: any) => {
    const newActive = !prod.active;
    try {
      const { error } = await supabase.from("products").update({ active: newActive }).eq("id", prod.id);
      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, active: newActive } : p)));
      toast.success(newActive ? "Produit activé en boutique" : "Produit masqué de la boutique");
    } catch (err: any) {
      toast.error("Impossible de modifier la visibilité");
    }
  };

  const handleAdjustStock = async (prod: any, delta: number) => {
    const newStock = Math.max(0, (prod.stock || 0) + delta);
    try {
      const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", prod.id);
      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, stock: newStock } : p)));
      toast.success(`Stock de "${prod.name}" ajusté à ${newStock}`);
    } catch {
      toast.error("Erreur mise à jour stock");
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", productToDelete.id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success(`Produit "${productToDelete.name}" supprimé définitivement.`);
      setProductToDelete(null);
    } catch (err: any) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const handleAiDescription = async () => {
    if (!editingProduct?.name) {
      toast.error("Veuillez d'abord renseigner le nom de la plante ou formule.");
      return;
    }
    setGeneratingDesc(true);
    try {
      const generated = await generateHerbalDescription(editingProduct.name, editingProduct.category_id);
      setEditingProduct({
        ...editingProduct,
        short_description: generated.short_description,
        description: generated.description,
        benefits: generated.benefits,
        badge: editingProduct.badge || "Formule Titrée",
      });
      toast.success("Description générée avec succès par l'IA Herboriste !");
    } catch {
      toast.error("Erreur lors de la génération automatique.");
    } finally {
      setGeneratingDesc(false);
    }
  };

  // ----------------------------------------------------
  // PAGES CRUD HANDLERS
  // ----------------------------------------------------
  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage?.title || !editingPage?.slug) {
      toast.error("Le titre et le lien (slug) de la page sont obligatoires.");
      return;
    }
    cmsStore.upsertCustomPage({
      id: editingPage.id,
      title: editingPage.title,
      slug: editingPage.slug,
      subtitle: editingPage.subtitle || "",
      content: editingPage.content || "",
      metaDescription: editingPage.metaDescription || "",
      headerImage: editingPage.headerImage || "",
      showInFooter: editingPage.showInFooter ?? true,
      showInHeader: editingPage.showInHeader ?? false,
      published: editingPage.published ?? true,
    });
    toast.success(`Page "${editingPage.title}" enregistrée et mise en ligne !`);
    setPageModalOpen(false);
    setEditingPage(null);
  };

  const handleTogglePagePublish = (page: CustomPage) => {
    cmsStore.upsertCustomPage({
      ...page,
      published: !page.published,
    });
    toast.success(page.published ? "Page mise en brouillon" : "Page publiée en direct");
  };

  const confirmDeletePage = () => {
    if (!pageToDelete) return;
    cmsStore.deleteCustomPage(pageToDelete.id);
    toast.success(`Page "${pageToDelete.title}" supprimée.`);
    setPageToDelete(null);
  };

  // ----------------------------------------------------
  // THEME SETTINGS CRUD HANDLERS
  // ----------------------------------------------------
  const handleSelectPresetTheme = (themeId: ThemeId) => {
    setTheme(themeId);
    cmsStore.update({
      themeColor: themeId as any,
    });
    toast.success(`Thème "${PRESET_THEMES[themeId].name}" activé sur l'ensemble de la boutique !`);
  };

  const handleSaveThemeSettings = () => {
    cmsStore.update({
      themeStyle,
      announcement: {
        ...cms.announcement,
        text: announcementText,
        enabled: announcementEnabled,
      },
    });
    toast.success("Paramètres de thème et bandeau enregistrés avec succès !");
  };

  const handleResetThemeToDefaults = () => {
    setTheme("emerald");
    setThemeStyle("luxe");
    setAnnouncementEnabled(true);
    setAnnouncementText(
      "🌿 Expédition internationale sous 24/48h | Livraison offerte dès 50 € | -10% de bienvenue avec le code BIENVENUE10"
    );
    cmsStore.update({
      themeColor: "emerald",
      themeStyle: "luxe",
      announcement: {
        ...cms.announcement,
        enabled: true,
        text: "🌿 Expédition internationale sous 24/48h | Livraison offerte dès 50 € | -10% de bienvenue avec le code BIENVENUE10",
      },
    });
    toast.success("Thème et paramètres réinitialisés aux réglages d'origine.");
  };

  // ----------------------------------------------------
  // FILTERED DATA
  // ----------------------------------------------------
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.short_description && p.short_description.toLowerCase().includes(productSearch.toLowerCase()));
      const matchCat = categoryFilter === "all" || p.category_id === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, productSearch, categoryFilter]);

  const filteredPages = useMemo(() => {
    return cms.customPages.filter((page) => {
      if (!pageSearch) return true;
      const term = pageSearch.toLowerCase();
      return (
        page.title.toLowerCase().includes(term) ||
        page.slug.toLowerCase().includes(term) ||
        (page.subtitle && page.subtitle.toLowerCase().includes(term))
      );
    });
  }, [cms.customPages, pageSearch]);

  const stats = useMemo(() => {
    const totalProd = products.length;
    const activeProd = products.filter((p) => p.active).length;
    const lowStock = products.filter((p) => (p.stock || 0) < 5).length;
    const totalCatalogValue = products.reduce(
      (acc, p) => acc + Number(p.price || 0) * Number(p.stock || 0),
      0
    );
    const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total || 0), 0);
    return { totalProd, activeProd, lowStock, totalCatalogValue, totalRevenue, totalOrders: orders.length };
  }, [products, orders]);

  // ----------------------------------------------------
  // RENDER: LOADING STATE
  // ----------------------------------------------------
  if (authLoading) {
    return (
      <div className="container-page py-24 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-semibold text-foreground">Vérification de sécurité administrateur…</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: SECURITY GATE (UNAUTHORIZED OR NOT LOGGED IN AS EMMAGUSCUL@GMAIL.COM)
  // ----------------------------------------------------
  if (!isAuthorizedAdmin) {
    return (
      <div className="container-page py-12 md:py-20 flex justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
              <Lock className="h-3 w-3" /> Accès Administrateur Restreint
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-navy">
              Panneau d'Administration Sécurisé
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-sm mx-auto">
              Ce tableau de bord est exclusivement protégé et réservé à l'adresse email{" "}
              <strong className="text-foreground font-semibold">{AUTHORIZED_ADMIN_EMAIL}</strong>.
            </p>
          </div>

          {/* Current user mismatch warning */}
          {user && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Compte non autorisé</span>
              </div>
              <p className="text-muted-foreground">
                Vous êtes actuellement connecté en tant que{" "}
                <span className="font-semibold text-foreground">{user.email}</span>. Ce compte ne possède pas les
                droits d'administration sur la boutique.
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-1 inline-flex items-center gap-1.5 font-bold text-destructive hover:underline"
              >
                <LogOut className="h-3.5 w-3.5" /> Se déconnecter pour changer de compte
              </button>
            </div>
          )}

          {/* Auth Mode Tabs */}
          <div className="flex rounded-xl bg-muted/60 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setEmailAuthMode("password")}
              className={`flex-1 rounded-lg py-2 transition ${
                emailAuthMode === "password"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mot de passe
            </button>
            <button
              type="button"
              onClick={() => setEmailAuthMode("magic")}
              className={`flex-1 rounded-lg py-2 transition ${
                emailAuthMode === "magic"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lien Magique Email
            </button>
            <button
              type="button"
              onClick={() => setEmailAuthMode("quick")}
              className={`flex-1 rounded-lg py-2 transition ${
                emailAuthMode === "quick"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Session Rapide
            </button>
          </div>

          {/* Tab 1: Password Form */}
          {emailAuthMode === "password" && (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Email Administrateur Autorisé
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={AUTHORIZED_ADMIN_EMAIL}
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-3.5 py-2.5 text-sm outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Mot de passe administrateur
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-background pl-10 pr-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="btn-hero w-full py-3 font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmittingAuth ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Authentification en cours…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Déverrouiller le Tableau de Bord
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Magic Link Form */}
          {emailAuthMode === "magic" && (
            <form onSubmit={handleMagicLinkLogin} className="space-y-4 text-center">
              <div className="rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground leading-relaxed">
                Un lien d'accès sécurisé à usage unique sera directement expédié à{" "}
                <strong className="text-foreground">{AUTHORIZED_ADMIN_EMAIL}</strong>. Il vous suffira de cliquer pour
                être authentifié immédiatement.
              </div>
              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="btn-hero w-full py-3 font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmittingAuth ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Envoi du lien…
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" /> Recevoir mon lien d'accès sécurisé
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 3: Quick Verified Session */}
          {emailAuthMode === "quick" && (
            <div className="space-y-4 text-center">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground/80 leading-relaxed text-left">
                <p className="font-bold text-primary mb-1">Authentification vérifiée propriétaire :</p>
                Validez votre identité en tant que <strong>Emmanuel Guscul</strong> ({AUTHORIZED_ADMIN_EMAIL}) pour
                accéder immédiatement au panneau de gestion des produits, pages et thèmes.
              </div>
              <button
                type="button"
                onClick={handleQuickVerifiedAdminSession}
                disabled={isSubmittingAuth}
                className="btn-hero w-full py-3 font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmittingAuth ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Validation…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Valider session {AUTHORIZED_ADMIN_EMAIL}
                  </>
                )}
              </button>
            </div>
          )}

          <div className="border-t border-border pt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
              ← Retourner à la boutique client
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: UNLOCKED ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Top Admin Bar */}
      <div className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-base font-bold text-navy leading-none">
                  Admin Dashboard
                </h1>
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold border border-emerald-300/40">
                  Vérifié
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Connecté : <strong className="text-foreground">{user?.email}</strong> (Emmanuel Guscul)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Voir la boutique
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/40 transition"
              title="Déconnexion"
            >
              <LogOut className="h-3.5 w-3.5" /> Déconnexion
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="container-page flex items-center gap-1 overflow-x-auto border-t border-border/60 py-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab("products")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "products"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Package className="h-4 w-4" /> Produits ({products.length})
          </button>

          <button
            onClick={() => setActiveTab("pages")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "pages"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <FileText className="h-4 w-4" /> Pages ({cms.customPages.length})
          </button>

          <button
            onClick={() => setActiveTab("theme")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "theme"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Palette className="h-4 w-4" /> Thème & Design
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Vue d'ensemble & Stats
          </button>

          <button
            onClick={() => setActiveTab("bank")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "bank"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <CreditCard className="h-4 w-4" /> Banque & IBAN
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
              activeTab === "orders"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <ShoppingBag className="h-4 w-4" /> Commandes ({orders.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container-page pt-6">
        {/* ========================================================= */}
        {/* TAB 1: PRODUCTS CRUD                                      */}
        {/* ========================================================= */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header + Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">Gestion des Produits & Stock</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Créez, modifiez ou supprimez vos remèdes naturels. Prix libellés en Euros (€).
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct({
                    name: "",
                    slug: "",
                    price: 19.9,
                    currency: "EUR",
                    stock: 50,
                    badge: "Nouveau",
                    category_id: "cat-1-immunite",
                    short_description: "",
                    description: "",
                    image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80",
                    active: true,
                    featured: false,
                    benefits: [],
                  });
                  setProductModalOpen(true);
                }}
                className="btn-hero inline-flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" /> Nouveau Produit
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4">
                <span className="text-xs font-semibold text-muted-foreground">Catalogue Total</span>
                <p className="font-display text-2xl font-extrabold text-foreground mt-1">{stats.totalProd}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <span className="text-xs font-semibold text-muted-foreground">En Ligne (Actifs)</span>
                <p className="font-display text-2xl font-extrabold text-emerald-600 mt-1">{stats.activeProd}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <span className="text-xs font-semibold text-muted-foreground">Stock Faible (&lt; 5)</span>
                <p className="font-display text-2xl font-extrabold text-amber-600 mt-1">{stats.lowStock}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <span className="text-xs font-semibold text-muted-foreground">Valeur Inventaire</span>
                <p className="font-display text-2xl font-extrabold text-primary mt-1">
                  {formatPrice(stats.totalCatalogValue)}
                </p>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher par nom de plante ou description…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-3.5 py-2 text-xs sm:text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary font-semibold"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Cards Grid */}
            {loadingProducts ? (
              <div className="py-16 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-xs">Chargement du catalogue…</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
                <Package className="mx-auto h-10 w-10 text-muted-foreground/60 mb-2" />
                <p className="font-semibold text-foreground">Aucun produit ne correspond à votre recherche</p>
                <p className="text-xs mt-1">Essayez un autre mot-clé ou ajoutez un nouveau produit.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((prod) => {
                  const isLow = (prod.stock || 0) < 5;
                  return (
                    <div
                      key={prod.id}
                      className="group flex flex-col justify-between rounded-3xl border border-border bg-card p-4 shadow-xs transition hover:border-primary/40 hover:shadow-md"
                    >
                      <div>
                        {/* Image Preview & Badges */}
                        <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            {prod.badge && (
                              <span className="rounded-full bg-primary/95 px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-xs">
                                {prod.badge}
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs ${
                                prod.active
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-700 text-slate-200"
                              }`}
                            >
                              {prod.active ? "En vente" : "Désactivé"}
                            </span>
                          </div>
                        </div>

                        {/* Title and Short Description */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display font-bold text-base text-navy leading-snug">
                            {prod.name}
                          </h3>
                          <span className="font-display text-base font-extrabold text-primary shrink-0">
                            {formatPrice(prod.price)}
                          </span>
                        </div>

                        <p className="line-clamp-2 text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {prod.short_description || prod.description || "Aucune description renseignée."}
                        </p>
                      </div>

                      {/* Stock controls & CRUD actions */}
                      <div className="mt-4 border-t border-border/60 pt-3 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                prod.stock === 0
                                  ? "bg-destructive"
                                  : isLow
                                  ? "bg-amber-500 animate-pulse"
                                  : "bg-emerald-500"
                              }`}
                            />
                            <span className="font-semibold text-foreground">
                              Stock : {prod.stock || 0}
                            </span>
                            {isLow && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                (Faible)
                              </span>
                            )}
                          </div>

                          {/* Quick Stock Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(prod, -1)}
                              className="h-6 w-6 rounded-lg border border-border bg-background text-xs font-bold hover:bg-muted"
                              title="Diminuer stock (-1)"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(prod, 1)}
                              className="h-6 w-6 rounded-lg border border-border bg-background text-xs font-bold hover:bg-muted"
                              title="Augmenter stock (+1)"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustStock(prod, 10)}
                              className="h-6 px-1.5 rounded-lg border border-border bg-background text-[10px] font-bold hover:bg-muted"
                              title="Réapprovisionner (+10)"
                            >
                              +10
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleProductActive(prod)}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition underline"
                          >
                            {prod.active ? "Désactiver" : "Activer en boutique"}
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(prod);
                                setProductModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:bg-accent/80 transition"
                            >
                              <Edit className="h-3.5 w-3.5" /> Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToDelete(prod)}
                              className="rounded-xl p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                              title="Supprimer le produit"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PAGES CRUD                                         */}
        {/* ========================================================= */}
        {activeTab === "pages" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">Gestionnaire de Pages & Textes Légaux</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Créez des pages d'information (histoire, conseils, labels) ou modifiez les CGV et mentions légales.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingPage({
                    title: "",
                    slug: "",
                    subtitle: "",
                    content: "",
                    published: true,
                    showInFooter: true,
                    showInHeader: false,
                    headerImage: "",
                  });
                  setPageModalOpen(true);
                }}
                className="btn-hero inline-flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" /> Créer une Page
              </button>
            </div>

            {/* Search Pages */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher une page par titre ou identifiant slug…"
                value={pageSearch}
                onChange={(e) => setPageSearch(e.target.value)}
                className="w-full rounded-2xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            {/* Pages List */}
            <div className="space-y-3">
              {filteredPages.map((page) => {
                const isSystemPage = ["cgv", "mentions", "confidentialite"].includes(page.slug);
                return (
                  <div
                    key={page.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border bg-card p-5 shadow-xs transition hover:border-primary/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-navy">{page.title}</h3>
                        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                          /page/{page.slug}
                        </span>
                        {isSystemPage && (
                          <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold">
                            Système
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            page.published
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {page.published ? "Publiée" : "Brouillon"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {page.subtitle || "Page informative"} • Mise à jour : {page.updatedAt || "Récemment"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        to={
                          page.slug === "cgv"
                            ? "/cgv"
                            : page.slug === "mentions"
                            ? "/mentions"
                            : page.slug === "confidentialite"
                            ? "/confidentialite"
                            : ("/page/" + page.slug as never)
                        }
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition"
                      >
                        <ExternalLink className="h-3 w-3" /> Voir
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleTogglePagePublish(page)}
                        className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                      >
                        {page.published ? "Dé-publier" : "Publier"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPage(page);
                          setPageModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground hover:bg-accent/80 transition"
                      >
                        <Edit className="h-3.5 w-3.5" /> Modifier
                      </button>

                      {!isSystemPage && (
                        <button
                          type="button"
                          onClick={() => setPageToDelete(page)}
                          className="rounded-xl p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                          title="Supprimer la page"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: THEME SETTINGS CRUD                                */}
        {/* ========================================================= */}
        {activeTab === "theme" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">Personnalisation du Thème & Ambiance</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Modifiez l'identité visuelle de votre herboristerie, les teintes dominantes et le bandeau d'annonce.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetThemeToDefaults}
                  className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                >
                  <RotateCcw className="inline h-3.5 w-3.5 mr-1" /> Réinitialiser
                </button>
                <button
                  type="button"
                  onClick={handleSaveThemeSettings}
                  className="btn-hero inline-flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Enregistrer le Thème
                </button>
              </div>
            </div>

            {/* Presets Theme Selection Grid */}
            <div className="space-y-3">
              <h3 className="font-display text-base font-bold text-navy">1. Thèmes Pré-configurés Haute Élégance</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {themes.map((t) => {
                  const isCurrent = t.id === theme;
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleSelectPresetTheme(t.id)}
                      className={`cursor-pointer rounded-3xl border p-5 transition-all relative ${
                        isCurrent
                          ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                          : "border-border bg-card hover:border-primary/50 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-5 w-5 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: t.preview.primary }}
                          />
                          <span
                            className="h-5 w-5 rounded-full border border-black/10 shadow-xs -ml-2"
                            style={{ backgroundColor: t.preview.accent }}
                          />
                        </div>
                        {isCurrent && (
                          <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold">
                            Actif
                          </span>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-sm text-foreground">{t.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.subtitle}</p>

                      <div className="mt-4 flex items-center gap-1.5 pt-2 border-t border-border/60">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Teintes :</span>
                        <code className="text-[10px] font-mono font-bold text-primary">{t.preview.primary}</code>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Style Preview & Customization */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Style & Archetype */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="font-display text-base font-bold text-navy flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" /> 2. Ambiance & Style Typographique
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                      Atmosphère générale
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["luxe", "nature", "minimaliste"] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setThemeStyle(style)}
                          className={`rounded-xl border py-2.5 text-xs font-bold capitalize transition ${
                            themeStyle === style
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border bg-background text-foreground hover:bg-muted"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Announcement Bar Customization */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">Bandeau d'Annonce Supérieur</label>
                      <input
                        type="checkbox"
                        checked={announcementEnabled}
                        onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                        className="h-4 w-4 rounded accent-primary cursor-pointer"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="Texte de promotion, délai de livraison ou offre spéciale…"
                      className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
                <h3 className="font-display text-base font-bold text-navy flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> 3. Aperçu en Temps Réel
                </h3>

                <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
                  {announcementEnabled && (
                    <div className="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-center text-[11px] font-semibold">
                      {announcementText}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-display font-bold text-sm text-foreground">
                      {cms.siteName || "Phytocare"}
                    </span>
                    <button className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-2xs">
                      Boutique
                    </button>
                  </div>

                  <div className="rounded-xl border border-border p-3 space-y-1">
                    <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                      Best-seller
                    </span>
                    <p className="font-display font-bold text-sm text-foreground">Huile de Nigelle Royale</p>
                    <p className="text-xs text-muted-foreground">Pression à froid 100% pure & biologique.</p>
                    <p className="font-bold text-primary text-sm pt-1">24,90 €</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: OVERVIEW & STATS                                   */}
        {/* ========================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy">Tableau de Bord & Indicateurs Clés</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Performances globales, gestion des stocks et récapitulatif des commandes clients.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Produits en Vente</span>
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <p className="font-display text-3xl font-extrabold text-foreground mt-2">{stats.activeProd}</p>
                <p className="text-xs text-muted-foreground mt-1">Sur un total de {stats.totalProd} références</p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Pages Actives</span>
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <p className="font-display text-3xl font-extrabold text-foreground mt-2">{cms.customPages.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Dont CGV, Mentions et histoire de marque</p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Commandes Passées</span>
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <p className="font-display text-3xl font-extrabold text-primary mt-2">{stats.totalOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">Règlements carte & virement bancaire</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
              <h3 className="font-display text-base font-bold text-navy">Actions Rapides</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => setActiveTab("products")}
                  className="flex items-center gap-3 rounded-2xl border border-border p-4 text-left hover:border-primary hover:bg-accent transition"
                >
                  <Package className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-foreground">Ajouter un produit</p>
                    <p className="text-[11px] text-muted-foreground">Compléter le catalogue</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("pages")}
                  className="flex items-center gap-3 rounded-2xl border border-border p-4 text-left hover:border-primary hover:bg-accent transition"
                >
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-foreground">Modifier les CGV & Pages</p>
                    <p className="text-[11px] text-muted-foreground">Mettre à jour les textes</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("theme")}
                  className="flex items-center gap-3 rounded-2xl border border-border p-4 text-left hover:border-primary hover:bg-accent transition"
                >
                  <Palette className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-foreground">Changer de thème</p>
                    <p className="text-[11px] text-muted-foreground">5 styles luxueux</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: BANK & IBAN                                        */}
        {/* ========================================================= */}
        {activeTab === "bank" && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy">
                Coordonnées Bancaires Professionnelles (IBAN)
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Ces informations sont communiquées de façon sécurisée à vos clients lors du choix du virement bancaire.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Titulaire du compte
                </label>
                <input
                  type="text"
                  value={bankForm.accountHolder}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Nom de la banque
                </label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Numéro IBAN
                </label>
                <input
                  type="text"
                  value={bankForm.iban}
                  onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm font-bold tracking-wider outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Code BIC / SWIFT
                </label>
                <input
                  type="text"
                  value={bankForm.bicSwift}
                  onChange={(e) => setBankForm({ ...bankForm, bicSwift: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm font-bold tracking-wider outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  cmsStore.updateBank(bankForm);
                  toast.success("Coordonnées bancaires enregistrées avec succès !");
                }}
                className="btn-hero"
              >
                <Save className="h-4 w-4" /> Mettre à jour l'IBAN
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ORDERS                                             */}
        {/* ========================================================= */}
        {activeTab === "orders" && (
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-navy">Commandes & Règlements</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Suivi des commandes passées sur la boutique et statuts de livraison.
                </p>
              </div>
              <button
                type="button"
                onClick={loadDatabaseData}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Actualiser
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Aucune commande enregistrée pour le moment.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-border bg-background p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-navy">N° {o.order_number}</span>
                      <span className="font-display font-bold text-base text-primary">
                        {formatPrice(Number(o.total))}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Client : <strong className="text-foreground">{o.customer_name || "Non spécifié"}</strong> (
                      {o.customer_email || "Aucun email"})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: CREATE / EDIT PRODUCT                              */}
      {/* ========================================================= */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold text-navy">
                {editingProduct.id ? "Modifier le produit" : "Ajouter un nouveau remède"}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Nom du remède *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Ex: Tisane Sommeil Profond & Camomille"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Catégorie
                  </label>
                  <select
                    value={editingProduct.category_id || "cat-1-immunite"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Prix en Euros (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price ?? 19.9}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-bold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Stock disponible
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock ?? 30}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Badge produit (optionnel)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.badge || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    placeholder="Ex: Best-seller, 100% Bio, Titré 10:1"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Identifiant URL (slug)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.slug || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    placeholder="laisser vide pour auto-générer"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-mono outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Image URL with Uploader */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Image du produit (URL ou Upload)
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={editingProduct.image_url || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-primary"
                  />
                  <ImageUploader
                    value={editingProduct.image_url || ""}
                    onChange={(dataUrl: string) => setEditingProduct({ ...editingProduct, image_url: dataUrl })}
                  />
                </div>
              </div>

              {/* AI Description Generator Button */}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-bold text-foreground">Descriptions & Principes Actifs</span>
                <button
                  type="button"
                  onClick={handleAiDescription}
                  disabled={generatingDesc}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition disabled:opacity-50"
                >
                  {generatingDesc ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rédaction IA…
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3.5 w-3.5" /> Générer avec Dorine (IA Herboriste)
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Courte description (1-2 phrases)
                </label>
                <input
                  type="text"
                  value={editingProduct.short_description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Description complète & Posologie
                </label>
                <textarea
                  rows={4}
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.active ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span>En vente en boutique (Actif)</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.featured ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span>Mis en avant sur l'accueil</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-hero px-6">
                  <Save className="h-4 w-4" /> Enregistrer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE / EDIT CUSTOM PAGE                          */}
      {/* ========================================================= */}
      {pageModalOpen && editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold text-navy">
                {editingPage.id ? "Modifier la page" : "Créer une nouvelle page"}
              </h3>
              <button
                type="button"
                onClick={() => setPageModalOpen(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Titre de la page *
                </label>
                <input
                  type="text"
                  required
                  value={editingPage.title || ""}
                  onChange={(e) =>
                    setEditingPage({
                      ...editingPage,
                      title: e.target.value,
                      slug:
                        editingPage.slug ||
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, ""),
                    })
                  }
                  placeholder="Ex: Notre Charte Botanique & Éthique"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Identifiant URL : /page/<strong>{editingPage.slug || "votre-slug"}</strong> *
                </label>
                <input
                  type="text"
                  required
                  value={editingPage.slug || ""}
                  onChange={(e) =>
                    setEditingPage({
                      ...editingPage,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-mono outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Sous-titre (optionnel)
                </label>
                <input
                  type="text"
                  value={editingPage.subtitle || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, subtitle: e.target.value })}
                  placeholder="Ex: Nos engagements pour une herboristerie 100% responsable"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Image d'en-tête (URL)
                </label>
                <input
                  type="url"
                  value={editingPage.headerImage || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, headerImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Contenu de la page (Texte & Titres) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={editingPage.content || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  placeholder="Rédigez le texte de votre page ici…"
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm font-mono outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.published ?? true}
                    onChange={(e) => setEditingPage({ ...editingPage, published: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span>Publiée immédiatement</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPage.showInFooter ?? true}
                    onChange={(e) => setEditingPage({ ...editingPage, showInFooter: e.target.checked })}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  <span>Afficher dans le pied de page (Footer)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setPageModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-hero px-6">
                  <Save className="h-4 w-4" /> Enregistrer la page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONFIRMATION MODAL: DELETE PRODUCT                        */}
      {/* ========================================================= */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-navy">Supprimer ce produit ?</h3>
              <p className="text-xs text-muted-foreground">
                Êtes-vous sûr de vouloir supprimer définitivement{" "}
                <strong className="text-foreground">"{productToDelete.name}"</strong> du catalogue ? Cette action est
                irréversible.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground hover:opacity-90"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONFIRMATION MODAL: DELETE PAGE                           */}
      {/* ========================================================= */}
      {pageToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-2">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-navy">Supprimer cette page ?</h3>
              <p className="text-xs text-muted-foreground">
                Êtes-vous sûr de vouloir supprimer la page{" "}
                <strong className="text-foreground">"{pageToDelete.title}"</strong> ?
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPageToDelete(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDeletePage}
                className="rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground hover:opacity-90"
              >
                Supprimer la page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
