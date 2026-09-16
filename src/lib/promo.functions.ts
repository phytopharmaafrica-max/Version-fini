import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SEED_PROMOS } from "@/data/phytocare-seed";

const validatePromoSchema = z.object({
  code: z.string(),
  amount: z.number().optional(),
});

export const validatePromoCode = createServerFn({ method: "POST" })
  .inputValidator((data) => validatePromoSchema.parse(data))
  .handler(async ({ data }) => {
    const code = (data.code || "").trim().toUpperCase();
    const amount = data.amount ?? 0;

    // Check seed promos or database
    let promo = SEED_PROMOS.find((p) => p.code.toUpperCase() === code && p.active);

    if (!promo) {
      const { data: dbPromo } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", code)
        .eq("active", true)
        .maybeSingle();
      if (dbPromo) {
        promo = dbPromo;
      }
    }

    if (!promo) {
      throw new Error("Code promotionnel invalide ou expiré.");
    }

    if (promo.min_order_amount && amount < promo.min_order_amount) {
      throw new Error(
        `Montant minimum de commande de ${promo.min_order_amount} € requis pour ce code.`
      );
    }

    return {
      valid: true,
      code: promo.code,
      discount_percent: promo.discount_percent,
      min_order_amount: promo.min_order_amount,
    };
  });
