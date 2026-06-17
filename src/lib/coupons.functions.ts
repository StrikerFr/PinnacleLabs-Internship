import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: { code: string; subtotal: number; quantity?: number }) =>
    z
      .object({
        code: z
          .string()
          .min(1)
          .max(64)
          .regex(/^[A-Z0-9_-]+$/i),
        subtotal: z.number().positive(),
        quantity: z.number().int().nonnegative().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Special hard-coded coupon: ROHIT5 → 2 kits for ₹499 total
    if (data.code.toUpperCase() === "ROHIT5") {
      if ((data.quantity ?? 0) < 2) {
        return { ok: false as const, error: "ROHIT5 requires 2 Starter Kits in cart" };
      }
      const discount = Math.max(0, data.subtotal - 499);
      return {
        ok: true as const,
        coupon: { id: "rohit5", code: "ROHIT5", discount_type: "fixed", discount_value: discount },
        discount,
      };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", data.code.toUpperCase())
      .maybeSingle();

    if (error || !coupon) return { ok: false as const, error: "Invalid coupon code" };
    if (!coupon.active) return { ok: false as const, error: "Coupon is inactive" };
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
      return { ok: false as const, error: "Coupon has expired" };
    if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses)
      return { ok: false as const, error: "Coupon limit reached" };

    const discount =
      coupon.discount_type === "percentage"
        ? Math.round((data.subtotal * Number(coupon.discount_value)) / 100)
        : Math.min(Number(coupon.discount_value), data.subtotal);

    return {
      ok: true as const,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
      },
      discount,
    };
  });
