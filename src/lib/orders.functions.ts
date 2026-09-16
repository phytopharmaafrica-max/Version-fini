import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type OrderItemInput = {
  product_id: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
};

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const d = input as {
      customer_name?: string;
      customer_phone?: string;
      customer_address?: string;
      customer_email?: string;
      notes?: string;
      items?: OrderItemInput[];
      promo_code?: string | null;
      affiliate_code?: string | null;
    };
    if (!d?.customer_name?.trim() || d.customer_name.length > 120) throw new Error("Nom invalide");
    if (!d?.customer_phone?.trim() || d.customer_phone.length > 40) throw new Error("Téléphone invalide");
    if (!Array.isArray(d.items) || d.items.length === 0) throw new Error("Panier vide");
    return d as Required<Pick<typeof d, "customer_name" | "customer_phone" | "items">> & typeof d;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const subtotal = data.items.reduce((s: number, i: any) => s + Number(i.price) * Number(i.quantity), 0);

    // Promo
    let discount = 0;
    let promoCode: string | null = null;
    if (data.promo_code) {
      const code = data.promo_code.toUpperCase().trim();
      const { data: promo } = await supabaseAdmin
        .from("promo_codes").select("*").eq("code", code).eq("active", true).maybeSingle();
      if (promo && (!promo.expires_at || new Date(promo.expires_at) > new Date())
        && (!promo.max_uses || promo.uses_count < promo.max_uses)
        && subtotal >= Number(promo.min_total)) {
        discount = promo.discount_type === "percent"
          ? Math.round((subtotal * Number(promo.discount_value)) / 100)
          : Math.min(Number(promo.discount_value), subtotal);
        promoCode = code;
      }
    }

    const total = Math.max(0, subtotal - discount);

    // Affiliate commission
    let affiliateCode: string | null = null;
    let affiliateCommission = 0;
    let affiliateId: string | null = null;
    if (data.affiliate_code) {
      const code = data.affiliate_code.toUpperCase().trim();
      const { data: aff } = await supabaseAdmin
        .from("affiliates").select("id, code, commission_rate, total_orders, total_earned")
        .eq("code", code).eq("active", true).maybeSingle();
      if (aff) {
        affiliateCode = aff.code;
        affiliateId = aff.id;
        affiliateCommission = Math.round((total * Number(aff.commission_rate)) / 100);
      }
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_address: data.customer_address ?? null,
        customer_email: data.customer_email ?? null,
        notes: data.notes ?? null,
        items: data.items,
        subtotal,
        discount,
        promo_code: promoCode,
        affiliate_code: affiliateCode,
        affiliate_commission: affiliateCommission,
        total,
      })
      .select("id, order_number, total, currency, discount, promo_code")
      .single();
    if (error) throw new Error(error.message);

    // Increment counters (best-effort)
    if (promoCode) {
      const { data: p } = await supabaseAdmin.from("promo_codes").select("uses_count").eq("code", promoCode).maybeSingle();
      if (p) await supabaseAdmin.from("promo_codes").update({ uses_count: (p.uses_count ?? 0) + 1 }).eq("code", promoCode);
    }
    if (affiliateId) {
      const { data: a } = await supabaseAdmin.from("affiliates").select("total_orders, total_earned").eq("id", affiliateId).maybeSingle();
      if (a) await supabaseAdmin.from("affiliates").update({
        total_orders: (a.total_orders ?? 0) + 1,
        total_earned: Number(a.total_earned ?? 0) + affiliateCommission,
      }).eq("id", affiliateId);
    }

    return order;
  });
