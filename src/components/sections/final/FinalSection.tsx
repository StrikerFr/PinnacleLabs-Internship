import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";

const WORDS = ["Dream.", "Plan.", "Execute.", "Achieve."];

export function FinalSection() {
  return (
    <section
      id="method"
      className="relative isolate overflow-hidden scroll-mt-24"
      style={{ backgroundColor: "transparent", color: "#eaeaea" }}
    >
      <Atmosphere />
      <GlowingPath />

      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 lg:px-12">
        {/* Opening editorial */}
        <div className="mx-auto flex min-h-[90vh] max-w-[1100px] flex-col items-center justify-center pt-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-[#bfbfbf] backdrop-blur-xl"
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: "#7dd3fc", boxShadow: "0 0 8px #7dd3fc" }}
            />
            The Beginning
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance text-[46px] font-bold uppercase leading-[1.02] tracking-[-0.015em] text-[#f3ede2] md:text-[78px] lg:text-[108px]"
            style={{ fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif' }}
          >
            Your future
            <br />
            won't build itself.
          </motion.h2>

          <motion.h3
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 text-balance text-[28px] font-bold uppercase leading-[1.1] tracking-[-0.03em] md:text-[44px] lg:text-[56px]"
            style={{
              fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif',
              backgroundImage: "linear-gradient(180deg, #f5efe2 0%, #7dd3fc 70%, #8a6a3a 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              textShadow: "0 0 60px rgba(125,211,252,0.2)",
            }}
          >
            But your plan already exists.
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="mx-auto mt-12 max-w-[600px] space-y-1 text-[15px] leading-[1.7] text-[#a8a39a] md:text-[17px]"
          >
            Every successful founder. Every top engineer. Every designer. Every athlete. Every
            creator. Reached their destination one step at a time.
            <br />
            <span className="text-[#f3ede2]">TaskPilot simply shows you the next step.</span>
          </motion.p>
        </div>

        {/* Animated word reveal */}
        <WordReveal />

        {/* Social trust */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1 }}
          className="mx-auto mt-32 max-w-[720px] text-center text-[13px] leading-[1.9] text-[#7a766f] md:text-[14px]"
        >
          Used by ambitious <span className="text-[#cfcabf]">students</span>,{" "}
          <span className="text-[#cfcabf]">builders</span>,{" "}
          <span className="text-[#cfcabf]">designers</span>,{" "}
          <span className="text-[#cfcabf]">developers</span>, and{" "}
          <span className="text-[#cfcabf]">future founders</span>.
        </motion.div>

        {/* Final emotional moment */}
        <div className="mx-auto mt-40 max-w-[1200px] text-center">
          <motion.h3
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance text-[44px] font-bold uppercase leading-[1.02] tracking-[-0.015em] text-[#f3ede2] md:text-[76px] lg:text-[100px]"
            style={{ fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif' }}
          >
            Stop wondering
            <br />
            what's next.
          </motion.h3>
          <motion.h3
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-balance text-[28px] leading-[1.1] tracking-[-0.03em] md:text-[44px] lg:text-[56px]"
            style={{
              fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif',
              color: "#7dd3fc",
            }}
          >
            Start moving forward.
          </motion.h3>
        </div>

        {/* CTA card */}
        <CTACard />

        {/* Footer */}
        <Footer />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{
          background: "linear-gradient(180deg, rgba(10,10,10,0) 0%, #050505 100%)",
        }}
      />
    </section>
  );
}

/* ---------------- Word reveal ---------------- */

function WordReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { margin: "-30% 0px -30% 0px" });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!inView) return;
    setIndex(0);
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % WORDS.length);
    }, 1600);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="relative mx-auto flex h-[60vh] min-h-[420px] max-w-[1200px] items-center justify-center"
    >
      {/* faint horizontal beam */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[80%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(125,211,252,0.4), transparent)",
          boxShadow: "0 0 24px rgba(125,211,252,0.25)",
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={WORDS[index]}
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -30, filter: "blur(12px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-[80px] font-medium leading-none tracking-[-0.04em] md:text-[160px] lg:text-[220px]"
          style={{
            fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif',
            backgroundImage: "linear-gradient(180deg, #f5efe2 0%, #7dd3fc 60%, #5a4628 110%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            textShadow: "0 0 80px rgba(125,211,252,0.25)",
          }}
        >
          {WORDS[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------------- CTA card ---------------- */

function CTACard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-24 w-full max-w-[860px]"
    >
      <div
        className="rounded-[28px] p-[1.5px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(125,211,252,0.65), rgba(255,255,255,0.06) 40%, rgba(125,211,252,0.55))",
          boxShadow: "0 60px 140px -40px rgba(125,211,252,0.45), 0 30px 80px -30px rgba(0,0,0,0.7)",
        }}
      >
        <div
          className="relative overflow-hidden rounded-[28px] p-10 text-center backdrop-blur-xl md:p-16"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(125,211,252,0.12), rgba(20,18,16,0.92) 60%), linear-gradient(180deg, rgba(20,18,16,0.9) 0%, rgba(12,11,10,0.96) 100%)",
          }}
        >
          {/* corner glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full blur-[120px]"
            style={{
              background: "radial-gradient(closest-side, rgba(125,211,252,0.35), transparent 70%)",
            }}
          />

          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-[#bfbfbf]">
              <Sparkles className="h-3 w-3" style={{ color: "#7dd3fc" }} strokeWidth={1.8} />
              Ready when you are
            </div>

            <h3
              className="text-balance text-[36px] font-bold uppercase leading-[1.05] tracking-[-0.03em] text-[#f3ede2] md:text-[56px]"
              style={{ fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif' }}
            >
              Ready to see
              <br />
              <span className="" style={{ color: "#7dd3fc" }}>
                what's possible?
              </span>
            </h3>

            <p className="mx-auto mt-6 max-w-[520px] text-[15px] leading-relaxed text-[#a8a39a] md:text-[16px]">
              Describe your goal. TaskPilot will build the roadmap. You focus on execution.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <MagneticButton primary href="/app">
                Start Planning Free
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
              </MagneticButton>
            </div>

            <div className="mt-8 text-[11px] uppercase tracking-[0.22em] text-[#7a766f]">
              No credit card · Free forever plan
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { useNavigate } from "@tanstack/react-router";

function MagneticButton({
  children,
  primary,
  href = "#",
}: {
  children: React.ReactNode;
  primary?: boolean;
  href?: string;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
      navigate({ to: "/app" });
    }, 600); // Elegant delay before routing
  };

  return (
    <>
      <a
        ref={ref}
        href={href}
        onClick={handleClick}
        onMouseMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          setT({
            x: (e.clientX - (r.left + r.width / 2)) * 0.25,
            y: (e.clientY - (r.top + r.height / 2)) * 0.25,
          });
        }}
        onMouseLeave={() => setT({ x: 0, y: 0 })}
        style={{
          transform: `translate(${t.x}px, ${t.y}px)`,
          transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1)",
          ...(primary
            ? {
                background: "linear-gradient(180deg, #f3d896 0%, #7dd3fc 55%, #b58a4a 100%)",
                color: "#08090f",
                boxShadow:
                  "0 18px 50px -15px rgba(125,211,252,0.7), inset 0 1px 0 rgba(255,255,255,0.45)",
              }
            : {
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                color: "#f3ede2",
                border: "1px solid rgba(255,255,255,0.08)",
              }),
        }}
        className="group flex items-center gap-2 rounded-xl px-6 py-3.5 text-[14px] font-medium tracking-tight cursor-pointer"
      >
        {children}
      </a>
      {/* Elegant Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] bg-[#fbfaf8] animate-in fade-in duration-700 ease-in-out fill-mode-forwards pointer-events-none flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#7dd3fc] border-t-transparent animate-spin opacity-50" />
        </div>
      )}
    </>
  );
}

/* ---------------- Footer ---------------- */

function Footer() {
  return (
    <footer className="mx-auto mt-40 max-w-[1280px] border-t border-white/[0.06] pb-14 pt-10">
      <div className="text-center text-[12px] uppercase tracking-[0.35em] text-[#7a766f]">
        Pinnacle Labs Internship · Project 1
      </div>
    </footer>
  );
}

/* ---------------- Glowing path ---------------- */

function GlowingPath() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute left-1/2 top-0 h-full w-full -translate-x-1/2"
        preserveAspectRatio="none"
        viewBox="0 0 1200 2400"
      >
        <defs>
          <linearGradient id="pathGold" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="rgba(125,211,252,0)" />
            <stop offset="20%" stopColor="rgba(125,211,252,0.55)" />
            <stop offset="80%" stopColor="rgba(125,211,252,0.35)" />
            <stop offset="100%" stopColor="rgba(125,211,252,0)" />
          </linearGradient>
        </defs>
        <path
          d="M 600 0 Q 700 600 600 1200 T 600 2400"
          stroke="url(#pathGold)"
          strokeWidth="1.5"
          fill="none"
          style={{ filter: "drop-shadow(0 0 14px rgba(125,211,252,0.45))" }}
        />
        <path
          d="M 600 0 Q 500 600 600 1200 T 600 2400"
          stroke="url(#pathGold)"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}

/* ---------------- Atmosphere ---------------- */

function Atmosphere() {
  const particles = useMemo(
    () =>
      Array.from({ length: 56 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.6 + 0.4,
        delay: Math.random() * 8,
        dur: 10 + Math.random() * 12,
        opacity: 0.15 + Math.random() * 0.5,
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-[14%] h-[820px] w-[1200px] -translate-x-1/2 rounded-full blur-[160px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(125,211,252,0.18), rgba(125,211,252,0.05) 45%, transparent 75%)",
        }}
      />
      <div
        className="absolute left-1/2 bottom-[8%] h-[700px] w-[1000px] -translate-x-1/2 rounded-full blur-[160px]"
        style={{
          background: "radial-gradient(closest-side, rgba(180,130,80,0.18), transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 25%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(10,10,10,0.6) 80%)",
        }}
      />
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: "#7dd3fc",
            opacity: p.opacity,
            boxShadow: "0 0 6px rgba(125,211,252,0.7)",
            animation: `tp-float ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
    </div>
  );
}

export default FinalSection;
