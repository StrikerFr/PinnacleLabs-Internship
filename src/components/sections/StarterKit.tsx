import { useState, useEffect, useRef } from "react";
import { Truck, ShieldCheck, Lock, BadgeCheck, Check, Star, Leaf } from "lucide-react";

import { useCart } from "@/lib/cart-store";
import { useCartDrawer } from "@/lib/cart-drawer-store";

const SERIF: React.CSSProperties = { fontFamily: "'Instrument Serif', serif" };

type BundleId = 1 | 2;
const BUNDLES: Array<{
  id: BundleId;
  title: string;
  subtitle: string;
  price: number;
  mrp: number;
  perKit: number;
  badge?: string;
}> = [
  { id: 1, title: "1 Kit", subtitle: "Try it out", price: 499, mrp: 1299, perKit: 499 },
  {
    id: 2,
    title: "2 Kits",
    subtitle: "Most Popular",
    price: 799,
    mrp: 2598,
    perKit: 399,
    badge: "Most Popular",
  },
];

const BENEFITS = [
  "100% Ayurvedic, no chemicals or sulphates",
  "Visible results in 28 days — acne, oil & dullness",
  "Free shipping · COD · 7-day satisfaction promise",
];

const TRUST = [
  { Icon: Truck, label: "Free Shipping" },
  { Icon: BadgeCheck, label: "COD Available" },
  { Icon: Lock, label: "Secure Checkout" },
  { Icon: ShieldCheck, label: "7-Day Promise" },
];

const GALLERY = [
  {
    src: "/assets/kit-hero-new.png",
    alt: "VedaGlows 28-Day Skin Reset Kit — full set with box",
    label: "The Kit",
  },
  {
    src: "/assets/kit-daily-clean.png",
    alt: "Daily Clean — Gentle Herbal Cleanser",
    label: "Daily Clean",
  },
  {
    src: "/assets/kit-glow-repair.png",
    alt: "Glow Repair — Brightening & Skin Repair",
    label: "Glow Repair",
  },
  {
    src: "/assets/kit-deep-detox.png",
    alt: "Deep Detox — Herbal Detox Facial",
    label: "Deep Detox",
  },
];

export function StarterKit() {
  const [selected, setSelected] = useState<BundleId>(2);
  const [activeImg, setActiveImg] = useState(0);
  const [paused, setPaused] = useState(false);
  const openDrawer = useCartDrawer((s) => s.open);
  const current = BUNDLES.find((b) => b.id === selected)!;
  const savings = Math.round(((current.mrp - current.price) / current.mrp) * 100);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActiveImg((i) => (i + 1) % GALLERY.length);
    }, 3500);
    return () => clearInterval(id);
  }, [paused]);

  const addToCart = () => {
    useCart.getState().setStarterKitQty(selected);
    openDrawer(true);
  };

  return (
    <section id="starter-kit" className="bg-[color:var(--ivory)] py-16 md:py-24 px-4 md:px-8">
      <div className="mx-auto max-w-[1240px] grid md:grid-cols-[1.15fr_1fr] gap-8 md:gap-16 lg:gap-20 items-start">
        {/* IMAGE GALLERY — hero, ~55-60% */}
        <div className="relative order-1">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-[32px]"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 50%, rgba(232,201,138,0.22), rgba(232,201,138,0) 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="relative rounded-[24px] overflow-hidden bg-[#F7F1E3]/60 aspect-[5/5] md:aspect-[6/7] group"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            {GALLERY.map((img, i) => (
              <img
                decoding="async"
                key={img.src}
                src={img.src}
                alt={img.alt}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  activeImg === i
                    ? "opacity-100 scale-100 blur-0"
                    : "opacity-0 scale-[1.08] blur-[6px] pointer-events-none"
                }`}
                draggable={false}
              />
            ))}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-[#0E2F25] text-[#E8C98A] text-[10px] tracking-[0.28em] uppercase font-semibold inline-flex items-center gap-1.5">
              <Leaf className="h-3 w-3" /> Best Seller
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {GALLERY.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeImg === i
                      ? "w-6 bg-[#0E2F25]"
                      : "w-1.5 bg-[#0E2F25]/35 hover:bg-[#0E2F25]/60"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {GALLERY.map((img, i) => {
              const active = activeImg === i;
              return (
                <button
                  key={img.src}
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                    active
                      ? "ring-2 ring-[#0E2F25] ring-offset-2 ring-offset-[color:var(--ivory)] shadow-[0_10px_24px_-12px_rgba(14,47,37,0.45)]"
                      : "ring-1 ring-[#0E2F25]/15 hover:ring-[#0E2F25]/40 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={img.label}
                >
                  <img
                    decoding="async"
                    src={img.src}
                    alt={img.label}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* PURCHASE PANEL */}
        <div className="order-2 flex flex-col" style={{ color: "#1B2E26" }}>
          {/* Eyebrow */}
          <div className="text-[10.5px] tracking-[0.32em] uppercase font-semibold text-[#7C8B82]">
            VedaGlows · 28-Day Ritual
          </div>

          {/* Title */}
          <h2
            className="mt-3 leading-[1.05] tracking-tight text-[#0E2F25]"
            style={{ ...SERIF, fontSize: "clamp(34px, 4vw, 52px)", fontWeight: 400 }}
          >
            28-Day Skin Reset Kit
          </h2>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-2 text-[13px] text-[#4A5A52]">
            <span className="inline-flex items-center gap-0.5 text-[#C9A24C]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            <span className="font-medium text-[#0E2F25]">4.8</span>
            <span className="text-[#7C8B82]">·</span>
            <a href="#reviews" className="underline-offset-4 hover:underline">
              7,200+ reviews
            </a>
          </div>

          {/* Description */}
          <p className="mt-5 text-[15px] leading-[1.6] text-[#4A5A52] max-w-md">
            Three Ayurvedic herbal powders — Daily Clean, Glow Repair, Deep Detox — that cleanse,
            brighten and reset your skin in 28 days.
          </p>

          {/* Price */}
          <div className="mt-7 flex items-end gap-3">
            <span style={{ ...SERIF, fontSize: "44px", lineHeight: 1 }} className="text-[#0E2F25]">
              ₹{current.price}
            </span>
            <span className="text-[16px] line-through text-[#7C8B82] pb-1">₹{current.mrp}</span>
            <span className="pb-1 text-[10px] tracking-[0.22em] uppercase font-semibold px-2 py-1 rounded-full bg-[#0E2F25] text-[#E8C98A]">
              Save {savings}%
            </span>
          </div>

          {/* Bundle selector */}
          <div className="mt-7">
            <div className="text-[11px] tracking-[0.26em] uppercase font-semibold text-[#7C8B82] mb-3">
              Choose your bundle
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {BUNDLES.map((b) => {
                const active = selected === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b.id)}
                    className={`relative text-left rounded-2xl p-3.5 transition-all duration-300 ${
                      active
                        ? "bg-[#0E2F25] text-[#F4ECDC] border border-[#0E2F25] shadow-[0_12px_30px_-12px_rgba(14,47,37,0.5)]"
                        : "bg-white border border-[#0E2F25]/12 hover:border-[#0E2F25]/35"
                    }`}
                  >
                    {b.badge && (
                      <span
                        className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[8.5px] tracking-[0.22em] uppercase font-bold px-2 py-0.5 rounded-full ${
                          b.id === 2 ? "bg-[#E8C98A] text-[#0E2F25]" : "bg-[#0E2F25] text-[#E8C98A]"
                        }`}
                      >
                        {b.badge}
                      </span>
                    )}
                    <div
                      style={{ ...SERIF, fontSize: "22px", lineHeight: 1 }}
                      className={active ? "text-[#F4ECDC]" : "text-[#0E2F25]"}
                    >
                      {b.title}
                    </div>
                    <div
                      className={`mt-2 text-[15px] font-semibold ${active ? "text-[#E8C98A]" : "text-[#0E2F25]"}`}
                    >
                      ₹{b.price}
                    </div>
                    <div
                      className={`text-[10.5px] mt-0.5 ${active ? "text-[#F4ECDC]/70" : "text-[#7C8B82]"}`}
                    >
                      ₹{b.perKit}/kit
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={addToCart}
            className="mt-6 w-full rounded-full bg-[#0E2F25] text-[#F4ECDC] py-4 text-[12px] tracking-[0.28em] uppercase font-semibold hover:bg-[#143A2A] active:scale-[0.99] transition-all duration-300 shadow-[0_20px_40px_-18px_rgba(14,47,37,0.6)]"
          >
            Add {current.title} to Cart · ₹{current.price}
          </button>

          {/* Benefits */}
          <ul className="mt-6 flex flex-col gap-2.5">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-[13.5px] text-[#3A4A42]">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0E2F25]/8">
                  <Check className="h-2.5 w-2.5 text-[#0E2F25]" />
                </span>
                {b}
              </li>
            ))}
          </ul>

          {/* Trust */}
          <div className="mt-7 pt-6 border-t border-[#0E2F25]/10 grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-2 text-[11px] text-[#4A5A52]">
            {TRUST.map(({ Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-[#0E2F25]" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
