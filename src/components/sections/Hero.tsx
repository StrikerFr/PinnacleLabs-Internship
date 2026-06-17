import { useEffect, useRef, useState } from "react";
import { useAddStarterKit, useBuyNow } from "@/lib/buy-actions";

import {
  Play,
  Star,
  ArrowRight,
  ShoppingCart,
  Zap,
  Truck,
  BadgeCheck,
  ShieldCheck,
  Leaf,
  Users,
  Sparkles,
} from "lucide-react";

const dailyClean = "https://kdvhmvy9l6gqbosc.public.blob.vercel-storage.com/dailyclean.png";

const glowRepair = "https://kdvhmvy9l6gqbosc.public.blob.vercel-storage.com/glowrepair.png";

const deepDetox = "https://kdvhmvy9l6gqbosc.public.blob.vercel-storage.com/deepdetox.png";

const leaf1 = "/assets/leaf-1.png";

const leaf2 = "/assets/leaf-2.png";

const turmeric = "/assets/turmeric.png";

const TRUST_PILLS = [
  { icon: Truck, label: "Free Shipping" },
  { icon: BadgeCheck, label: "COD Available" },
  { icon: ShieldCheck, label: "7-Day Promise" },
  { icon: Leaf, label: "100% Ayurvedic" },
  { icon: Sparkles, label: "Herbal Formulations" },
  { icon: ShieldCheck, label: "No Harsh Chemicals" },
  { icon: BadgeCheck, label: "Made in India" },
  { icon: Users, label: "Suitable for All Skin Types" },
  { icon: Leaf, label: "Inspired by Ayurveda" },
];

const TRUST_ICONS = [
  { icon: Users, label: "7,200+ Happy Customers" },
  { icon: Sparkles, label: "3-Step Daily Ritual" },
  { icon: Leaf, label: "Ayurvedic Ingredients" },
  { icon: ShieldCheck, label: "7-Day Satisfaction Promise" },
];

export function Hero() {
  const addToCart = useAddStarterKit();
  const buyNow = useBuyNow();

  const stageRef = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    // Skip parallax on touch / coarse-pointer devices (mobile, tablet)
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(hover: none), (pointer: coarse), (max-width: 1023px)").matches
    ) {
      return;
    }
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setM({
          x: (e.clientX - r.left) / r.width - 0.5,
          y: (e.clientY - r.top) / r.height - 0.5,
        });
      });
    };
    const onLeave = () => setM({ x: 0, y: 0 });
    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const tf = (dx: number, dy: number, rot = 0) =>
    `translate3d(${m.x * dx}px, ${m.y * dy}px, 0) rotate(${rot}deg)`;
  const trans = "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)";

  const ContactShadow = ({ w = "78%", o = 0.35 }: { w?: string; o?: number }) => (
    <div
      aria-hidden
      className="absolute left-1/2 -translate-x-1/2 -bottom-4 h-6 rounded-[50%]"
      style={{
        width: w,
        background: `radial-gradient(ellipse at center, rgba(40,28,14,${o}), rgba(0,0,0,0) 70%)`,
        filter: "blur(10px)",
      }}
    />
  );

  return (
    <section className="relative w-full overflow-hidden grain pt-24 lg:pt-28">
      {/* ——— Top Trust Bar (auto-scrolling marquee) ——— */}
      <div className="relative z-20 border-y border-foreground/10 bg-[color:var(--ivory)]/80 backdrop-blur-md overflow-hidden">
        <div
          className="relative flex"
          style={{
            maskImage: "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)",
          }}
        >
          <ul
            className="flex items-center gap-2.5 py-2.5 pr-2.5 shrink-0"
            style={{ animation: "trust-marquee 38s linear infinite" }}
          >
            {[...TRUST_PILLS, ...TRUST_PILLS].map(({ icon: Icon, label }, i) => (
              <li
                key={i}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-foreground/10 bg-white/60 px-3.5 py-1.5 text-[10.5px] tracking-[0.14em] uppercase text-foreground/75"
              >
                <Icon className="h-3 w-3" strokeWidth={1.8} style={{ color: "#143A2A" }} />
                {label}
              </li>
            ))}
          </ul>
          <ul
            aria-hidden
            className="flex items-center gap-2.5 py-2.5 pr-2.5 shrink-0"
            style={{ animation: "trust-marquee 38s linear infinite" }}
          >
            {[...TRUST_PILLS, ...TRUST_PILLS].map(({ icon: Icon, label }, i) => (
              <li
                key={i}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-foreground/10 bg-white/60 px-3.5 py-1.5 text-[10.5px] tracking-[0.14em] uppercase text-foreground/75"
              >
                <Icon className="h-3 w-3" strokeWidth={1.8} style={{ color: "#143A2A" }} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ——— Atmosphere ——— */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 75% 20%, rgba(255,232,190,0.55) 0%, rgba(247,243,236,0) 65%), radial-gradient(45% 40% at 15% 85%, rgba(190,210,175,0.30) 0%, rgba(247,243,236,0) 70%), radial-gradient(80% 60% at 50% 110%, rgba(60,80,55,0.10) 0%, rgba(247,243,236,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[5%] top-[8%] h-[60vh] w-[60vh] lg:h-[85vh] lg:w-[85vh] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,228,190,0.7), rgba(247,243,236,0) 70%)",
          filter: "blur(12px)",
          animation: "glow-pulse 14s ease-in-out infinite",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-4 md:px-6 pt-6 md:pt-10 pb-10">
        <div ref={stageRef} className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* ——— LEFT (mobile = top stack) ——— */}
          <div
            className="lg:col-span-5 relative z-10 order-1"
            style={{ animation: "fade-up 1s ease-out both" }}
          >
            {/* Badge */}
            <div className="flex items-center gap-3 text-[10.5px] md:text-[11px] tracking-[0.28em] md:tracking-[0.32em] uppercase text-foreground/60">
              <span className="h-px w-6 md:w-8 bg-foreground/30" />
              Ayurvedic Skin Reset System
            </div>

            {/* Headline */}
            <h1 className="font-serif mt-4 md:mt-7 text-foreground leading-[0.95] tracking-[-0.02em] text-[clamp(2.4rem,9vw,5.6rem)] font-light">
              Clear Skin.
              <br />
              <span className="italic text-primary/90">Without</span> The
              <br />
              Guesswork.
            </h1>

            <p className="mt-4 md:mt-5 max-w-[460px] text-[14.5px] md:text-[15px] leading-[1.7] text-foreground/65 font-light">
              A simple 28-day Ayurvedic ritual designed to reduce breakouts, balance oil, and
              restore your natural glow.
            </p>

            {/* Social proof — never hidden */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5"
                      style={{ fill: "#E8C98A", color: "#E8C98A" }}
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <span className="text-[12px] font-medium text-foreground/85">4.8/5</span>
              </div>
              <span className="h-3.5 w-px bg-foreground/15" />
              <span className="text-[12px] text-foreground/70">
                <span className="font-medium text-foreground/85">7,200+</span> Happy Customers
              </span>
              <span className="h-3.5 w-px bg-foreground/15 hidden sm:inline-block" />
              <span className="hidden sm:inline text-[12px] text-foreground/70">
                Formulated for <span className="font-medium text-foreground/85">Indian Skin</span>
              </span>
            </div>

            {/* MOBILE: Products appear here in the flow */}
            <div className="lg:hidden mt-8">
              <MobileProductShowcase
                dailyClean={dailyClean}
                glowRepair={glowRepair}
                deepDetox={deepDetox}
              />
            </div>

            {/* Pricing Card — visible before scroll */}
            <div
              id="hero-pricing"
              className="mt-7 rounded-3xl p-5 md:p-6 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(247,243,236,0.7) 100%)",
                border: "1px solid rgba(20,58,42,0.10)",
                boxShadow:
                  "0 24px 60px -28px rgba(60,40,20,0.25), 0 1px 0 rgba(255,255,255,0.8) inset",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10.5px] tracking-[0.22em] uppercase text-foreground/55">
                    The Starter Kit · 3 Products
                  </div>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="font-serif text-[2.4rem] md:text-[2.6rem] leading-none text-foreground">
                      ₹499
                    </span>
                    <span className="text-[15px] text-foreground/45 line-through">₹1299</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className="text-[10.5px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #C9A86A 0%, #E8C98A 100%)",
                      color: "#143A2A",
                    }}
                  >
                    62% OFF
                  </span>
                  <span
                    className="text-[10px] tracking-[0.16em] uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(20,58,42,0.08)",
                      color: "#143A2A",
                    }}
                  >
                    You Save ₹800
                  </span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={addToCart}
                  className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 text-[12px] tracking-[0.18em] uppercase text-primary-foreground transition-all duration-500 hover:-translate-y-0.5 flex-1"
                  style={{
                    minHeight: 56,
                    background: "linear-gradient(135deg, #143A2A 0%, #1F5A40 100%)",
                    boxShadow:
                      "0 22px 44px -18px rgba(20,58,42,0.55), 0 0 0 1px rgba(232,201,138,0.22) inset",
                  }}
                >
                  <ShoppingCart className="h-4 w-4" strokeWidth={1.8} />
                  <span>Add To Cart</span>
                </button>
                <button
                  onClick={buyNow}
                  className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 text-[12px] tracking-[0.18em] uppercase transition-all duration-500 hover:-translate-y-0.5 flex-1"
                  style={{
                    minHeight: 56,
                    background: "linear-gradient(135deg, #E8C98A 0%, #C9A86A 100%)",
                    color: "#143A2A",
                    boxShadow:
                      "0 22px 44px -18px rgba(201,168,106,0.6), 0 0 0 1px rgba(20,58,42,0.15) inset",
                  }}
                >
                  <Zap className="h-4 w-4" strokeWidth={2} />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Trust icon grid */}
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {TRUST_ICONS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    border: "1px solid rgba(20,58,42,0.08)",
                  }}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(20,58,42,0.08)",
                      color: "#143A2A",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </span>
                  <span className="text-[11.5px] leading-tight text-foreground/80">{label}</span>
                </div>
              ))}
            </div>

            {/* Urgency strip */}
            <div
              className="mt-6 flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(20,58,42,0.95) 0%, rgba(31,90,64,0.95) 100%)",
                boxShadow: "0 20px 44px -22px rgba(20,58,42,0.7)",
              }}
            >
              <div className="min-w-0">
                <div
                  className="text-[9.5px] tracking-[0.24em] uppercase"
                  style={{ color: "#E8C98A" }}
                >
                  ✦ Limited Time Offer
                </div>
                <div className="mt-1 text-[12.5px] leading-tight text-[color:var(--ivory)]/95">
                  Get the complete 3-step ritual at our launch price.
                </div>
              </div>
              <button
                onClick={() =>
                  document
                    .getElementById("starter-kit")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="shrink-0 inline-flex items-center gap-1.5 text-[10.5px] tracking-[0.18em] uppercase rounded-full px-3.5 py-2"
                style={{
                  background: "rgba(232,201,138,0.18)",
                  border: "1px solid rgba(232,201,138,0.45)",
                  color: "#E8C98A",
                }}
              >
                Claim
                <ArrowRight className="h-3 w-3" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* ——— RIGHT (desktop only product composition) ——— */}
          <div className="hidden lg:block lg:col-span-7 relative h-[680px] xl:h-[740px] order-2">
            {/* Decorative V */}
            <div
              aria-hidden
              className="absolute inset-0 flex items-center justify-center font-serif italic text-[26rem] leading-none text-foreground/[0.03] select-none"
              style={{ transform: tf(-5, -3), transition: trans }}
            >
              V
            </div>

            {/* Warm cream-to-beige backdrop wash */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 70% at 50% 55%, rgba(244,230,205,0.55) 0%, rgba(247,243,236,0) 70%)",
              }}
            />

            {/* Center sun halo — golden glow behind the hero jar */}
            <div
              aria-hidden
              className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 h-[560px] w-[560px] rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,218,160,0.85) 0%, rgba(255,205,140,0.32) 38%, rgba(247,243,236,0) 78%)",
                filter: "blur(18px)",
                animation: "glow-pulse 11s ease-in-out infinite",
              }}
            />

            {/* Subtle ritual arc — curved light trail connecting the 3 jars */}
            <svg
              aria-hidden
              viewBox="0 0 600 500"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ filter: "blur(0.6px)" }}
            >
              <defs>
                <linearGradient id="ritual-arc" x1="0" x2="1">
                  <stop offset="0%" stopColor="#C9A86A" stopOpacity="0" />
                  <stop offset="50%" stopColor="#E8C98A" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#C9A86A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 110 360 Q 300 60 500 340"
                fill="none"
                stroke="url(#ritual-arc)"
                strokeWidth="1.2"
                strokeDasharray="2 6"
              />
            </svg>

            {/* Soft floor shadow */}
            <div
              aria-hidden
              className="absolute left-1/2 -translate-x-1/2 bottom-[8%] h-16 w-[72%] rounded-[50%]"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(50,35,18,0.35) 0%, rgba(50,35,18,0.18) 35%, rgba(0,0,0,0) 72%)",
                filter: "blur(22px)",
              }}
            />

            {/* Ambient botanicals — soft, blurred, only a few */}
            <img
              decoding="async"
              src={leaf1}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute -top-2 right-[6%] w-[120px] opacity-70"
              style={{
                transform: tf(-26, -18, 22),
                transition: trans,
                animation: "float-slower 11s ease-in-out infinite",
                filter: "drop-shadow(0 18px 18px rgba(40,60,30,0.15)) blur(1.2px)",
              }}
            />
            <img
              decoding="async"
              src={leaf2}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute top-[14%] left-[2%] w-[125px] opacity-65"
              style={{
                transform: tf(-22, -14, -24),
                transition: trans,
                animation: "float-slow 9s ease-in-out 0.6s infinite",
                filter: "drop-shadow(0 16px 16px rgba(40,60,30,0.15)) blur(1.4px)",
              }}
            />
            <img
              decoding="async"
              src={turmeric}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute bottom-[18%] left-[14%] w-[78px] opacity-80"
              style={{
                transform: tf(28, 18, -18),
                transition: trans,
                animation: "float-slow 10s ease-in-out 1.2s infinite",
                filter: "drop-shadow(0 12px 12px rgba(120,70,20,0.22)) blur(0.8px)",
              }}
            />

            {/* Floating premium badge */}
            <div
              className="absolute top-[6%] left-[12%] z-30 opacity-0"
              style={{
                animation: "fade-up 1s 0.9s ease-out both, float-slower 9s ease-in-out 2s infinite",
                transform: tf(-8, -6),
                transition: trans,
              }}
            >
              <div
                className="flex items-center gap-2 rounded-full pl-1.5 pr-3.5 py-1.5"
                style={{
                  background: "rgba(247,243,236,0.85)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(201,168,106,0.45)",
                  boxShadow:
                    "0 18px 36px -18px rgba(60,40,15,0.35), 0 1px 0 rgba(255,255,255,0.7) inset",
                }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
                  style={{
                    background: "linear-gradient(135deg, #C9A86A 0%, #E8C98A 100%)",
                    color: "#143A2A",
                  }}
                >
                  ✦
                </span>
                <span
                  className="text-[10px] tracking-[0.22em] uppercase font-medium"
                  style={{ color: "#143A2A" }}
                >
                  3-Step Ritual · 28-Day Reset
                </span>
              </div>
            </div>

            {/* TOP CENTER — Deep Detox (back layer) */}
            <div
              className="absolute left-1/2 top-[8%] -translate-x-1/2 w-[40%] max-w-[380px] opacity-0 z-10"
              style={{
                transform: tf(-12, -7),
                transition: trans,
                animation:
                  "fade-up 1.2s 0.25s ease-out both, float-slow 6.5s ease-in-out 1.6s infinite",
              }}
            >
              <div className="relative">
                <img
                  decoding="async"
                  src={deepDetox}
                  alt="VedaGlows Deep Detox"
                  className="relative w-full h-auto transition-transform duration-700 hover:scale-[1.04]"
                  style={{
                    transform: "rotate(-4deg)",
                    filter:
                      "drop-shadow(0 42px 38px rgba(60,30,15,0.42)) drop-shadow(0 0 22px rgba(255,220,170,0.32))",
                  }}
                />
                <ContactShadow w="62%" o={0.42} />
              </div>
            </div>

            {/* BOTTOM LEFT — Glow Repair (front, overlaps center) */}
            <div
              className="absolute left-[8%] bottom-[12%] w-[42%] max-w-[380px] opacity-0 z-20"
              style={{
                transform: tf(16, 9),
                transition: trans,
                animation:
                  "fade-up 1.2s 0.45s ease-out both, float-slower 7.5s ease-in-out 1.8s infinite",
              }}
            >
              <div className="relative">
                <img
                  decoding="async"
                  src={glowRepair}
                  alt="VedaGlows Glow Repair"
                  className="relative w-full h-auto transition-transform duration-700 hover:scale-[1.04]"
                  style={{
                    transform: "rotate(4deg)",
                    filter:
                      "drop-shadow(0 48px 42px rgba(140,100,30,0.42)) drop-shadow(0 0 20px rgba(255,220,170,0.28))",
                  }}
                />
                <ContactShadow w="70%" o={0.46} />
              </div>
            </div>

            {/* BOTTOM RIGHT — Daily Clean (front, overlaps center) */}
            <div
              className="absolute right-[6%] bottom-[8%] w-[44%] max-w-[400px] opacity-0 z-20"
              style={{
                transform: tf(18, 11),
                transition: trans,
                animation:
                  "fade-up 1.2s 0.65s ease-out both, float-slow 7s ease-in-out 2s infinite",
              }}
            >
              <div className="relative">
                <img
                  decoding="async"
                  src={dailyClean}
                  alt="VedaGlows Daily Clean"
                  className="relative w-full h-auto transition-transform duration-700 hover:scale-[1.04]"
                  style={{
                    transform: "rotate(-3deg)",
                    filter:
                      "drop-shadow(0 52px 46px rgba(40,60,30,0.45)) drop-shadow(0 0 22px rgba(220,235,200,0.32))",
                  }}
                />
                <ContactShadow w="70%" o={0.46} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.78; transform: translateX(-50%) scale(1.04); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
        @keyframes trust-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </section>
  );
}

/* ——————————————————————————————————————————————————————
   Mobile-only product showcase (3 jars, prominent)
—————————————————————————————————————————————————————— */
function MobileProductShowcase({
  dailyClean,
  glowRepair,
  deepDetox,
}: {
  dailyClean: string;
  glowRepair: string;
  deepDetox: string;
}) {
  return (
    <div className="relative h-[330px] sm:h-[380px]">
      {/* Golden halo behind center */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,218,160,0.78), rgba(247,243,236,0) 72%)",
          filter: "blur(16px)",
          animation: "glow-pulse 11s ease-in-out infinite",
        }}
      />

      {/* Curved ritual arc */}
      <svg
        aria-hidden
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <linearGradient id="ritual-arc-mobile" x1="0" x2="1">
            <stop offset="0%" stopColor="#C9A86A" stopOpacity="0" />
            <stop offset="50%" stopColor="#E8C98A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#C9A86A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 50 150 Q 150 30 250 150"
          fill="none"
          stroke="url(#ritual-arc-mobile)"
          strokeWidth="1"
          strokeDasharray="2 5"
        />
      </svg>

      {/* Soft floor shadow */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 bottom-2 h-10 w-[80%] rounded-[50%]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(50,35,18,0.32), rgba(0,0,0,0) 72%)",
          filter: "blur(16px)",
        }}
      />

      {/* Floating mini badge */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 z-30"
        style={{ animation: "fade-up 0.9s 0.6s ease-out both" }}
      >
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1"
          style={{
            background: "rgba(247,243,236,0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(201,168,106,0.45)",
            boxShadow: "0 10px 24px -12px rgba(60,40,15,0.3)",
          }}
        >
          <span className="text-[10px]" style={{ color: "#C9A86A" }}>
            ✦
          </span>
          <span
            className="text-[8.5px] tracking-[0.2em] uppercase font-medium"
            style={{ color: "#143A2A" }}
          >
            3-Step Ritual
          </span>
        </div>
      </div>

      {/* TOP CENTER — Deep Detox (back) */}
      <div
        className="absolute left-1/2 top-[12%] -translate-x-1/2 w-[42%] z-10"
        style={{
          animation: "fade-up 0.9s 0.15s ease-out both, float-slow 7s ease-in-out 1.4s infinite",
        }}
      >
        <img
          decoding="async"
          src={deepDetox}
          alt="VedaGlows Deep Detox"
          className="w-full h-auto"
          style={{
            transform: "rotate(-4deg)",
            filter:
              "drop-shadow(0 22px 18px rgba(60,30,15,0.4)) drop-shadow(0 0 14px rgba(255,220,170,0.28))",
          }}
        />
      </div>

      {/* BOTTOM LEFT — Glow Repair (front, overlaps) */}
      <div
        className="absolute left-[2%] bottom-[8%] w-[44%] z-20"
        style={{
          animation: "fade-up 0.9s 0.3s ease-out both, float-slower 8s ease-in-out 1.6s infinite",
        }}
      >
        <img
          decoding="async"
          src={glowRepair}
          alt="VedaGlows Glow Repair"
          className="w-full h-auto"
          style={{
            transform: "rotate(4deg)",
            filter:
              "drop-shadow(0 26px 20px rgba(140,100,30,0.42)) drop-shadow(0 0 14px rgba(255,220,170,0.25))",
          }}
        />
      </div>

      {/* BOTTOM RIGHT — Daily Clean (front, overlaps) */}
      <div
        className="absolute right-[0%] bottom-[6%] w-[46%] z-20"
        style={{
          animation: "fade-up 0.9s 0.45s ease-out both, float-slow 7.5s ease-in-out 1.8s infinite",
        }}
      >
        <img
          decoding="async"
          src={dailyClean}
          alt="VedaGlows Daily Clean"
          className="w-full h-auto"
          style={{
            transform: "rotate(-3deg)",
            filter:
              "drop-shadow(0 28px 22px rgba(40,60,30,0.44)) drop-shadow(0 0 14px rgba(220,235,200,0.3))",
          }}
        />
      </div>
    </div>
  );
}
