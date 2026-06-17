import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Zap,
  Check,
  Truck,
  Lock,
  BadgeCheck,
  ShieldCheck,
  Users,
  Star,
  Sparkles,
} from "lucide-react";

import { useAddStarterKit, useBuyNow } from "@/lib/buy-actions";

const BG_DEEP = "#0E2F25";
const BG_MID = "#173E31";
const INK = "#F4ECDC";
const MUTED = "rgba(244,236,220,0.66)";
const ACCENT = "#E8C98A";

const INCLUDED = [
  "Daily Clean",
  "Glow Repair",
  "Deep Detox",
  "28-Day Guided Ritual",
  "Ayurvedic Ingredients",
  "Made For Indian Skin",
];

const TRUST = [
  { Icon: Truck, label: "Free Shipping" },
  { Icon: BadgeCheck, label: "COD Available" },
  { Icon: Lock, label: "Secure Checkout" },
  { Icon: ShieldCheck, label: "7-Day Promise" },
  { Icon: Users, label: "7,200+ Customers" },
];

export function Reset() {
  const addToCart = useAddStarterKit();
  const buyNow = useBuyNow();

  const [stock, setStock] = useState(37);

  useEffect(() => {
    const t = setInterval(() => setStock((s) => (s > 12 ? s - 1 : s)), 14000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="checkout"
      aria-label="Final Purchase"
      className="relative w-full overflow-hidden px-3 sm:px-6 py-12 md:py-16 lg:py-20"
      style={{
        background: `radial-gradient(120% 80% at 80% 0%, ${BG_MID} 0%, ${BG_DEEP} 60%, #0A2620 100%)`,
      }}
    >
      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.15]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* Ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 35% at 75% 25%, rgba(232,201,138,0.20) 0%, rgba(232,201,138,0) 60%), radial-gradient(45% 45% at 15% 90%, rgba(232,201,138,0.08) 0%, rgba(232,201,138,0) 60%)",
          animation: "resetGlow 12s ease-in-out infinite",
        }}
      />

      <div className="relative mx-auto max-w-[1240px]" style={{ color: INK }}>
        {/* Header */}
        <div className="text-center max-w-[820px] mx-auto">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[9.5px] tracking-[0.35em] uppercase mb-5"
            style={{
              color: ACCENT,
              border: `1px solid ${ACCENT}55`,
              background: "rgba(232,201,138,0.06)",
            }}
          >
            <Sparkles className="h-3 w-3" />
            Final Step · Begin Your Reset
          </div>
          <h2
            className="font-serif leading-[1.02] tracking-[-0.02em] font-light text-[clamp(1.9rem,4.6vw,3.8rem)]"
            style={{ color: INK }}
          >
            Ready For{" "}
            <span className="italic" style={{ color: ACCENT }}>
              Clearer Skin?
            </span>
            <br />
            Start Your 28-Day Skin Reset Today.
          </h2>
          <p
            className="mt-4 mx-auto max-w-[560px] text-[13.5px] md:text-[14.5px] leading-[1.65]"
            style={{ color: MUTED }}
          >
            Join <span style={{ color: INK }}>7,200+ customers</span> who simplified their skincare
            routine with VedaGlows.
          </p>
        </div>

        {/* Main grid */}
        <div className="mt-8 md:mt-12 grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-10 items-center">
          {/* LEFT — product image */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-[50%]"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(232,201,138,0.32), rgba(232,201,138,0) 70%)",
                filter: "blur(34px)",
              }}
            />
            <div
              className="relative rounded-[24px] overflow-hidden"
              style={{
                background: "linear-gradient(160deg, rgba(244,236,220,0.06), rgba(0,0,0,0.25))",
                border: "1px solid rgba(232,201,138,0.18)",
                boxShadow:
                  "0 50px 100px -40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(244,236,220,0.08)",
              }}
            >
              <div style={{ animation: "resetFloat 7s ease-in-out infinite" }}>
                <img
                  decoding="async"
                  src={"/assets/kit-reset-hero.png"}
                  alt="VedaGlows 28-Day Skin Reset Starter Kit with Daily Clean, Glow Repair, and Deep Detox"
                  className="w-full h-auto"
                  draggable={false}
                />
              </div>

              {/* Best seller */}
              <div
                className="absolute top-3 left-3 px-3 py-1.5 rounded-full backdrop-blur-md text-[9px] tracking-[0.3em] uppercase flex items-center gap-1.5"
                style={{
                  background: "rgba(14,47,37,0.78)",
                  border: `1px solid ${ACCENT}66`,
                  color: ACCENT,
                }}
              >
                <Sparkles className="h-2.5 w-2.5" />
                Best Seller
              </div>

              {/* Limited batch */}
              <div
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full backdrop-blur-md text-[9px] tracking-[0.28em] uppercase flex items-center gap-1.5"
                style={{
                  background: "rgba(14,47,37,0.78)",
                  border: "1px solid rgba(247,215,160,0.4)",
                  color: "#F7D7A0",
                  animation: "resetPulse 2.4s ease-in-out infinite",
                }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                    style={{ background: "#F7D7A0" }}
                  />
                  <span
                    className="relative inline-flex h-1.5 w-1.5 rounded-full"
                    style={{ background: "#F7D7A0" }}
                  />
                </span>
                Only {stock} Kits Left
              </div>
            </div>

            {/* Testimonial under image (desktop) */}
            <div
              className="hidden lg:flex items-start gap-3 mt-5 rounded-2xl p-4"
              style={{
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(244,236,220,0.10)",
              }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif italic"
                style={{ background: ACCENT, color: BG_DEEP }}
              >
                P
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[11px]" style={{ color: ACCENT }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <p
                  className="italic font-serif text-[14px] leading-snug mt-1"
                  style={{ color: INK }}
                >
                  "My skin looked calmer and brighter within weeks."
                </p>
                <div
                  className="mt-1 text-[9px] tracking-[0.28em] uppercase"
                  style={{ color: MUTED }}
                >
                  Priya · Verified Customer
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — purchase panel */}
          <div
            className="rounded-[24px] p-5 sm:p-7"
            style={{
              background: "rgba(244,236,220,0.04)",
              border: `1px solid ${ACCENT}33`,
              boxShadow: "inset 0 1px 0 rgba(244,236,220,0.08), 0 30px 60px -40px rgba(0,0,0,0.5)",
            }}
          >
            {/* Price block */}
            <div className="text-[9px] tracking-[0.35em] uppercase mb-2" style={{ color: ACCENT }}>
              28-Day Starter Kit
            </div>
            <div className="flex items-end flex-wrap gap-x-4 gap-y-2">
              <div
                className="font-serif leading-none"
                style={{ fontSize: "clamp(56px, 7vw, 88px)", color: INK }}
              >
                ₹499
              </div>
              <div className="flex flex-col pb-2 gap-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase opacity-65"
                    style={{ color: MUTED }}
                  >
                    MRP
                  </span>
                  <span
                    className="text-[16px] line-through opacity-60 font-serif"
                    style={{ color: MUTED }}
                  >
                    ₹1299
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[10px] tracking-[0.28em] uppercase px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: ACCENT, color: BG_DEEP }}
                  >
                    62% Off
                  </span>
                  <span
                    className="text-[10px] tracking-[0.28em] uppercase px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(232,201,138,0.15)",
                      color: ACCENT,
                      border: `1px solid ${ACCENT}55`,
                    }}
                  >
                    Save ₹800
                  </span>
                </div>
              </div>
            </div>

            {/* What's included */}
            <div className="mt-5">
              <div
                className="text-[9px] tracking-[0.35em] uppercase mb-2.5"
                style={{ color: ACCENT }}
              >
                What's Included
              </div>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
                {INCLUDED.map((it) => (
                  <li
                    key={it}
                    className="flex items-center gap-2 text-[12.5px]"
                    style={{ color: INK }}
                  >
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: "rgba(232,201,138,0.18)",
                        border: `1px solid ${ACCENT}55`,
                      }}
                    >
                      <Check className="h-2.5 w-2.5" style={{ color: ACCENT }} />
                    </span>
                    {it}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
              <button
                onClick={addToCart}
                className="group inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-[11px] tracking-[0.3em] uppercase font-semibold transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${INK} 0%, #FFF8E8 50%, ${ACCENT} 100%)`,
                  color: BG_DEEP,
                  backgroundSize: "200% 200%",
                  boxShadow:
                    "0 20px 40px -14px rgba(0,0,0,0.55), 0 0 0 1px rgba(244,236,220,0.25), 0 0 30px -8px rgba(232,201,138,0.4)",
                  animation: "resetShimmer 3s ease-in-out infinite",
                }}
              >
                <ShoppingBag className="h-4 w-4 transition-transform duration-500 group-hover:scale-110" />
                Add Starter Kit To Cart
              </button>
              <button
                onClick={buyNow}
                className="group inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-[11px] tracking-[0.3em] uppercase font-semibold transition-all duration-300 hover:bg-white/5"
                style={{
                  background: "transparent",
                  color: INK,
                  border: `1px solid ${ACCENT}66`,
                }}
              >
                <Zap className="h-4 w-4" style={{ color: ACCENT }} />
                Buy Now
              </button>
            </div>

            {/* Trust */}
            <div
              className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 text-[10px]"
              style={{ color: MUTED }}
            >
              {TRUST.map(({ Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <Icon className="h-3 w-3" style={{ color: ACCENT }} />
                  {label}
                </span>
              ))}
            </div>

            {/* Testimonial (mobile only) */}
            <div
              className="lg:hidden mt-5 flex items-start gap-3 rounded-2xl p-4"
              style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(244,236,220,0.10)" }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif italic"
                style={{ background: ACCENT, color: BG_DEEP }}
              >
                P
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[11px]" style={{ color: ACCENT }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-current" />
                  ))}
                </div>
                <p
                  className="italic font-serif text-[13.5px] leading-snug mt-1"
                  style={{ color: INK }}
                >
                  "My skin looked calmer and brighter within weeks."
                </p>
                <div
                  className="mt-1 text-[9px] tracking-[0.28em] uppercase"
                  style={{ color: MUTED }}
                >
                  Priya · Verified Customer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes resetFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes resetGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes resetPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(247,215,160,0.35); }
          50% { box-shadow: 0 0 0 8px rgba(247,215,160,0); }
        }
        @keyframes resetShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
}
