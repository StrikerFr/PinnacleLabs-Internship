import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PopupConfig = {
  bundleUpgrade: {
    enabled: boolean;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  exitIntent: {
    enabled: boolean;
    title: string;
    subtitle: string;
    coupon: string;
    timerSeconds: number;
    cta: string;
    inactivitySeconds: number;
  };
  socialProof: {
    enabled: boolean;
    minIntervalSeconds: number;
    maxIntervalSeconds: number;
    messages: string[];
  };
  lowStock: {
    enabled: boolean;
    delaySeconds: number;
    stockCount: number;
    message: string;
  };
  couponReward: {
    enabled: boolean;
    scrollPercent: number;
    title: string;
    subtitle: string;
    coupons: { code: string; label: string }[];
  };
};

export const DEFAULT_POPUP_CONFIG: PopupConfig = {
  bundleUpgrade: {
    enabled: true,
    title: "Wait — get 2 Kits for ₹799",
    subtitle: "Most customers complete 2 full resets. Save more upfront.",
    primaryCta: "Upgrade To 2 Kits",
    secondaryCta: "Continue With 1 Kit",
  },
  exitIntent: {
    enabled: true,
    title: "Before You Go — Take 10% Off",
    subtitle: "Your code expires soon.",
    coupon: "STAY10",
    timerSeconds: 600,
    cta: "Claim My Discount",
    inactivitySeconds: 20,
  },
  socialProof: {
    enabled: true,
    minIntervalSeconds: 90,
    maxIntervalSeconds: 180,
    messages: [
      "Priya S.|Bengaluru|Starter Kit — 28-Day Reset|3 minutes ago",
      "Arjun M.|Mumbai|2-Kit Bundle|7 minutes ago",
      "Meera R.|New Delhi|Starter Kit — 28-Day Reset|12 minutes ago",
      "Aanya K.|Pune|2-Kit Bundle|18 minutes ago",
      "Riya T.|Hyderabad|Starter Kit — 28-Day Reset|24 minutes ago",
      "Kavya N.|Chennai|Starter Kit — 28-Day Reset|31 minutes ago",
      "Ishaan P.|Ahmedabad|2-Kit Bundle|42 minutes ago",
      "Sneha V.|Kolkata|Starter Kit — 28-Day Reset|56 minutes ago",
    ],
  },
  lowStock: {
    enabled: true,
    delaySeconds: 45,
    stockCount: 37,
    message: "Only {count} Starter Kits Remaining",
  },
  couponReward: {
    enabled: true,
    scrollPercent: 50,
    title: "You unlocked a reward",
    subtitle: "Pick one coupon. It applies automatically at checkout.",
    coupons: [
      { code: "SAVE50", label: "₹50 off your kit" },
      { code: "SAVE75", label: "₹75 off · 2 kits and up" },
      { code: "SAVE100", label: "₹100 off · loyalty pick" },
    ],
  },
};

export const getPopupSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("popup_settings")
    .select("config")
    .eq("id", "singleton")
    .maybeSingle();
  const cfg = (data?.config ?? {}) as Partial<PopupConfig>;
  return { config: { ...DEFAULT_POPUP_CONFIG, ...cfg } as PopupConfig };
});

const configSchema = z.object({
  bundleUpgrade: z.object({
    enabled: z.boolean(),
    title: z.string().min(1).max(200),
    subtitle: z.string().max(400),
    primaryCta: z.string().min(1).max(80),
    secondaryCta: z.string().min(1).max(80),
  }),
  exitIntent: z.object({
    enabled: z.boolean(),
    title: z.string().min(1).max(200),
    subtitle: z.string().max(400),
    coupon: z
      .string()
      .min(1)
      .max(64)
      .regex(/^[A-Z0-9_-]+$/i),
    timerSeconds: z.number().int().min(30).max(3600),
    cta: z.string().min(1).max(80),
    inactivitySeconds: z.number().int().min(5).max(600),
  }),
  socialProof: z.object({
    enabled: z.boolean(),
    minIntervalSeconds: z.number().int().min(10).max(600),
    maxIntervalSeconds: z.number().int().min(10).max(600),
    messages: z.array(z.string().min(1).max(200)).min(1).max(40),
  }),
  lowStock: z.object({
    enabled: z.boolean(),
    delaySeconds: z.number().int().min(0).max(600),
    stockCount: z.number().int().min(0).max(99999),
    message: z.string().min(1).max(200),
  }),
  couponReward: z.object({
    enabled: z.boolean(),
    scrollPercent: z.number().int().min(5).max(95),
    title: z.string().min(1).max(200),
    subtitle: z.string().max(400),
    coupons: z
      .array(
        z.object({
          code: z
            .string()
            .min(1)
            .max(64)
            .regex(/^[A-Z0-9_-]+$/i),
          label: z.string().min(1).max(120),
        }),
      )
      .min(1)
      .max(6),
  }),
});

export const updatePopupSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { config: PopupConfig }) =>
    z.object({ config: configSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Forbidden");
    const { error } = await supabaseAdmin
      .from("popup_settings")
      .upsert({ id: "singleton", config: data.config as never });
    if (error) throw error;
    return { ok: true };
  });
