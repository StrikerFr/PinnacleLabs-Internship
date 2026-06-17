import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  X,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Check,
  Clock,
  Gift,
  Package,
  BadgeCheck,
} from "lucide-react";
import { getPopupSettings, type PopupConfig } from "@/lib/popup-settings.functions";
import { usePopups } from "@/lib/popups-store";
import { useCart } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/products";
import { inr } from "@/lib/format";

const INK = "#143A2A";
const GOLD = "#C9A86A";
const IVORY = "#F4ECDC";

function Shell({
  onClose,
  children,
  maxW = "max-w-md",
}: {
  onClose: () => void;
  children: React.ReactNode;
  maxW?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${maxW} rounded-3xl overflow-hidden animate-scale-in`}
        style={{
          background: "linear-gradient(180deg, #FFFDF7 0%, #F7F1E5 100%)",
          boxShadow: "0 30px 80px -20px rgba(20,58,42,0.55), 0 0 0 1px rgba(201,168,106,0.25)",
        }}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full grid place-items-center bg-white/80 hover:bg-white border border-foreground/10"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ─── BUNDLE UPGRADE ─── */
function BundleUpgradeDialog({ cfg }: { cfg: PopupConfig["bundleUpgrade"] }) {
  const { close, bundleResolver } = usePopups();
  const handle = (upgrade: boolean) => {
    bundleResolver?.(upgrade);
    close();
  };
  const oneKit = PRODUCTS.STARTER_KIT.price;
  const twoSep = oneKit * 2;
  const twoPack = PRODUCTS.BUNDLE_2.price;
  const saved = twoSep - twoPack;
  return (
    <Shell onClose={() => handle(false)}>
      <div className="p-6 sm:p-7">
        <div
          className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase"
          style={{ color: GOLD }}
        >
          <Sparkles className="h-3.5 w-3.5" /> Limited Bundle
        </div>
        <h3
          className="mt-2 font-serif italic font-light text-[1.7rem] sm:text-[2rem] leading-tight"
          style={{ color: INK }}
        >
          {cfg.title}
        </h3>
        <p className="mt-1.5 text-sm text-foreground/70">{cfg.subtitle}</p>

        <div
          className="mt-5 rounded-2xl p-4 sm:p-5"
          style={{ background: "rgba(20,58,42,0.05)", border: "1px solid rgba(20,58,42,0.12)" }}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-foreground/55">
                2 Kits
              </div>
              <div className="font-serif text-3xl sm:text-4xl" style={{ color: INK }}>
                {inr(twoPack)}
              </div>
              <div className="text-xs text-foreground/55 line-through mt-0.5">
                {inr(twoSep)} separately
              </div>
            </div>
            <div
              className="text-[10px] font-semibold tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #E8C98A 100%)`,
                color: INK,
              }}
            >
              Save {inr(saved)}
            </div>
          </div>
          <ul className="mt-3 grid gap-1.5 text-[13px] text-foreground/80">
            {[
              "56 days of complete ritual",
              "Free shipping included",
              "Stays sealed — 24 month shelf life",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5" style={{ color: INK }} strokeWidth={2.4} /> {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 grid gap-2.5">
          <button
            onClick={() => handle(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[11.5px] tracking-[0.28em] uppercase font-semibold transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${INK} 0%, #1F5A40 100%)`,
              color: IVORY,
              boxShadow: "0 14px 28px -10px rgba(20,58,42,0.5)",
            }}
          >
            <ShoppingBag className="h-4 w-4" /> {cfg.primaryCta} · {inr(twoPack)}
          </button>
          <button
            onClick={() => handle(false)}
            className="w-full rounded-full px-6 py-3 text-[11px] tracking-[0.28em] uppercase text-foreground/65 hover:text-foreground"
          >
            {cfg.secondaryCta} · {inr(oneKit)}
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ─── EXIT INTENT ─── */
function ExitIntentDialog({ cfg }: { cfg: PopupConfig["exitIntent"] }) {
  const { close, setAppliedCoupon } = usePopups();
  const [left, setLeft] = useState(cfg.timerSeconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const claim = () => {
    setAppliedCoupon(cfg.coupon);
    navigator.clipboard?.writeText(cfg.coupon).catch(() => {});
    toast.success(`${cfg.coupon} applied — check your cart`);
    close();
  };
  return (
    <Shell onClose={close}>
      <div className="relative p-6 sm:p-7 text-center">
        <div
          className="mx-auto w-12 h-12 rounded-full grid place-items-center"
          style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #E8C98A 100%)` }}
        >
          <Gift className="h-5 w-5" style={{ color: INK }} />
        </div>
        <h3
          className="mt-3 font-serif italic font-light text-[1.7rem] sm:text-[2rem] leading-tight"
          style={{ color: INK }}
        >
          {cfg.title}
        </h3>
        <p className="mt-1.5 text-sm text-foreground/70">{cfg.subtitle}</p>

        <div
          className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
          style={{ background: "rgba(20,58,42,0.07)", color: INK }}
        >
          <Clock className="h-3.5 w-3.5" /> Expires in {mm}:{ss}
        </div>

        <div
          className="mt-4 mx-auto inline-block rounded-xl px-5 py-3 font-mono tracking-[0.3em] text-lg sm:text-xl"
          style={{ background: INK, color: IVORY, border: `1px dashed ${GOLD}` }}
        >
          {cfg.coupon}
        </div>

        <button
          onClick={claim}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[11.5px] tracking-[0.28em] uppercase font-semibold transition-transform hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${INK} 0%, #1F5A40 100%)`,
            color: IVORY,
            boxShadow: "0 14px 28px -10px rgba(20,58,42,0.5)",
          }}
        >
          {cfg.cta} <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={close}
          className="mt-2 w-full rounded-full px-6 py-2 text-[11px] tracking-[0.28em] uppercase text-foreground/55 hover:text-foreground"
        >
          No thanks
        </button>
      </div>
    </Shell>
  );
}

/* ─── COUPON REWARD ─── */
function CouponRewardDialog({ cfg }: { cfg: PopupConfig["couponReward"] }) {
  const { close, setAppliedCoupon } = usePopups();
  const pick = (code: string) => {
    setAppliedCoupon(code);
    navigator.clipboard?.writeText(code).catch(() => {});
    toast.success(`${code} applied — it'll show at checkout`);
    close();
  };
  return (
    <Shell onClose={close}>
      <div className="p-6 sm:p-7">
        <div
          className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase"
          style={{ color: GOLD }}
        >
          <Gift className="h-3.5 w-3.5" /> Reward Unlocked
        </div>
        <h3
          className="mt-2 font-serif italic font-light text-[1.7rem] sm:text-[2rem] leading-tight"
          style={{ color: INK }}
        >
          {cfg.title}
        </h3>
        <p className="mt-1.5 text-sm text-foreground/70">{cfg.subtitle}</p>

        <div className="mt-5 grid gap-2.5">
          {cfg.coupons.map((c) => (
            <button
              key={c.code}
              onClick={() => pick(c.code)}
              className="group w-full text-left rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(20,58,42,0.05)", border: "1px solid rgba(20,58,42,0.12)" }}
            >
              <div>
                <div className="font-mono tracking-[0.25em] text-sm" style={{ color: INK }}>
                  {c.code}
                </div>
                <div className="text-xs text-foreground/65 mt-0.5">{c.label}</div>
              </div>
              <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* ─── MANAGER ─── */
export function PopupManager() {
  const { active, open, markShown, hasShown, appliedCoupon } = usePopups();
  const { pathname } = useRouterState({ select: (s) => s.location });
  const fetchCfg = useServerFn(getPopupSettings);
  const { data } = useQuery({
    queryKey: ["popup-settings"],
    queryFn: () => fetchCfg(),
    staleTime: 60_000,
  });
  const cfg = data?.config;
  const setStarterKitQty = useCart((s) => s.setStarterKitQty);

  // Sync persisted coupon to cart-store every load
  useEffect(() => {
    if (appliedCoupon) useCart.setState({} as never); // no-op to keep references
  }, [appliedCoupon]);

  // Suppress popups on admin/checkout/auth/account
  const suppress = /^\/(admin|checkout|auth|account|order)/.test(pathname);

  /* Low stock toast — premium card */
  useEffect(() => {
    if (!cfg?.lowStock.enabled || suppress) return;
    if (hasShown("lowStock", 1000 * 60 * 60 * 6)) return;
    const t = setTimeout(() => {
      const count = cfg.lowStock.stockCount;
      const msg = cfg.lowStock.message.replace("{count}", String(count));
      toast.custom(
        () => (
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 w-[320px] max-w-[92vw]"
            style={{
              background: "linear-gradient(180deg,#FFFDF7 0%,#F7F1E5 100%)",
              boxShadow: "0 20px 50px -16px rgba(20,58,42,0.35), 0 0 0 1px rgba(201,168,106,0.3)",
            }}
          >
            <div
              className="h-10 w-10 rounded-full grid place-items-center shrink-0"
              style={{ background: `linear-gradient(135deg,${GOLD} 0%,#E8C98A 100%)` }}
            >
              <Package className="h-4 w-4" style={{ color: INK }} />
            </div>
            <div className="min-w-0">
              <div
                className="text-[10px] tracking-[0.28em] uppercase font-semibold"
                style={{ color: GOLD }}
              >
                Low stock
              </div>
              <div className="text-[13px] leading-snug font-medium" style={{ color: INK }}>
                {msg}
              </div>
            </div>
          </div>
        ),
        {
          duration: 6500,
          position:
            typeof window !== "undefined" && window.innerWidth < 640
              ? "bottom-center"
              : "bottom-left",
        },
      );
      markShown("lowStock");
    }, cfg.lowStock.delaySeconds * 1000);
    return () => clearTimeout(t);
  }, [cfg, suppress, hasShown, markShown]);

  /* Social proof rotating toasts */
  useEffect(() => {
    if (!cfg?.socialProof.enabled || suppress) return;
    const msgs = cfg.socialProof.messages;
    if (!msgs.length) return;
    let i = Math.floor(Math.random() * msgs.length);
    const schedule = () => {
      const lo = Math.max(10, cfg.socialProof.minIntervalSeconds) * 1000;
      const hi = Math.max(lo, cfg.socialProof.maxIntervalSeconds * 1000);
      const delay = lo + Math.random() * (hi - lo);
      return window.setTimeout(() => {
        const raw = msgs[i % msgs.length];
        const parts = raw.split("|").map((s) => s.trim());
        const [name, city, product, when] =
          parts.length >= 3
            ? [parts[0], parts[1], parts[2], parts[3] ?? "just now"]
            : [raw, "", "", "just now"];
        const initial = (name?.[0] ?? "•").toUpperCase();
        toast.custom(
          () => (
            <div
              className="flex items-center gap-3 rounded-2xl pl-2 pr-4 py-2.5 w-[340px] max-w-[92vw]"
              style={{
                background: "rgba(255,253,247,0.98)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 18px 44px -16px rgba(20,58,42,0.32), 0 0 0 1px rgba(20,58,42,0.06)",
              }}
            >
              <div
                className="h-10 w-10 rounded-full grid place-items-center text-sm font-serif shrink-0"
                style={{
                  background: `linear-gradient(135deg,${INK} 0%,#1F5A40 100%)`,
                  color: IVORY,
                }}
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold truncate" style={{ color: INK }}>
                    {name}
                  </span>
                  {city && (
                    <span className="text-[11px] text-foreground/55 truncate">· {city}</span>
                  )}
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                </div>
                {product && (
                  <div className="text-[12px] text-foreground/70 truncate">
                    Verified order · <span style={{ color: INK }}>{product}</span>
                  </div>
                )}
                <div className="text-[10px] tracking-[0.18em] uppercase text-foreground/45 mt-0.5">
                  {when}
                </div>
              </div>
            </div>
          ),
          {
            duration: 5500,
            position:
              typeof window !== "undefined" && window.innerWidth < 640
                ? "bottom-center"
                : "bottom-left",
          },
        );
        i += 1;
        handle = schedule();
      }, delay);
    };
    let handle = schedule();
    return () => clearTimeout(handle);
  }, [cfg, suppress]);

  /* Coupon reward — fires once 15s after landing, never again until cooldown */
  useEffect(() => {
    if (!cfg?.couponReward.enabled || suppress) return;
    if (hasShown("couponReward")) return;
    // Mark as shown immediately so re-renders / route changes can't re-queue it
    markShown("couponReward");
    const t = window.setTimeout(() => {
      open("couponReward");
    }, 15_000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg?.couponReward.enabled, suppress]);

  /* Exit intent — desktop mouseleave, mobile rapid up-scroll, inactivity */
  useEffect(() => {
    if (!cfg?.exitIntent.enabled || suppress) return;
    if (hasShown("exitIntent")) return;
    let fired = false;
    const trigger = () => {
      if (fired) return;
      fired = true;
      markShown("exitIntent");
      cleanup();
      open("exitIntent");
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    let lastY = window.scrollY;
    let lastT = Date.now();
    const onScroll = () => {
      const dy = window.scrollY - lastY;
      const dt = Date.now() - lastT;
      if (dy < -120 && dt < 300 && window.scrollY < 400) trigger();
      lastY = window.scrollY;
      lastT = Date.now();
    };
    let idleT = window.setTimeout(trigger, cfg.exitIntent.inactivitySeconds * 1000);
    const resetIdle = () => {
      clearTimeout(idleT);
      idleT = window.setTimeout(trigger, cfg.exitIntent.inactivitySeconds * 1000);
    };
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    ["mousemove", "keydown", "touchstart", "click"].forEach((ev) =>
      window.addEventListener(ev, resetIdle, { passive: true }),
    );
    const cleanup = () => {
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      ["mousemove", "keydown", "touchstart", "click"].forEach((ev) =>
        window.removeEventListener(ev, resetIdle),
      );
      clearTimeout(idleT);
    };
    return cleanup;
  }, [cfg, suppress, hasShown, open, markShown, setStarterKitQty]);

  if (!cfg) return null;
  if (active === "bundleUpgrade" && cfg.bundleUpgrade.enabled)
    return <BundleUpgradeDialog cfg={cfg.bundleUpgrade} />;
  if (active === "exitIntent" && cfg.exitIntent.enabled)
    return <ExitIntentDialog cfg={cfg.exitIntent} />;
  if (active === "couponReward" && cfg.couponReward.enabled)
    return <CouponRewardDialog cfg={cfg.couponReward} />;
  return null;
}

/* Hook used by "Add Starter Kit" CTAs */
export function useTryBundleUpgrade() {
  const { open, setBundleResolver, hasShown, markShown } = usePopups();
  const fetchCfg = useServerFn(getPopupSettings);
  const { data } = useQuery({
    queryKey: ["popup-settings"],
    queryFn: () => fetchCfg(),
    staleTime: 60_000,
  });
  return (currentQty: number) =>
    new Promise<"upgrade" | "single">((resolve) => {
      const cfg = data?.config.bundleUpgrade;
      const eligible = cfg?.enabled && currentQty < 2 && !hasShown("bundleUpgrade", 1000 * 60 * 60);
      if (!eligible) return resolve("single");
      const opened = open("bundleUpgrade");
      if (!opened) return resolve("single");
      markShown("bundleUpgrade");
      setBundleResolver((upgrade) => resolve(upgrade ? "upgrade" : "single"));
    });
}
