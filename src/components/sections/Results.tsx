import { useCallback, useEffect, useRef, useState } from "react";
import { useAddStarterKit } from "@/lib/buy-actions";

import {
  Star,
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
} from "lucide-react";
import beforeImg from "@/assets/before.jpg";
import afterImg from "@/assets/after.jpg";
import customer1 from "@/assets/customer-1.jpg";
import customer2 from "@/assets/customer-2.jpg";
import customer3 from "@/assets/customer-3.jpg";
import customer4 from "@/assets/customer-4.jpg";
import customer5 from "@/assets/customer-5.jpg";
import customer6 from "@/assets/customer-6.jpg";
import customer7 from "@/assets/customer-7.jpg";
import customer8 from "@/assets/customer-8.jpg";

const leaf1 = "/assets/leaf-1.png";

const leaf2 = "/assets/leaf-2.png";

type Story = {
  img: string;
  name: string;
  location: string;
  rating: number;
  product: string;
  days: number;
  quote: string;
};

const STORIES: Story[] = [
  {
    img: customer1,
    name: "Ananya R.",
    location: "Bengaluru, IN",
    rating: 5,
    product: "The Complete Ritual",
    days: 28,
    quote:
      "The first routine that actually felt designed for my skin. Calmer, clearer in just weeks.",
  },
  {
    img: customer2,
    name: "Priya S.",
    location: "Mumbai, IN",
    rating: 5,
    product: "The Starter Kit",
    days: 35,
    quote:
      "Three jars replaced my whole shelf. The glow is real and I'm finally not guessing anymore.",
  },
  {
    img: customer3,
    name: "Meera K.",
    location: "Kochi, IN",
    rating: 5,
    product: "The Complete Ritual",
    days: 21,
    quote:
      "By day 21 the breakouts had quieted. My skin just looks like skin again — soft, even, alive.",
  },
  {
    img: customer4,
    name: "Arjun M.",
    location: "Bengaluru, IN",
    rating: 5,
    product: "Daily Clean + Glow Repair",
    days: 30,
    quote:
      "Didn't think a 3-step thing could work for someone who travels constantly. My skin stopped reacting.",
  },
  {
    img: customer5,
    name: "Lakshmi V.",
    location: "Chennai, IN",
    rating: 5,
    product: "The Complete Ritual",
    days: 56,
    quote: "I'm 42 and my skin hasn't felt this firm in a decade. The ritual is honestly magic.",
  },
  {
    img: customer6,
    name: "Kavya N.",
    location: "Hyderabad, IN",
    rating: 5,
    product: "Glow Repair",
    days: 42,
    quote:
      "Years of sun damage are visibly faded. My husband noticed before I even told him I'd started.",
  },
  {
    img: customer7,
    name: "Aisha F.",
    location: "Lucknow, IN",
    rating: 5,
    product: "The Starter Kit",
    days: 21,
    quote:
      "Mum bought it for me after nothing else worked. Three weeks in, my cheeks are actually clear.",
  },
  {
    img: customer8,
    name: "Rohan D.",
    location: "Pune, IN",
    rating: 5,
    product: "Daily Clean + Deep Detox",
    days: 14,
    quote:
      "Post-shave my skin used to burn for hours. With this routine there's just nothing. Crazy.",
  },
];

const METRICS = [
  { value: "7,200+", label: "Happy Customers" },
  { value: "4.8/5", label: "Customer Rating" },
  { value: "92%", label: "Repeat Buyers" },
  { value: "Indian", label: "Skin Formulated" },
];

export function Results() {
  return (
    <section
      id="results"
      aria-label="Real Results"
      className="relative grain w-full overflow-hidden"
    >
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-8%] top-[10%] h-[55vh] w-[55vh] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,232,190,0.45), rgba(247,243,236,0) 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] top-[55%] h-[55vh] w-[55vh] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(190,210,175,0.32), rgba(247,243,236,0) 70%)",
          filter: "blur(24px)",
        }}
      />
      <img
        decoding="async"
        src={leaf1}
        alt=""
        aria-hidden
        className="absolute top-[14%] left-[3%] w-[90px] opacity-50 hidden md:block"
        style={{
          transform: "rotate(-18deg)",
          animation: "float-slower 12s ease-in-out infinite",
        }}
      />
      <img
        decoding="async"
        src={leaf2}
        alt=""
        aria-hidden
        className="absolute bottom-[10%] right-[4%] w-[100px] opacity-50 hidden md:block"
        style={{
          transform: "rotate(150deg)",
          animation: "float-slow 11s ease-in-out infinite",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-4 md:px-6 pt-14 md:pt-20 pb-14 md:pb-20">
        {/* ── Header ── */}
        <div className="text-center max-w-[820px] mx-auto">
          <div className="flex items-center justify-center gap-3 text-[10.5px] md:text-[11px] tracking-[0.4em] uppercase text-foreground/50 mb-3 md:mb-4">
            <span className="h-px w-8 bg-foreground/30" />
            Real Results
            <span className="h-px w-8 bg-foreground/30" />
          </div>
          <h2 className="font-serif text-foreground leading-[0.96] tracking-[-0.025em] font-light text-[clamp(2.2rem,5.2vw,4.4rem)]">
            Results You Can See.
            <br />
            <span className="italic text-primary/85">Confidence</span> You Can Feel.
          </h2>
        </div>

        {/* ── Before/After hero ── */}
        <div className="mt-7 md:mt-10 mx-auto w-full max-w-[920px]">
          {/* Verification badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-2.5 mb-4">
            {[
              { icon: BadgeCheck, label: "Real Customer Result" },
              { icon: Sparkles, label: "28-Day Transformation" },
              { icon: ShieldCheck, label: "Verified Purchase" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-white/70 px-3 py-1.5 text-[10.5px] tracking-[0.14em] uppercase text-foreground/75"
              >
                <Icon className="h-3 w-3" strokeWidth={1.8} style={{ color: "#143A2A" }} />
                {label}
              </span>
            ))}
          </div>

          <BeforeAfterSlider />

          <p className="mt-3 md:mt-4 text-center text-[10.5px] md:text-[11px] tracking-[0.35em] uppercase text-foreground/50">
            Drag to reveal · Real verified customer
          </p>
        </div>

        {/* ── Metrics ── */}
        <div className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4 max-w-[920px] mx-auto">
          {METRICS.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl px-4 py-4 md:py-5 text-center"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(247,243,236,0.7) 100%)",
                border: "1px solid rgba(20,58,42,0.10)",
                boxShadow:
                  "0 14px 30px -20px rgba(60,40,20,0.18), 0 1px 0 rgba(255,255,255,0.8) inset",
              }}
            >
              <div className="font-serif text-[clamp(1.4rem,3.2vw,2rem)] leading-none text-foreground">
                {m.value}
              </div>
              <div className="mt-1.5 text-[10px] md:text-[10.5px] tracking-[0.2em] uppercase text-foreground/60">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Reviews carousel ── */}
        <ReviewsCarousel />

        {/* ── Conversion block ── */}
        <BuyingTrigger />
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────── */

function BeforeAfterSlider() {
  const [pos, setPos] = useState(52);
  const dragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const ratio = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(0, Math.min(100, ratio)));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      updateFromClientX(e.clientX);
    };
    const onTouch = (e: TouchEvent) => {
      if (!dragging.current || !e.touches[0]) return;
      updateFromClientX(e.touches[0].clientX);
    };
    const onUp = () => (dragging.current = false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateFromClientX]);

  const startDrag = (clientX: number) => {
    dragging.current = true;
    updateFromClientX(clientX);
  };

  return (
    <div
      ref={frameRef}
      className="relative mx-auto w-full aspect-[4/5] sm:aspect-[5/6] md:aspect-[4/3] rounded-2xl overflow-hidden select-none cursor-ew-resize group"
      style={{
        boxShadow: "0 50px 80px -30px rgba(60,40,20,0.4), 0 18px 30px -15px rgba(60,40,20,0.22)",
      }}
      onMouseDown={(e) => startDrag(e.clientX)}
      onTouchStart={(e) => e.touches[0] && startDrag(e.touches[0].clientX)}
      role="slider"
      aria-label="Before and after comparison"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 4));
        if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 4));
      }}
    >
      <img
        decoding="async"
        src={afterImg}
        alt="After 28 days"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <span
        className="absolute right-4 bottom-4 z-10 text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-medium px-2.5 py-1 rounded-full"
        style={{ background: "rgba(20,58,42,0.85)", color: "#E8C98A" }}
      >
        After · Day 28
      </span>

      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          decoding="async"
          src={beforeImg}
          alt="Before"
          className="absolute inset-0 h-full object-cover"
          style={{
            width: frameRef.current ? frameRef.current.clientWidth : "920px",
            maxWidth: "none",
          }}
          draggable={false}
        />
        <span
          className="absolute left-4 bottom-4 text-[10px] md:text-[11px] tracking-[0.3em] uppercase font-medium px-2.5 py-1 rounded-full"
          style={{ background: "rgba(247,243,236,0.9)", color: "#143A2A" }}
        >
          Before · Day 01
        </span>
      </div>

      <div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div className="relative h-full w-px bg-white/95 shadow-[0_0_20px_rgba(0,0,0,0.35)]" />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.97)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-foreground/80"
          >
            <path
              d="M7 5L3 10l4 5M13 5l4 5-4 5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────── */

function ReviewsCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-review]") as HTMLElement | null;
    const w = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
  };

  // Auto-advance every 4s; loops back to start when reaching the end.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const card = el.querySelector("[data-review]") as HTMLElement | null;
      const w = card ? card.offsetWidth + 16 : 320;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: w, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const pause = () => (pausedRef.current = true);
  const resume = () => (pausedRef.current = false);

  return (
    <div className="mt-12 md:mt-16">
      <div className="flex items-end justify-between gap-4 mb-4 md:mb-6">
        <div>
          <div className="text-[10.5px] tracking-[0.4em] uppercase text-foreground/50 mb-2">
            Customer Stories
          </div>
          <h3 className="font-serif font-light text-foreground text-[clamp(1.4rem,2.6vw,2rem)] leading-tight">
            What our customers say
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Previous review"
            onClick={() => {
              pause();
              scrollBy(-1);
              setTimeout(resume, 2500);
            }}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-white/80 border border-foreground/10 hover:bg-white transition"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.6} />
          </button>
          <button
            aria-label="Next review"
            onClick={() => {
              pause();
              scrollBy(1);
              setTimeout(resume, 2500);
            }}
            className="h-10 w-10 rounded-full flex items-center justify-center bg-white/80 border border-foreground/10 hover:bg-white transition"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={() => setTimeout(resume, 3500)}
        className="-mx-4 md:mx-0 px-4 md:px-0 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
      >
        {STORIES.map((s, i) => (
          <ReviewCard key={i} s={s} />
        ))}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function ReviewCard({ s }: { s: Story }) {
  return (
    <article
      data-review
      className="snap-start shrink-0 w-[85vw] sm:w-[60vw] md:w-[calc((100%-32px)/3)] flex flex-col rounded-2xl p-5 md:p-6"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(247,243,236,0.7) 100%)",
        border: "1px solid rgba(20,58,42,0.10)",
        boxShadow: "0 18px 40px -22px rgba(60,40,20,0.22), 0 1px 0 rgba(255,255,255,0.8) inset",
      }}
    >
      <div className="flex items-center gap-3">
        <img
          decoding="async"
          src={s.img}
          alt={s.name}
          className="h-12 w-12 rounded-full object-cover"
          style={{ boxShadow: "0 6px 14px -6px rgba(60,40,20,0.3)" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-serif italic text-[1.05rem] text-foreground leading-tight">
              {s.name}
            </span>
            <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} style={{ color: "#1F5A40" }} />
          </div>
          <div className="text-[10.5px] tracking-[0.18em] uppercase text-foreground/55">
            {s.location}
          </div>
        </div>
        <div className="flex">
          {[...Array(s.rating)].map((_, i) => (
            <Star
              key={i}
              className="h-3 w-3"
              style={{ fill: "#E8C98A", color: "#E8C98A" }}
              strokeWidth={0}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-[13.5px] leading-[1.6] text-foreground/80">“{s.quote}”</p>

      <div className="mt-4 pt-4 border-t border-foreground/10 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[9.5px] tracking-[0.22em] uppercase text-foreground/50">Used</div>
          <div className="text-[12px] text-foreground/85 truncate">{s.product}</div>
        </div>
        <span
          className="shrink-0 text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 rounded-full"
          style={{
            background: "rgba(20,58,42,0.08)",
            color: "#143A2A",
          }}
        >
          {s.days} Days
        </span>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────── */

function BuyingTrigger() {
  return (
    <div
      className="relative mt-12 md:mt-16 rounded-[28px] overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #FFFFFF 0%, #FBF7EE 55%, #F4ECDC 100%)",
        boxShadow: "0 40px 80px -32px rgba(20,58,42,0.22), 0 0 0 1px rgba(201,168,106,0.28) inset",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[340px] w-[340px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(232,201,138,0.42), rgba(255,255,255,0) 70%)",
          filter: "blur(22px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-[-60px] h-[260px] w-[260px] rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(20,58,42,0.10), rgba(255,255,255,0) 70%)",
          filter: "blur(22px)",
        }}
      />

      <div className="relative grid md:grid-cols-[1.1fr_1fr] gap-6 md:gap-10 px-5 md:px-10 py-8 md:py-10 items-center">
        <div>
          <div className="text-[10.5px] tracking-[0.32em] uppercase" style={{ color: "#A8853F" }}>
            ✦ Your Turn
          </div>
          <h3
            className="font-serif italic font-light mt-2 text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.05]"
            style={{ color: "#143A2A" }}
          >
            Ready For Your Own Transformation?
          </h3>
          <p
            className="mt-3 text-[13.5px] leading-[1.65] max-w-[460px]"
            style={{ color: "rgba(20,58,42,0.7)" }}
          >
            Join 7,200+ customers using the VedaGlows Skin Reset System. Your 28-day glow starts the
            moment your kit arrives.
          </p>

          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { icon: Truck, label: "Free Shipping" },
              { icon: BadgeCheck, label: "COD Available" },
              { icon: ShieldCheck, label: "7-Day Promise" },
            ].map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-[12px]"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(20,58,42,0.10)",
                  color: "#143A2A",
                  boxShadow: "0 1px 2px rgba(20,58,42,0.04)",
                }}
              >
                <Icon
                  className="h-3.5 w-3.5 shrink-0"
                  strokeWidth={2}
                  style={{ color: "#A8853F" }}
                />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-2xl p-5 md:p-6"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF7 100%)",
            border: "1px solid rgba(201,168,106,0.35)",
            boxShadow:
              "0 18px 40px -22px rgba(20,58,42,0.25), 0 0 0 1px rgba(255,255,255,0.6) inset",
          }}
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "#A8853F" }}>
                The Starter Kit
              </div>
              <div className="mt-1 flex items-baseline gap-2.5">
                <span
                  className="font-serif text-[2.4rem] md:text-[2.6rem] leading-none"
                  style={{ color: "#143A2A" }}
                >
                  ₹499
                </span>
                <span
                  className="text-[13.5px] line-through"
                  style={{ color: "rgba(20,58,42,0.45)" }}
                >
                  ₹1299
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span
                className="text-[10px] font-semibold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #C9A86A 0%, #E8C98A 100%)",
                  color: "#143A2A",
                  boxShadow: "0 6px 14px -6px rgba(201,168,106,0.6)",
                }}
              >
                62% OFF
              </span>
              <span
                className="text-[10px] tracking-[0.16em] uppercase px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(201,168,106,0.10)",
                  color: "#A8853F",
                  border: "1px solid rgba(201,168,106,0.35)",
                }}
              >
                Save ₹800
              </span>
            </div>
          </div>

          <ul className="mt-4 space-y-1.5">
            {["Daily Clean", "Glow Repair", "Deep Detox"].map((p) => (
              <li
                key={p}
                className="flex items-center gap-2 text-[12.5px]"
                style={{ color: "rgba(20,58,42,0.85)" }}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2.2} style={{ color: "#1F5A40" }} />
                {p}
              </li>
            ))}
          </ul>

          <ResultsAddButton />
        </div>
      </div>
    </div>
  );
}

function ResultsAddButton() {
  const add = useAddStarterKit();
  return (
    <button
      onClick={add}
      className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full text-[12px] tracking-[0.18em] uppercase transition-transform hover:-translate-y-0.5"
      style={{
        minHeight: 56,
        background: "linear-gradient(135deg, #E8C98A 0%, #C9A86A 100%)",
        color: "#143A2A",
        boxShadow: "0 22px 44px -18px rgba(201,168,106,0.65), 0 0 0 1px rgba(20,58,42,0.15) inset",
      }}
    >
      <ShoppingCart className="h-4 w-4" strokeWidth={1.8} />
      Add Starter Kit To Cart
    </button>
  );
}
