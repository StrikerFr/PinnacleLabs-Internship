import {
  Sparkles,
  Leaf,
  Layers,
  Users,
  Check,
  X,
  ShoppingBag,
  Truck,
  Lock,
  BadgeCheck,
  ShieldCheck,
  MapPin,
  Star,
} from "lucide-react";

const leaf1 = "/assets/leaf-1.png";

const leaf2 = "/assets/leaf-2.png";
import { useAddStarterKit } from "@/lib/buy-actions";
import type { LucideIcon } from "lucide-react";

function PillarCard({
  n,
  title,
  desc,
  Icon,
  mobile = false,
}: {
  n: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  mobile?: boolean;
}) {
  return (
    <li
      className={`group rounded-2xl bg-background/70 p-5 transition-all duration-500 hover:-translate-y-1 ${
        mobile ? "shrink-0 w-[72vw] max-w-[280px]" : ""
      }`}
      style={{
        border: "1px solid rgba(60,40,20,0.08)",
        boxShadow: "0 18px 36px -28px rgba(60,40,20,0.25)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-serif text-[28px] text-foreground/25 italic">{n}</span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{
            background: "rgba(120,160,110,0.12)",
            border: "1px solid rgba(120,160,110,0.3)",
          }}
        >
          <Icon className="h-4 w-4 text-primary/80" />
        </span>
      </div>
      <h3 className="font-serif text-foreground text-[18px] sm:text-[19px] leading-tight">
        {title}
      </h3>
      <p className="mt-2 text-[12.5px] leading-[1.6] text-foreground/60">{desc}</p>
    </li>
  );
}

const PILLARS = [
  {
    n: "01",
    title: "Made For Indian Skin",
    desc: "Created specifically for Indian climate, pollution and skin concerns.",
    Icon: Sparkles,
  },
  {
    n: "02",
    title: "27 Ayurvedic Herbs",
    desc: "Traditional ingredients backed by centuries of use.",
    Icon: Leaf,
  },
  {
    n: "03",
    title: "Simple 3-Step System",
    desc: "No confusing 10-step routine. Just cleanse, repair and detox.",
    Icon: Layers,
  },
  {
    n: "04",
    title: "Trusted By 7,200+ Customers",
    desc: "Real people. Real transformations.",
    Icon: Users,
  },
];

const VEDA_POINTS = [
  "3 Product System",
  "Ayurvedic Herbs",
  "Made For Indian Skin",
  "Beginner Friendly",
  "Affordable Starter Kit",
  "Easy Daily Ritual",
];

const OTHER_POINTS = [
  "Complex Routines",
  "Too Many Products",
  "Generic Formulas",
  "Trial And Error",
  "Synthetic Heavy",
  "Confusing Steps",
];

const TRUST_BADGES = [
  { Icon: BadgeCheck, label: "COD Available" },
  { Icon: Lock, label: "Secure Checkout" },
  { Icon: MapPin, label: "Made In India" },
  { Icon: ShieldCheck, label: "7-Day Promise" },
  { Icon: Truck, label: "Fast Shipping" },
];

const STATS = [
  { big: "4.8", suffix: "/5", label: "Average Rating" },
  { big: "7,200", suffix: "+", label: "Happy Customers" },
  { big: "92", suffix: "%", label: "Would Recommend" },
];

export function Trust() {
  const addToCart = useAddStarterKit();

  return (
    <section
      id="trust"
      aria-label="Why Trust VedaGlows"
      className="relative grain w-full overflow-hidden"
    >
      {/* Atmospheric */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-8%] top-[20%] h-[40vh] w-[40vh] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(190,210,175,0.32), rgba(247,243,236,0) 70%)",
          filter: "blur(24px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-6%] bottom-[15%] h-[40vh] w-[40vh] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,232,190,0.32), rgba(247,243,236,0) 70%)",
          filter: "blur(22px)",
        }}
      />
      <img
        decoding="async"
        src={leaf1}
        alt=""
        aria-hidden
        className="hidden md:block absolute top-[8%] right-[5%] w-[90px] opacity-45"
        style={{ transform: "rotate(28deg)", animation: "float-slower 12s ease-in-out infinite" }}
      />
      <img
        decoding="async"
        src={leaf2}
        alt=""
        aria-hidden
        className="hidden md:block absolute bottom-[8%] left-[4%] w-[100px] opacity-45"
        style={{ transform: "rotate(-22deg)", animation: "float-slow 11s ease-in-out infinite" }}
      />

      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6 py-12 md:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center max-w-[820px] mx-auto">
          <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] uppercase text-foreground/50 mb-4">
            <span className="h-px w-8 bg-foreground/30" />
            Section 06 | Why Trust VedaGlows
            <span className="h-px w-8 bg-foreground/30" />
          </div>
          <h2 className="font-serif text-foreground leading-[1.02] tracking-[-0.025em] font-light text-[clamp(1.9rem,4.6vw,3.8rem)]">
            Skincare Should Feel <span className="italic text-primary/85">Simple.</span>
            <br className="hidden sm:block" /> Not Complicated.
          </h2>
          <p className="mt-4 mx-auto max-w-[620px] text-[13.5px] md:text-[14.5px] leading-[1.65] text-foreground/65">
            Most skincare brands sell dozens of products. VedaGlows focuses on{" "}
            <span className="italic text-foreground/85">one simple ritual</span> designed to
            cleanse, repair and restore your skin.
          </p>
        </div>

        {/* Trust pillar cards — desktop grid, mobile infinite marquee */}
        <div className="mt-8 md:mt-10">
          {/* Desktop / tablet grid */}
          <ul className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:max-w-[1280px] md:mx-auto">
            {PILLARS.map(({ n, title, desc, Icon }) => (
              <PillarCard key={n} n={n} title={title} desc={desc} Icon={Icon} />
            ))}
          </ul>

          {/* Mobile: auto-scrolling marquee, left → right (reverse) */}
          <div
            className="md:hidden marquee-mask -mx-4 sm:-mx-6 overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%)",
            }}
          >
            <ul className="marquee-track-reverse flex gap-3 w-max py-2 px-4 sm:px-6">
              {[...PILLARS, ...PILLARS].map(({ n, title, desc, Icon }, i) => (
                <PillarCard key={`${n}-${i}`} n={n} title={title} desc={desc} Icon={Icon} mobile />
              ))}
            </ul>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mt-12 md:mt-16 max-w-[1080px] mx-auto">
          <div className="text-center mb-6">
            <div className="text-[10px] tracking-[0.4em] uppercase text-foreground/50 mb-2">
              Why Switch
            </div>
            <h3 className="font-serif text-foreground text-[clamp(1.4rem,2.6vw,2.2rem)] leading-tight">
              VedaGlows <span className="italic text-foreground/40">vs</span> Typical Skincare
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
            {/* VedaGlows column */}
            <div
              className="relative rounded-[20px] p-5 sm:p-6 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0E2F25 0%, #173E31 60%, #0A2620 100%)",
                boxShadow: "0 30px 60px -30px rgba(14,47,37,0.5)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(50% 50% at 80% 0%, rgba(232,201,138,0.18), rgba(232,201,138,0) 60%)",
                }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-serif italic text-[#F4ECDC] text-[22px]">VedaGlows</div>
                  <span
                    className="text-[9px] tracking-[0.3em] uppercase px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: "#E8C98A", color: "#0E2F25" }}
                  >
                    Recommended
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {VEDA_POINTS.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-2.5 text-[13.5px] text-[#F4ECDC]/95"
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: "rgba(232,201,138,0.18)",
                          border: "1px solid rgba(232,201,138,0.4)",
                        }}
                      >
                        <Check className="h-3 w-3 text-[#E8C98A]" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Others column */}
            <div
              className="relative rounded-[20px] p-5 sm:p-6 bg-background/60"
              style={{
                border: "1px solid rgba(60,40,20,0.1)",
                boxShadow: "0 18px 36px -28px rgba(60,40,20,0.2)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="font-serif italic text-foreground/85 text-[22px]">Other Brands</div>
                <span className="text-[9px] tracking-[0.3em] uppercase text-foreground/50">
                  Typical
                </span>
              </div>
              <ul className="space-y-2.5">
                {OTHER_POINTS.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2.5 text-[13.5px] text-foreground/65"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background: "rgba(60,40,20,0.06)",
                        border: "1px solid rgba(60,40,20,0.12)",
                      }}
                    >
                      <X className="h-3 w-3 text-foreground/50" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Unified social proof + CTA */}
        <div
          className="mt-10 md:mt-14 max-w-[1080px] mx-auto rounded-[28px] px-5 sm:px-8 py-8 sm:py-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,253,247,0.85) 0%, rgba(247,243,236,0.6) 100%)",
            border: "1px solid rgba(60,40,20,0.09)",
            boxShadow: "0 30px 60px -36px rgba(60,40,20,0.22)",
          }}
        >
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-serif text-foreground text-[clamp(1.6rem,3.4vw,2.4rem)] leading-none tabular-nums">
                  {s.big}
                  <span className="text-foreground/55 text-[0.55em] ml-0.5">{s.suffix}</span>
                </div>
                {s.label === "Average Rating" && (
                  <div className="mt-1.5 flex items-center justify-center gap-0.5 text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-2.5 w-2.5 fill-current" />
                    ))}
                  </div>
                )}
                <div className="mt-1.5 text-[8.5px] sm:text-[9.5px] tracking-[0.28em] uppercase text-foreground/55">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {TRUST_BADGES.map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase text-foreground/70"
                style={{
                  background: "rgba(60,40,20,0.04)",
                  border: "1px solid rgba(60,40,20,0.1)",
                }}
              >
                <Icon className="h-3 w-3 text-primary/80" />
                {label}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div
            className="mt-7 sm:mt-8 mb-6 sm:mb-7 h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(60,40,20,0.14), transparent)",
            }}
          />

          {/* Inline CTA */}
          <div className="text-center">
            <div className="font-serif italic text-foreground text-[clamp(1.3rem,2.8vw,1.9rem)] leading-tight">
              Ready To Simplify Your Skincare?
            </div>
            <p className="mt-1.5 text-[10.5px] tracking-[0.28em] uppercase text-foreground/55">
              Starter Kit · Includes All 3 Formulas
            </p>
            <div className="mt-4 flex items-baseline justify-center gap-3">
              <span className="font-serif text-foreground text-[clamp(2.2rem,4.6vw,3rem)] leading-none">
                ₹499
              </span>
              <span className="text-[14px] line-through text-foreground/45">₹1299</span>
              <span
                className="text-[9px] tracking-[0.28em] uppercase px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "#E8C98A", color: "#0E2F25" }}
              >
                62% Off
              </span>
            </div>
            <button
              onClick={addToCart}
              className="group mt-5 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-[11px] tracking-[0.3em] uppercase font-semibold transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #0E2F25 0%, #173E31 60%, #0A2620 100%)",
                color: "#F4ECDC",
                boxShadow:
                  "0 18px 36px -14px rgba(14,47,37,0.45), 0 0 0 1px rgba(232,201,138,0.25)",
              }}
            >
              <ShoppingBag className="h-4 w-4 transition-transform duration-500 group-hover:scale-110" />
              Add Starter Kit To Cart
            </button>
            <div className="mt-3 text-[10px] tracking-[0.22em] uppercase text-foreground/50">
              Free Shipping · COD · 7-Day Promise
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
