import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";

const dailyClean = "https://kdvhmvy9l6gqbosc.public.blob.vercel-storage.com/dailyclean.png";

const glowRepair = "https://kdvhmvy9l6gqbosc.public.blob.vercel-storage.com/glowrepair.png";

const deepDetox = "https://kdvhmvy9l6gqbosc.public.blob.vercel-storage.com/deepdetox.png";
import ingNeem from "@/assets/ing-neem.jpg";
import ingTurmeric from "@/assets/ing-turmeric.jpg";
import ingMultani from "@/assets/ing-multani.jpg";
import ingManjistha from "@/assets/ing-manjistha.jpg";

const leaf1 = "/assets/leaf-1.png";

const leaf2 = "/assets/leaf-2.png";

type ProductId = "daily" | "glow" | "detox";

const PRODUCTS: Record<ProductId, { name: string; src: string; glow: string; tag: string }> = {
  daily: { name: "Daily Clean", src: dailyClean, glow: "rgba(170,200,150,0.6)", tag: "Cleanse" },
  glow: { name: "Glow Repair", src: glowRepair, glow: "rgba(240,200,130,0.6)", tag: "Repair" },
  detox: { name: "Deep Detox", src: deepDetox, glow: "rgba(180,120,80,0.55)", tag: "Detox" },
};

const INGREDIENTS: {
  id: string;
  name: string;
  latin: string;
  benefit: string;
  img: string;
  product: ProductId;
  accent: string;
  tags: string[];
}[] = [
  {
    id: "neem",
    name: "Neem",
    latin: "Azadirachta Indica",
    benefit: "Controls acne and excess oil",
    img: ingNeem,
    product: "daily",
    accent: "rgba(150,180,120,0.6)",
    tags: ["Acne", "Oil Control", "Purify"],
  },
  {
    id: "turmeric",
    name: "Turmeric",
    latin: "Curcuma Longa",
    benefit: "Brightens and calms skin",
    img: ingTurmeric,
    product: "glow",
    accent: "rgba(240,180,90,0.65)",
    tags: ["Dullness", "Dark Spots", "Glow"],
  },
  {
    id: "multani",
    name: "Multani Mitti",
    latin: "Fuller's Earth",
    benefit: "Deeply cleanses pores",
    img: ingMultani,
    product: "detox",
    accent: "rgba(200,170,130,0.55)",
    tags: ["Pores", "Texture", "Detox"],
  },
  {
    id: "manjistha",
    name: "Manjistha",
    latin: "Rubia Cordifolia",
    benefit: "Improves skin clarity",
    img: ingManjistha,
    product: "glow",
    accent: "rgba(190,110,90,0.55)",
    tags: ["Clarity", "Skin Repair", "Even Tone"],
  },
];

export function Formula() {
  const [pinned, setPinned] = useState<string>("neem");
  const [paused, setPaused] = useState(false);
  const activeIng = INGREDIENTS.find((i) => i.id === pinned)!;
  const activeProduct = activeIng.product;

  // Auto-rotate every 3s, pause on hover/focus
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setPinned((cur) => {
        const idx = INGREDIENTS.findIndex((i) => i.id === cur);
        return INGREDIENTS[(idx + 1) % INGREDIENTS.length].id;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="ingredients"
      aria-label="Inside The Formula"
      className="relative grain w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Atmospheric lights */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-6%] top-[14%] h-[45vh] w-[45vh] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,232,190,0.35), rgba(247,243,236,0) 70%)",
          filter: "blur(22px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] bottom-[10%] h-[45vh] w-[45vh] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(190,210,175,0.28), rgba(247,243,236,0) 70%)",
          filter: "blur(24px)",
        }}
      />
      <img
        decoding="async"
        src={leaf1}
        alt=""
        aria-hidden
        className="hidden md:block absolute top-[6%] right-[5%] w-[90px] opacity-50"
        style={{ transform: "rotate(28deg)", animation: "float-slower 12s ease-in-out infinite" }}
      />
      <img
        decoding="async"
        src={leaf2}
        alt=""
        aria-hidden
        className="hidden md:block absolute bottom-[8%] left-[4%] w-[100px] opacity-50"
        style={{ transform: "rotate(-22deg)", animation: "float-slow 11s ease-in-out infinite" }}
      />

      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6 py-12 md:py-16 lg:py-20">
        {/* ── Header ────────────────────────────────────── */}
        <div className="text-center max-w-[820px] mx-auto">
          <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] uppercase text-foreground/50 mb-4">
            <span className="h-px w-8 bg-foreground/30" />
            Section 05 | Inside The Formula
            <span className="h-px w-8 bg-foreground/30" />
          </div>
          <h2 className="font-serif text-foreground leading-[1.02] tracking-[-0.025em] font-light text-[clamp(1.8rem,4.4vw,3.6rem)]">
            Powered By Nature.
            <span className="italic text-primary/85"> Proven</span> For Real Skin Results.
          </h2>
          <p className="mt-3 mx-auto max-w-[560px] text-[13.5px] md:text-[14px] leading-[1.65] text-foreground/65">
            27 Ayurvedic herbs carefully selected to cleanse, repair and detox modern Indian skin.
          </p>
        </div>

        {/* ── Ingredient benefit cards ───────────────── */}
        <div className="mt-8 md:mt-10 -mx-4 sm:-mx-6 px-4 sm:px-6 overflow-x-auto overflow-y-visible scrollbar-none snap-x snap-mandatory">
          <ul className="flex gap-3 sm:gap-4 lg:gap-5 min-w-max lg:min-w-0 lg:grid lg:grid-cols-4 lg:max-w-[1280px] lg:mx-auto">
            {INGREDIENTS.map((ing) => {
              const isActive = pinned === ing.id;
              return (
                <li
                  key={ing.id}
                  onClick={() => setPinned(ing.id)}
                  onMouseEnter={() => setPinned(ing.id)}
                  className="group relative flex-shrink-0 w-[78vw] sm:w-[44vw] lg:w-auto cursor-pointer snap-start transition-all duration-500"
                  tabIndex={0}
                  aria-pressed={isActive}
                >
                  <figure
                    className="relative overflow-hidden aspect-[4/5] rounded-[6px] transition-all duration-500"
                    style={{
                      boxShadow: isActive
                        ? `0 22px 44px -20px ${ing.accent}, 0 0 0 1px ${ing.accent}`
                        : "0 10px 25px -18px rgba(60,40,20,0.25)",
                    }}
                  >
                    <img
                      decoding="async"
                      src={ing.img}
                      alt={`${ing.name} | ${ing.latin}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out will-change-transform group-hover:scale-110"
                      style={{ transform: isActive ? "scale(1.08)" : "scale(1)" }}
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
                      style={{
                        background: `radial-gradient(closest-side, ${ing.accent}, rgba(0,0,0,0) 70%)`,
                        mixBlendMode: "overlay",
                        opacity: isActive ? 0.8 : 0,
                      }}
                    />
                    {/* Always-on benefit overlay (mobile-first) */}
                    <div
                      className="absolute inset-x-0 bottom-0 p-3 pt-12"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(20,15,10,0.88), rgba(20,15,10,0.2) 70%, rgba(20,15,10,0) 100%)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[8.5px] tracking-[0.32em] uppercase text-white/70">
                          {ing.latin}
                        </span>
                        <span className="text-[8.5px] tracking-[0.28em] uppercase text-white/80">
                          → {PRODUCTS[ing.product].name}
                        </span>
                      </div>
                      <h3 className="font-serif italic text-white text-[18px] leading-tight">
                        {ing.name}
                      </h3>
                      <p className="mt-1 text-[12px] leading-snug text-white/90">{ing.benefit}</p>
                    </div>

                    <span
                      aria-hidden
                      className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary transition-all duration-500"
                      style={{
                        opacity: isActive ? 1 : 0,
                        boxShadow: isActive
                          ? "0 0 0 5px rgba(255,255,255,0.4), 0 0 18px rgba(255,255,255,0.5)"
                          : "none",
                      }}
                    />
                  </figure>

                  {/* Problem pills */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {ing.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] tracking-[0.14em] uppercase bg-foreground/[0.04] border border-foreground/10 text-foreground/70"
                      >
                        <Check className="h-2.5 w-2.5 text-primary/80" />
                        {t}
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Which formula uses this? ───────────────── */}
        <div className="mt-10 md:mt-14">
          <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.4em] uppercase text-foreground/50 mb-6">
            <span className="h-px w-8 bg-foreground/30" />
            Which Formula Uses {activeIng.name}?
            <span className="h-px w-8 bg-foreground/30" />
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-5 lg:gap-7 max-w-[900px] mx-auto">
            {(["daily", "glow", "detox"] as ProductId[]).map((pid) => {
              const prod = PRODUCTS[pid];
              const isActive = activeProduct === pid;
              return (
                <div
                  key={pid}
                  className="relative flex flex-col items-center transition-all duration-700 ease-out rounded-2xl px-2 py-4 sm:px-3 sm:py-5"
                  style={{
                    background: isActive
                      ? `linear-gradient(180deg, ${prod.glow.replace("0.6", "0.18").replace("0.55", "0.18").replace("0.65", "0.18")}, rgba(247,243,236,0))`
                      : "transparent",
                    border: `1px solid ${isActive ? prod.glow.replace("0.6", "0.4").replace("0.55", "0.4").replace("0.65", "0.4") : "rgba(60,40,20,0.08)"}`,
                    transform: isActive ? "translateY(-4px)" : "translateY(0)",
                    opacity: activeProduct && !isActive ? 0.55 : 1,
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-[10%] -translate-x-1/2 h-[140px] w-[140px] sm:h-[180px] sm:w-[180px] rounded-full pointer-events-none transition-opacity duration-700"
                    style={{
                      background: `radial-gradient(closest-side, ${prod.glow}, rgba(247,243,236,0) 72%)`,
                      filter: "blur(14px)",
                      opacity: isActive ? 0.9 : 0.2,
                    }}
                  />
                  <img
                    decoding="async"
                    src={prod.src}
                    alt={prod.name}
                    draggable={false}
                    className="relative w-full max-w-[110px] sm:max-w-[150px] lg:max-w-[170px] h-auto select-none transition-transform duration-700"
                    style={{
                      transform: isActive ? "scale(1.08)" : "scale(1)",
                      filter: "drop-shadow(0 30px 30px rgba(60,30,15,0.25))",
                    }}
                  />
                  <span className="mt-3 text-[9px] tracking-[0.35em] uppercase text-foreground/55">
                    {prod.tag}
                  </span>
                  <span className="mt-1 font-serif italic font-light text-[13px] sm:text-[15px] text-foreground/90 text-center">
                    {prod.name}
                  </span>
                  {isActive && (
                    <span className="mt-2 text-[9px] tracking-[0.28em] uppercase text-primary">
                      Contains {activeIng.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
