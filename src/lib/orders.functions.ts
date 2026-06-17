import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, optionalSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const addressSchema = z.object({
  full_name: z.string().min(1).max(120),
  phone: z.string().min(7).max(20),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().nullable(),
  city: z.string().min(1).max(80),
  state: z.string().min(1).max(80),
  pincode: z.string().min(4).max(12),
  country: z.string().min(1).max(80).default("India"),
});

const itemSchema = z.object({
  product_sku: z.string().min(1).max(64),
  product_name: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(20),
  unit_price: z.number().min(0),
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator(
    (input: {
      items: Array<{
        product_sku: string;
        product_name: string;
        quantity: number;
        unit_price: number;
      }>;
      address: z.infer<typeof addressSchema>;
      coupon_code?: string | null;
      payment_method: "cod" | "online";
      email: string;
    }) =>
      z
        .object({
          items: z.array(itemSchema).min(1),
          address: addressSchema,
          coupon_code: z.string().max(64).optional().nullable(),
          payment_method: z.enum(["cod", "online"]),
          email: z.string().email(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Apply bundle pricing for starter kits using catalog values
    const { PRODUCTS } = await import("./products");
    const qty = data.items.reduce((s, i) => s + i.quantity, 0);
    const triples = Math.floor(qty / 3);
    const rest = qty % 3;
    const pairs = Math.floor(rest / 2);
    const singles = rest % 2;
    const subtotal =
      triples * PRODUCTS.BUNDLE_3.price +
      pairs * PRODUCTS.BUNDLE_2.price +
      singles * PRODUCTS.STARTER_KIT.price;

    let discount = 0;
    let couponId: string | null = null;
    let couponCode: string | null = null;

    if (data.coupon_code) {
      const { data: c } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", data.coupon_code.toUpperCase())
        .maybeSingle();
      if (
        c &&
        c.active &&
        (!c.expires_at || new Date(c.expires_at) > new Date()) &&
        (c.max_uses == null || c.used_count < c.max_uses)
      ) {
        discount =
          c.discount_type === "percentage"
            ? Math.round((subtotal * Number(c.discount_value)) / 100)
            : Math.min(Number(c.discount_value), subtotal);
        couponId = c.id;
        couponCode = c.code;
      }
    }

    const shipping = 0;
    const codFee = data.payment_method === "cod" ? 39 : 0;
    const total = Math.max(0, subtotal - discount + shipping + codFee);

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: (userId ?? null) as any,
        subtotal,
        discount,
        shipping,
        total,
        coupon_id: couponId,
        coupon_code: couponCode,
        shipping_address: data.address,
        customer_name: data.address.full_name,
        customer_email: data.email,
        customer_phone: data.address.phone,
        payment_method: data.payment_method,
        payment_status: "pending",
        status: "pending",
      })
      .select()
      .single();

    if (orderErr || !order) throw new Error(orderErr?.message ?? "Order failed");

    // Insert items (recompute line totals server-side)
    const itemsToInsert = data.items.map((i) => ({
      order_id: order.id,
      product_sku: i.product_sku,
      product_name: i.product_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      line_total: i.unit_price * i.quantity,
    }));
    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(itemsToInsert);
    if (itemsErr) throw new Error(itemsErr.message);

    // Track coupon usage and bump used_count
    if (couponId) {
      await supabaseAdmin.from("coupon_usage").insert({
        coupon_id: couponId,
        user_id: (userId ?? null) as any,
        order_id: order.id,
        discount_amount: discount,
      });
      await supabaseAdmin
        .from("coupons")
        .update({
          used_count:
            (await supabaseAdmin.from("coupons").select("used_count").eq("id", couponId).single())
              .data!.used_count + 1,
        })
        .eq("id", couponId);
    }

    return { ok: true as const, orderId: order.id, orderNumber: order.order_number };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { orders: data ?? [] };
  });

export const getMyOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: order, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { order };
  });
