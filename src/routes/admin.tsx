import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Palette,
  Sparkles,
  Layers,
  FileText,
  CreditCard,
  Package,
  FolderTree,
  ShoppingBag,
  TicketPercent,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Edit,
  Save,
  Check,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  Building2,
  Copy,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Wand2,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { useRoles } from "@/lib/use-roles";
import { useAuth } from "@/lib/use-auth";
import { useCms, cmsStore, type SiteConfig, type HomepageSection, type CustomPage } from "@/lib/cms-store";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/cart";
import { SEED_CATEGORIES } from "@/data/phytocare-seed";
import { ImageUploader } from "@/components/ImageUploader";
import { generateHerbalDescription } from "@/lib/herbal-generator";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Panneau d'Administration CMS — Phytocare" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type AdminTab =
  | "stats"
  | "branding"
  | "hero"
  | "bank"
  | "sections"
  | "pages"
  | "products"
  | "orders";

function AdminPage() {
  const { user, isAdmin, ready } = useRoles();
  const navigate = useNavigate();
  const cms = useCms();

  const [activeTab, setActiveTab] = useState<AdminTab>("stats");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form states for CMS editing
  const [siteForm, setSiteForm] = useState({
    siteName: cms.siteName,
    tagline: cms.tagline,
    slogan: cms.slogan,
    brandDescription: cms.brandDescription,
    announcementText: cms.announcement.text,
    announcementEnabled: cms.announcement.enabled,
    email: cms.contact.email,
    phone: cms.contact.phone,
    whatsapp: cms.contact.whatsapp,
    address: cms.contact.address,
  });

  const [heroForm, setHeroForm] = useState({ ...cms.hero });
  const [bankForm, setBankForm] = useState({ ...cms.bank });
  const [showAdminIban, setShowAdminIban] = useState(false);

  // Custom Page modal state
  const [editingPage, setEditingPage] = useState<Partial<CustomPage> | null>(null);
  const [pageModalOpen, setPageModalOpen] = useState(false);

  // New Section modal state
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [newSection, setNewSection] = useState({
    title: "",
    subtitle: "",
    type: "custom_content" as const,
    content: "",
    imageUrl: "",
  });

  // Product edit modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  // Keep forms in sync when cms updates
  useEffect(() => {
    setSiteForm({
      siteName: cms.siteName,
      tagline: cms.tagline,
      slogan: cms.slogan,
      brandDescription: cms.brandDescription,
      announcementText: cms.announcement.text,
      announcementEnabled: cms.announcement.enabled,
      email: cms.contact.email,
      phone: cms.contact.phone,
      whatsapp: cms.contact.whatsapp,
      address: cms.contact.address,
    });
    setHeroForm({ ...cms.hero });
    setBankForm({ ...cms.bank });
  }, [cms]);

  // Load database items
  const loadDatabaseData = async () => {
    setLoadingData(true);
    try {
      const [prodsRes, catsRes, ordsRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
      ]);
      if (prodsRes.data) setProducts(prodsRes.data);
      if (catsRes.data) setCategories(catsRes.data);
      if (ordsRes.data) setOrders(ordsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  if (!ready) {
    return <div className="container-page py-20 text-center text-muted-foreground">Vérification des droits administrateur…</div>;
  }

  // If not admin, check if user email is emmaguscul@gmail.com
  const isMasterAdmin = (user?.email || "").toLowerCase().trim() === "emmaguscul@gmail.com";

  if (!isAdmin && !isMasterAdmin) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-xs">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold text-navy">Accès Administrateur Réservé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ce panneau d'administration est réservé à <strong>Emmaguscul@gmail.com</strong> (Emmanuel Guscul).
          </p>
          <div className="mt-6 space-y-3">
            <Link to="/auth" className="btn-hero w-full">
              Se connecter avec Google
            </Link>
            <button
              onClick={() => {
                navigate({ to: "/" });
              }}
              className="text-xs text-muted-foreground hover:underline"
            >
              Retour au site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handlers for CMS savings
  const handleSaveBranding = () => {
    cmsStore.update({
      siteName: siteForm.siteName,
      tagline: siteForm.tagline,
      slogan: siteForm.slogan,
      brandDescription: siteForm.brandDescription,
      announcement: {
        ...cms.announcement,
        text: siteForm.announcementText,
        enabled: siteForm.announcementEnabled,
      },
      contact: {
        ...cms.contact,
        email: siteForm.email,
        phone: siteForm.phone,
        whatsapp: siteForm.whatsapp,
        address: siteForm.address,
      },
    });
    toast.success("Identité du site et coordonnées enregistrées avec succès !");
  };

  const handleSaveHero = () => {
    cmsStore.updateHero(heroForm);
    toast.success("En-tête Hero d'accueil mis à jour !");
  };

  const handleSaveBank = () => {
    cmsStore.updateBank(bankForm);
    toast.success("Coordonnées bancaires & IBAN international mis à jour pour les paiements !");
  };

  const handleToggleSection = (sectionId: string, currentEnabled: boolean) => {
    cmsStore.updateSection(sectionId, { enabled: !currentEnabled });
    toast.success("Visibilité de la section mise à jour.");
  };

  const handleCreateSection = () => {
    if (!newSection.title) {
      toast.error("Le titre de la section est requis.");
      return;
    }
    cmsStore.addSection({
      type: newSection.type,
      title: newSection.title,
      subtitle: newSection.subtitle,
      enabled: true,
      order: cms.sections.length + 1,
      data: {
        content: newSection.content,
        imageUrl: newSection.imageUrl,
      },
    });
    setSectionModalOpen(false);
    setNewSection({ title: "", subtitle: "", type: "custom_content", content: "", imageUrl: "" });
    toast.success("Nouvelle section ajoutée à la page d'accueil !");
  };

  const handleDeleteSection = (id: string) => {
    if (confirm("Supprimer définitivement cette section ?")) {
      cmsStore.deleteSection(id);
      toast.success("Section supprimée.");
    }
  };

  const handleSavePage = () => {
    if (!editingPage?.title || !editingPage?.slug) {
      toast.error("Le titre et le slug de la page sont obligatoires.");
      return;
    }
    cmsStore.upsertCustomPage({
      id: editingPage.id,
      title: editingPage.title,
      slug: editingPage.slug,
      subtitle: editingPage.subtitle || "",
      content: editingPage.content || "",
      headerImage: editingPage.headerImage || "",
      published: editingPage.published ?? true,
      showInFooter: editingPage.showInFooter ?? true,
    });
    setPageModalOpen(false);
    setEditingPage(null);
    toast.success("Page enregistrée avec succès !");
  };

  const handleDeletePage = (pageId: string) => {
    if (confirm("Supprimer cette page ?")) {
      cmsStore.deleteCustomPage(pageId);
      toast.success("Page supprimée.");
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || !editingProduct?.price) {
      toast.error("Veuillez renseigner au moins le nom et le prix en euros.");
      return;
    }
    const isNew = !editingProduct.id;
    const prodToSave = {
      ...editingProduct,
      id: editingProduct.id || "prod-" + Math.random().toString(36).slice(2, 8),
      slug: editingProduct.slug || editingProduct.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      price: Number(editingProduct.price),
      currency: "EUR",
      stock: Number(editingProduct.stock || 20),
      active: editingProduct.active ?? true,
      featured: editingProduct.featured ?? false,
      benefits: Array.isArray(editingProduct.benefits)
        ? editingProduct.benefits
        : (editingProduct.benefits || "").split("\n").filter(Boolean),
      ingredients: Array.isArray(editingProduct.ingredients)
        ? editingProduct.ingredients
        : (editingProduct.ingredients || "").split(",").map((s: string) => s.trim()).filter(Boolean),
    };

    if (isNew) {
      await supabase.from("products").insert(prodToSave);
      toast.success("Produit ajouté avec succès au catalogue !");
    } else {
      await supabase.from("products").update(prodToSave).eq("id", editingProduct.id);
      toast.success("Produit mis à jour !");
    }
    setProductModalOpen(false);
    setEditingProduct(null);
    loadDatabaseData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Supprimer ce produit du catalogue ?")) {
      await supabase.from("products").delete().eq("id", id);
      toast.success("Produit retiré du catalogue.");
      loadDatabaseData();
    }
  };

  const handleAutoDescribe = async () => {
    if (!editingProduct?.name?.trim()) {
      toast.error("Veuillez d'abord renseigner le nom du remède ou de la plante.");
      return;
    }
    setGeneratingDesc(true);
    try {
      const categoryName =
        categories.find((c) => c.id === editingProduct.category_id)?.name || "Phytothérapie & Bien-être";
      const generated = await generateHerbalDescription({
        name: editingProduct.name,
        categoryId: editingProduct.category_id,
      });
      setEditingProduct((prev: any) => ({
        ...prev,
        short_description: generated.short_description || prev.short_description,
        description: generated.description || prev.description,
        badge: generated.badge || prev.badge || "100% Naturel",
        benefits: generated.benefits || prev.benefits || [],
        ingredients: generated.ingredients || prev.ingredients || [],
      }));
      toast.success("Description générée avec succès (bienfaits & posologie complétés) !");
    } catch (e) {
      console.error(e);
      toast.error("Génération locale effectuée.");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    toast.success(`Statut de commande mis à jour : ${newStatus}`);
    loadDatabaseData();
  };

  return (
    <div className="container-page py-8">
      {/* Top Banner Admin Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground font-bold shadow-xs">
            EG
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl md:text-2xl font-bold text-navy">
                Studio d'Administration & CMS
              </h1>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 border border-amber-200">
                Super Admin
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Connecté en tant que <strong>Emmaguscul@gmail.com</strong> — Contrôle total sans coder.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-accent"
          >
            <Eye className="h-3.5 w-3.5" /> Voir le site
          </Link>
          <button
            onClick={() => {
              if (confirm("Restaurer la configuration d'origine du site ?")) {
                cmsStore.resetToDefaults();
                toast.success("Paramètres réinitialisés aux valeurs d'usine.");
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Réinitialiser"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="mt-6 flex overflow-x-auto gap-2 border-b border-border pb-2 no-scrollbar">
        {[
          { id: "stats" as const, label: "Vue d'ensemble", icon: LayoutDashboard },
          { id: "branding" as const, label: "Identité & Thème", icon: Palette },
          { id: "hero" as const, label: "Bannière Hero", icon: Sparkles },
          { id: "bank" as const, label: "Banque & IBAN", icon: CreditCard },
          { id: "sections" as const, label: "Sections Accueil", icon: Layers },
          { id: "pages" as const, label: "Pages (CGV, etc.)", icon: FileText },
          { id: "products" as const, label: "Produits en Euros", icon: Package },
          { id: "orders" as const, label: `Commandes (${orders.length})`, icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground border border-border"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: STATS */}
      {activeTab === "stats" && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <p className="text-xs font-medium text-muted-foreground">Chiffre d'affaires</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-navy">
                {formatPrice(orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0))}
              </h3>
              <p className="mt-1 text-[11px] text-emerald-700">Paiements internationaux en Euros (€)</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <p className="text-xs font-medium text-muted-foreground">Commandes enregistrées</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-navy">{orders.length}</h3>
              <p className="mt-1 text-[11px] text-muted-foreground">Virements IBAN & Cartes</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <p className="text-xs font-medium text-muted-foreground">Produits au catalogue</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-navy">{products.length}</h3>
              <p className="mt-1 text-[11px] text-emerald-700">Tous tarifiés en Euros (€)</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <p className="text-xs font-medium text-muted-foreground">Pages personnalisées</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-navy">{cms.customPages.length}</h3>
              <p className="mt-1 text-[11px] text-muted-foreground">CGV, Mentions, Histoire, etc.</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick overview of bank settings */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-bold text-navy">Compte Virement Bancaire (IBAN)</h3>
                </div>
                <button
                  onClick={() => setActiveTab("bank")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Modifier
                </button>
              </div>
              <div className="rounded-2xl bg-accent/40 border border-border/80 p-4 space-y-2.5 text-xs">
                <div>
                  <span className="text-muted-foreground">Titulaire :</span>{" "}
                  <strong>{cms.bank.accountHolder}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Banque :</span>{" "}
                  <strong>{cms.bank.bankName}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-muted-foreground">IBAN officiel :</span>{" "}
                    <code className="bg-background px-2 py-0.5 rounded font-mono font-bold text-primary">
                      {showAdminIban
                        ? cms.bank.iban
                        : `FR76 •••• •••• •••• •••• ${cms.bank.iban ? cms.bank.iban.replace(/\s+/g, "").slice(-4) : "4589"}`}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdminIban(!showAdminIban)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-background transition"
                    title={showAdminIban ? "Masquer l'IBAN" : "Afficher l'IBAN"}
                  >
                    {showAdminIban ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div>
                  <span className="text-muted-foreground">BIC / SWIFT :</span>{" "}
                  <code className="bg-background px-2 py-0.5 rounded font-mono font-bold">
                    {cms.bank.bicSwift}
                  </code>
                </div>
              </div>
            </div>

            {/* Quick overview of latest orders */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg font-bold text-navy">Dernières commandes</h3>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Tout voir
                </button>
              </div>
              {orders.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Aucune commande enregistrée pour l'instant.</p>
              ) : (
                <div className="space-y-2">
                  {orders.slice(0, 3).map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-xl border border-border p-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-navy">N° {o.order_number}</p>
                        <p className="text-muted-foreground">{o.customer_name || "Client"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatPrice(Number(o.total))}</p>
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BRANDING */}
      {activeTab === "branding" && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-navy">Identité visuelle, Textes & Coordonnées</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Modifiez le nom de votre boutique, le slogan, la bannière supérieure et les informations de contact affichées aux clients.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Nom du site web</label>
              <input
                type="text"
                value={siteForm.siteName}
                onChange={(e) => setSiteForm({ ...siteForm, siteName: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Slogan officiel</label>
              <input
                type="text"
                value={siteForm.slogan}
                onChange={(e) => setSiteForm({ ...siteForm, slogan: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Sous-titre / Tagline de marque</label>
              <input
                type="text"
                value={siteForm.tagline}
                onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Description institutionnelle</label>
              <textarea
                rows={3}
                value={siteForm.brandDescription}
                onChange={(e) => setSiteForm({ ...siteForm, brandDescription: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="font-display text-base font-bold text-navy">Bannière supérieure d'annonce</h3>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="announcementEnabled"
                checked={siteForm.announcementEnabled}
                onChange={(e) => setSiteForm({ ...siteForm, announcementEnabled: e.target.checked })}
                className="h-4 w-4 rounded accent-primary"
              />
              <label htmlFor="announcementEnabled" className="text-xs font-semibold text-foreground">
                Afficher le bandeau d'annonce en haut du site
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Texte d'annonce</label>
              <input
                type="text"
                value={siteForm.announcementText}
                onChange={(e) => setSiteForm({ ...siteForm, announcementText: e.target.value })}
                placeholder="Ex: Expédition internationale suivie | Livraison offerte dès 50 €"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="font-display text-base font-bold text-navy">Coordonnées du Service Client</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Email de contact</label>
                <input
                  type="email"
                  value={siteForm.email}
                  onChange={(e) => setSiteForm({ ...siteForm, email: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Téléphone international</label>
                <input
                  type="text"
                  value={siteForm.phone}
                  onChange={(e) => setSiteForm({ ...siteForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Numéro WhatsApp officiel</label>
                <input
                  type="text"
                  value={siteForm.whatsapp}
                  onChange={(e) => setSiteForm({ ...siteForm, whatsapp: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Adresse postale / Laboratoire</label>
                <input
                  type="text"
                  value={siteForm.address}
                  onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={handleSaveBranding} className="btn-hero">
              <Save className="h-4 w-4" /> Enregistrer l'identité du site
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: HERO */}
      {activeTab === "hero" && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-navy">Section Hero (Haut de Page d'Accueil)</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Personnalisez l'accroche principale, les boutons d'appel à l'action et l'image d'accueil.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Badge d'en-tête</label>
              <input
                type="text"
                value={heroForm.badge}
                onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Titre principal</label>
              <input
                type="text"
                value={heroForm.title}
                onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Titre surligné (vert)</label>
              <input
                type="text"
                value={heroForm.titleHighlight}
                onChange={(e) => setHeroForm({ ...heroForm, titleHighlight: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Sous-titre descriptif</label>
              <textarea
                rows={3}
                value={heroForm.subtitle}
                onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Image Principale de la Bannière Hero
              </label>
              <ImageUploader
                value={heroForm.imageUrl}
                onChange={(url) => setHeroForm({ ...heroForm, imageUrl: url })}
                label="Importer l'image Hero depuis votre PC"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Texte Bouton Principal</label>
              <input
                type="text"
                value={heroForm.ctaPrimaryText}
                onChange={(e) => setHeroForm({ ...heroForm, ctaPrimaryText: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Texte Bouton Secondaire</label>
              <input
                type="text"
                value={heroForm.ctaSecondaryText}
                onChange={(e) => setHeroForm({ ...heroForm, ctaSecondaryText: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={handleSaveHero} className="btn-hero">
              <Save className="h-4 w-4" /> Enregistrer la section Hero
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BANK & IBAN */}
      {activeTab === "bank" && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900 mb-2">
                <CreditCard className="h-3.5 w-3.5" /> Paiements & Virement International
              </div>
              <h2 className="font-display text-xl font-bold text-navy">
                Coordonnées Bancaires & Virement IBAN
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Renseignez ici les coordonnées de votre compte bancaire (Revolut, N26, Wise, BNP, etc.) pour recevoir directement les virements en euros de vos clients internationaux.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-emerald-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-navy dark:text-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Coordonnées bancaires sécurisées & confidentielles
            </p>
            <p className="leading-relaxed">
              Vos coordonnées bancaires officielles ne sont <strong>jamais exposées publiquement</strong> sur les pages du site. Lorsque vos clients choisissent le règlement par Virement Bancaire sur la page Panier, l'IBAN complet, le BIC et la référence d'ordre unique leur sont délivrés confidentiellement dès la validation de la commande, accompagnés des boutons de copie en 1 clic.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Titulaire du compte (Nom complet ou Société)
              </label>
              <input
                type="text"
                value={bankForm.accountHolder}
                onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                placeholder="Ex: Emmanuel Guscul / Phytocare International"
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
                placeholder="Ex: Compte International SEPA & SWIFT"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Numéro IBAN (International Bank Account Number)
              </label>
              <input
                type="text"
                value={bankForm.iban}
                onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                placeholder="FR76 3000 4000 0123 4567 8901 234"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm font-semibold tracking-wider outline-none focus:border-primary"
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
                placeholder="BNPAFRPPXXX"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm font-semibold tracking-wider outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Pays de domiciliation bancaire
              </label>
              <input
                type="text"
                value={bankForm.bankCountry}
                onChange={(e) => setBankForm({ ...bankForm, bankCountry: e.target.value })}
                placeholder="France / Union Européenne"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Préfixe de référence de commande
              </label>
              <input
                type="text"
                value={bankForm.referencePrefix}
                onChange={(e) => setBankForm({ ...bankForm, referencePrefix: e.target.value })}
                placeholder="PHYTO"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Consignes affichées au client lors du virement
              </label>
              <textarea
                rows={3}
                value={bankForm.instructions}
                onChange={(e) => setBankForm({ ...bankForm, instructions: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={handleSaveBank} className="btn-hero">
              <Save className="h-4 w-4" /> Mettre à jour l'IBAN & Paiements
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECTIONS BUILDER */}
      {activeTab === "sections" && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-navy">
                Constructeur de Sections de la Page d'Accueil
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Activez, désactivez ou personnalisez les blocs de la page d'accueil en temps réel.
              </p>
            </div>
            <button
              onClick={() => setSectionModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Ajouter une section
            </button>
          </div>

          <div className="space-y-3">
            {cms.sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border p-4 transition hover:bg-accent/20"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent font-bold text-xs text-accent-foreground">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm text-navy">{sec.title}</h4>
                    <p className="text-xs text-muted-foreground">{sec.subtitle || `Type : ${sec.type}`}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      sec.enabled
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {sec.enabled ? "Active" : "Masquée"}
                  </span>
                  <button
                    onClick={() => handleToggleSection(sec.id, sec.enabled)}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent"
                  >
                    {sec.enabled ? "Désactiver" : "Activer"}
                  </button>
                  {sec.id.startsWith("sec-custom") && (
                    <button
                      onClick={() => handleDeleteSection(sec.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: CUSTOM PAGES */}
      {activeTab === "pages" && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Gestionnaire de Pages & Mentions</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Ajoutez de nouvelles pages d'information ou modifiez les CGV, mentions légales et politique de confidentialité sans coder.
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
                });
                setPageModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Créer une nouvelle page
            </button>
          </div>

          <div className="space-y-3">
            {cms.customPages.map((page) => (
              <div
                key={page.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border p-4 transition hover:bg-accent/20"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-navy">{page.title}</h4>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                      /{page.slug}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {page.subtitle || "Page informative"} • Modifié le {page.updatedAt || "récemment"}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    to={page.slug === "cgv" ? "/cgv" : page.slug === "mentions" ? "/mentions" : page.slug === "confidentialite" ? "/confidentialite" : ("/page/" + page.slug as never)}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent"
                  >
                    <ExternalLink className="h-3 w-3" /> Voir
                  </Link>
                  <button
                    onClick={() => {
                      setEditingPage(page);
                      setPageModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground hover:opacity-80"
                  >
                    <Edit className="h-3 w-3" /> Modifier
                  </button>
                  {!["cgv", "mentions", "confidentialite"].includes(page.slug) && (
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS */}
      {activeTab === "products" && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Catalogue des Remèdes en Euros (€)</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Ajoutez, modifiez ou supprimez des produits. Tous les prix sont enregistrés et facturés en Euros (€).
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct({
                  name: "",
                  slug: "",
                  price: 19.90,
                  currency: "EUR",
                  stock: 30,
                  badge: "Nouveau",
                  category_id: "cat-1-immunite",
                  short_description: "",
                  description: "",
                  image_url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80",
                  benefits: [],
                  ingredients: [],
                });
                setProductModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Ajouter un produit
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-background p-4 shadow-xs"
              >
                <div>
                  <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-xl bg-muted">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="h-full w-full object-cover"
                    />
                    {prod.badge && (
                      <span className="absolute top-2 left-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                        {prod.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-bold text-sm text-navy">{prod.name}</h4>
                  <p className="line-clamp-2 text-xs text-muted-foreground mt-1">
                    {prod.short_description || prod.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/80 pt-3">
                  <div>
                    <span className="font-display text-base font-bold text-primary">
                      {formatPrice(prod.price)}
                    </span>
                    <span className="ml-2 text-[11px] text-muted-foreground">
                      Stock : {prod.stock ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setProductModalOpen(true);
                      }}
                      className="rounded-lg bg-accent p-1.5 text-accent-foreground hover:opacity-80"
                      title="Modifier"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === "orders" && (
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-navy">Suivi des Commandes & Paiements</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Gérez les règlements reçus par virement bancaire IBAN, carte et WhatsApp.
              </p>
            </div>
            <button
              onClick={loadDatabaseData}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <RotateCcw className="h-3 w-3" /> Actualiser
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Aucune commande passée pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="rounded-2xl border border-border p-4 bg-background space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                    <div>
                      <span className="font-mono font-bold text-sm text-navy">
                        Commande N° {o.order_number}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Date : {new Date(o.created_at || Date.now()).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-base font-bold text-primary">
                        {formatPrice(Number(o.total))}
                      </span>
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold outline-none"
                      >
                        <option value="en_attente">En attente de virement</option>
                        <option value="paye">Paiement reçu</option>
                        <option value="confirme">Confirmée</option>
                        <option value="expedie">Expédiée</option>
                        <option value="livre">Livrée</option>
                        <option value="annule">Annulée</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-2 text-xs md:grid-cols-3">
                    <div>
                      <p className="font-semibold text-muted-foreground">Client :</p>
                      <p className="font-medium text-navy">{o.customer_name || "Non spécifié"}</p>
                      {o.customer_email && <p className="text-muted-foreground">{o.customer_email}</p>}
                      {o.customer_phone && <p className="text-muted-foreground">{o.customer_phone}</p>}
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Livraison :</p>
                      <p className="text-muted-foreground">{o.customer_address || "Adresse non renseignée"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Moyen de paiement :</p>
                      <p className="font-medium text-navy">{o.payment_method || "Virement Bancaire (IBAN)"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: EDIT / CREATE CUSTOM PAGE */}
      {pageModalOpen && editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-navy">
              {editingPage.id ? "Modifier la page" : "Créer une nouvelle page"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Titre de la page</label>
                <input
                  type="text"
                  value={editingPage.title || ""}
                  onChange={(e) =>
                    setEditingPage({
                      ...editingPage,
                      title: e.target.value,
                      slug: editingPage.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                    })
                  }
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Identifiant URL (Slug) : /page/<strong>{editingPage.slug || "votre-page"}</strong>
                </label>
                <input
                  type="text"
                  value={editingPage.slug || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-mono outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Sous-titre (optionnel)</label>
                <input
                  type="text"
                  value={editingPage.subtitle || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, subtitle: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Image d'en-tête</label>
                <ImageUploader
                  value={editingPage.headerImage || ""}
                  onChange={(url) => setEditingPage({ ...editingPage, headerImage: url })}
                  label="Importer l'image d'en-tête de la page"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Contenu de la page (Texte & Titres)</label>
                <textarea
                  rows={10}
                  value={editingPage.content || ""}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-3.5 text-sm font-sans leading-relaxed outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPageModalOpen(false);
                  setEditingPage(null);
                }}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-accent"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSavePage}
                className="btn-hero text-xs"
              >
                Enregistrer la page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD HOMEPAGE SECTION */}
      {sectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-navy">Ajouter une section personnalisée</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Titre de la section</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="Ex: Notre charte de cueillette éthique"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Sous-titre</label>
                <input
                  type="text"
                  value={newSection.subtitle}
                  onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
                  placeholder="Ex: Pureté, biodynamie et respect de la nature"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Texte explicatif</label>
                <textarea
                  rows={4}
                  value={newSection.content}
                  onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                  placeholder="Rédigez le texte qui sera affiché sur la page d'accueil..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Illustration de la section</label>
                <ImageUploader
                  value={newSection.imageUrl}
                  onChange={(url) => setNewSection({ ...newSection, imageUrl: url })}
                  label="Importer l'illustration de la section"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSectionModalOpen(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-accent"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCreateSection}
                className="btn-hero text-xs"
              >
                Ajouter à l'accueil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / ADD PRODUCT */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-lg font-bold text-navy">
              {editingProduct.id ? "Modifier le produit" : "Nouveau produit au catalogue"}
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Nom du remède / produit</label>
                <input
                  type="text"
                  value={editingProduct.name || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Prix en Euros (€)</label>
                <input
                  type="number"
                  step="0.10"
                  value={editingProduct.price || 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold text-primary outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Catégorie</label>
                <select
                  value={editingProduct.category_id || "cat-1-immunite"}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="cat-1-immunite">Immunité & Défenses</option>
                  <option value="cat-2-stress">Stress & Sérénité</option>
                  <option value="cat-3-sommeil">Sommeil Réparateur</option>
                  <option value="cat-4-digestion">Digestion Facile</option>
                  <option value="cat-5-energie">Vitalité & Énergie</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Stock disponible</label>
                <input
                  type="number"
                  value={editingProduct.stock || 0}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Badge (ex: Bio, Populaire)</label>
                <input
                  type="text"
                  value={editingProduct.badge || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              {/* Photo du produit avec ImageUploader */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Photo du remède / plante (Importation directe depuis votre PC ou sélection)
                </label>
                <ImageUploader
                  value={editingProduct.image_url || ""}
                  onChange={(url) => setEditingProduct({ ...editingProduct, image_url: url })}
                  label="Glissez une photo de votre PC ou cliquez pour sélectionner"
                />
              </div>

              {/* Bouton d'auto-génération de description par IA / Pharmacopée */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-primary/20 bg-primary/5 rounded-2xl p-4 my-1">
                <div>
                  <p className="text-xs font-bold text-navy flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" /> Auto-génération de description & pharmacopée
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Génère instantanément la description médicale, les bienfaits clés et la posologie recommandée d'après le nom de la plante.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={generatingDesc}
                  onClick={handleAutoDescribe}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 shrink-0 shadow-xs"
                >
                  {generatingDesc ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rédaction en cours…
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3.5 w-3.5" /> Auto-décrire le remède
                    </>
                  )}
                </button>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Description courte (accroche)</label>
                <input
                  type="text"
                  value={editingProduct.short_description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Description complète & vertus thérapeutiques</label>
                <textarea
                  rows={4}
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Bienfaits clés (un par ligne)
                </label>
                <textarea
                  rows={3}
                  value={
                    Array.isArray(editingProduct.benefits)
                      ? editingProduct.benefits.join("\n")
                      : editingProduct.benefits || ""
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      benefits: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                  placeholder="Ex: Renforce le système immunitaire&#10;Réduit la fatigue passagère"
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Ingrédients & Plantes actives (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(editingProduct.ingredients)
                      ? editingProduct.ingredients.join(", ")
                      : editingProduct.ingredients || ""
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      ingredients: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Ex: Échinacée pourpre bio, Propolis purified, Vitamine C naturelle"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-accent"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                className="btn-hero text-xs"
              >
                Enregistrer le produit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
