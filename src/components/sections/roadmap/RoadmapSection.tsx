import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Brain,
  Briefcase,
  Trophy,
  Check,
  Lightbulb,
  BarChart3,
} from "lucide-react";

type Milestone = {
  id: string;
  phase: string;
  title: string;
  items: string[];
  icon: typeof Target;
};

const MILESTONES: Milestone[] = [
  {
    id: "m0",
    phase: "00 / Origin",
    title: "Goal Selected",
    items: ["Intent locked", "Profile calibrated"],
    icon: Target,
  },
  {
    id: "m1",
    phase: "01 / Foundation",
    title: "Foundation",
    items: ["HTML", "CSS", "JavaScript"],
    icon: Lightbulb,
  },
  {
    id: "m2",
    phase: "02 / Craft",
    title: "Skill Building",
    items: ["React", "APIs", "Git & Workflow"],
    icon: Brain,
  },
  {
    id: "m3",
    phase: "03 / Proof",
    title: "Projects",
    items: ["Portfolio", "Analytics Dashboard", "SaaS Clone"],
    icon: Sparkles,
  },
  {
    id: "m4",
    phase: "04 / Sharpen",
    title: "Interview Prep",
    items: ["DSA", "System Design", "Mock Interviews"],
    icon: BarChart3,
  },
  {
    id: "m5",
    phase: "05 / Launch",
    title: "Applications",
    items: ["Microsoft", "Google", "Amazon"],
    icon: Briefcase,
  },
  {
    id: "m6",
    phase: "06 / Result",
    title: "Ready",
    items: ["87% Career Readiness", "Offers In Pipeline"],
    icon: Trophy,
  },
];

const PROMPTS = [
  "Become a Product Designer",
  "Land a Microsoft Internship",
  "Build a SaaS Business",
  "Crack FAANG in 6 months",
];

export function RoadmapSection() {
  const [prompt, setPrompt] = useState("Land a Microsoft Internship");
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mx, setMx] = useState({ x: 0.5, y: 0.4 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMx({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Auto-generate after section enters view
  const introRef = useRef<HTMLDivElement | null>(null);
  const introInView = useInView(introRef, { once: true, margin: "-20%" });

  useEffect(() => {
    if (introInView && !generated) {
      const t = setTimeout(() => setGenerated(true), 600);
      return () => clearTimeout(t);
    }
  }, [introInView, generated]);

  useEffect(() => {
    if (!generated) return;
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 2400);
      setProgress(Math.round(p * 87));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [generated]);

  return (
    <section
      id="roadmap"
      className="relative isolate overflow-hidden scroll-mt-24"
      style={{ backgroundColor: "transparent", color: "#eaeaea" }}
    >
      <Atmosphere />

      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 pb-40 pt-32 lg:px-12 lg:pt-48">
        {/* Editorial intro */}
        <div ref={introRef} className="mx-auto max-w-[920px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-[#bfbfbf] backdrop-blur-xl"
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: "#7dd3fc", boxShadow: "0 0 8px #7dd3fc" }}
            />
            The Method
          </motion.div>

          <div className="relative z-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-balance text-[44px] font-bold uppercase leading-[1.02] tracking-[-0.015em] text-[#f3ede2] md:text-[68px] lg:text-[84px]"
              style={{
                fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif',
              }}
            >
              <div
                className="transition-all duration-500 ease-out inline-block hover:scale-[1.03] hover:-translate-y-1"
                style={{
                  filter: "drop-shadow(0 0 0 rgba(125,211,252,0))",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "drop-shadow(0 20px 40px rgba(125,211,252,0.5))";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "drop-shadow(0 0 0 rgba(125,211,252,0))";
                }}
              >
                Every achievement
                <br />
                <span
                  className="transition-colors duration-500 hover:text-white"
                  style={{ color: "#7dd3fc" }}
                >
                  starts with a goal.
                </span>
              </div>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="mx-auto mt-7 max-w-[640px] text-[15px] leading-relaxed text-[#a8a39a] md:text-[17px]"
          >
            Every successful career, startup, skill, and transformation begins with a single
            decision. TaskPilot turns ambition into an executable roadmap.
          </motion.p>
        </div>

        {/* Command bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="mx-auto mt-16 w-full max-w-[760px]"
        >
          <CommandBar
            value={prompt}
            onChange={setPrompt}
            onGenerate={() => {
              setGenerated(false);
              setProgress(0);
              requestAnimationFrame(() => setGenerated(true));
            }}
          />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#7a766f]">Try</span>
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setPrompt(p)}
                className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[12px] text-[#bfbfbf] transition-all hover:border-[#7dd3fc]/30 hover:bg-white/[0.04] hover:text-[#f3ede2]"
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Roadmap experience */}
        <div className="relative mx-auto mt-32 max-w-[1180px]">
          <Roadmap generated={generated} progress={progress} />
          <FloatingInsights generated={generated} />
        </div>
      </div>

      {/* Bottom blend into next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{
          background: "linear-gradient(180deg, rgba(10,10,10,0) 0%, #08090f 100%)",
        }}
      />
    </section>
  );
}

/* ---------------- Atmosphere ---------------- */

function Atmosphere() {
  // Stable particle set
  const particles = useMemo(
    () =>
      Array.from({ length: 42 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.6 + 0.4,
        delay: Math.random() * 8,
        dur: 8 + Math.random() * 10,
        opacity: 0.15 + Math.random() * 0.5,
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* warm aurora */}
      <div
        className="absolute left-1/2 top-[8%] h-[760px] w-[1100px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(125,211,252,0.18), rgba(125,211,252,0.06) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute right-[-10%] top-[40%] h-[520px] w-[520px] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(closest-side, rgba(180,130,80,0.18), transparent 70%)",
        }}
      />
      <div
        className="absolute left-[-10%] bottom-[6%] h-[560px] w-[560px] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(closest-side, rgba(120,90,60,0.18), transparent 70%)",
        }}
      />

      {/* fine grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* fog */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(10,10,10,0.55) 75%)",
        }}
      />

      {/* particles */}
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

      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      <style>{`
        @keyframes tp-float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: var(--o, 0.3); }
          50% { transform: translateY(-22px) translateX(8px); opacity: 0.9; }
        }
        @keyframes tp-pulse-line {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

/* ---------------- Command Bar ---------------- */

function CommandBar({
  value,
  onChange,
  onGenerate,
}: {
  value: string;
  onChange: (s: string) => void;
  onGenerate: () => void;
}) {
  return (
    <div
      className="group relative rounded-2xl p-[1px] transition-all duration-300 hover:scale-[1.01]"
      style={{
        background:
          "linear-gradient(135deg, rgba(125,211,252,0.45), rgba(125,211,252,0.05) 40%, rgba(255,255,255,0.04) 60%, rgba(125,211,252,0.35))",
        boxShadow: "0 30px 80px -30px rgba(125,211,252,0.35), 0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "0 0 40px rgba(125,211,252,0.2)" }}
      />
      <div
        className="relative flex items-center gap-3 rounded-2xl px-5 py-4 backdrop-blur-xl"
        style={{
          background: "linear-gradient(180deg, rgba(20,18,16,0.9) 0%, rgba(12,11,10,0.95) 100%)",
        }}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03]">
          <Sparkles className="h-3.5 w-3.5" style={{ color: "#7dd3fc" }} strokeWidth={1.8} />
        </div>
        <span className="hidden text-[11px] uppercase tracking-[0.22em] text-[#7a766f] md:inline">
          I want to
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onGenerate()}
          className="flex-1 bg-transparent text-[15px] text-[#f3ede2] outline-none placeholder:text-[#7a766f] md:text-[17px]"
          placeholder="become a Product Designer…"
        />
        <button
          onClick={onGenerate}
          className="group/btn relative flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-[#08090f] transition-transform hover:scale-[1.02]"
          style={{
            background: "linear-gradient(180deg, #f3d896 0%, #7dd3fc 55%, #b58a4a 100%)",
            boxShadow:
              "0 10px 30px -10px rgba(125,211,252,0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          Generate
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- Roadmap ---------------- */

function Roadmap({ generated, progress }: { generated: boolean; progress: number }) {
  return (
    <div className="relative">
      {/* central glowing journey line */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-[2px] -translate-x-1/2 md:block"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(125,211,252,0.65) 8%, rgba(125,211,252,0.9) 50%, rgba(125,211,252,0.55) 92%, transparent 100%)",
          boxShadow: "0 0 24px rgba(125,211,252,0.45)",
          maskImage: generated
            ? "linear-gradient(180deg, black 0%, black 100%)"
            : "linear-gradient(180deg, black 0%, transparent 0%)",
          transition: "mask-image 2.4s cubic-bezier(0.22,1,0.36,1)",
          WebkitMaskImage: generated
            ? "linear-gradient(180deg, black 0%, black 100%)"
            : "linear-gradient(180deg, black 0%, transparent 0%)",
          WebkitTransition: "-webkit-mask-image 2.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      />

      <div className="space-y-16 md:space-y-24">
        {MILESTONES.map((m, i) => (
          <MilestoneNode
            key={m.id}
            milestone={m}
            index={i}
            generated={generated}
            progress={progress}
          />
        ))}
      </div>
    </div>
  );
}

function MilestoneNode({
  milestone,
  index,
  generated,
  progress,
}: {
  milestone: Milestone;
  index: number;
  generated: boolean;
  progress: number;
}) {
  const isLeft = index % 2 === 0;
  const Icon = milestone.icon;
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-25%" });
  const show = generated && inView;
  const isFinal = index === MILESTONES.length - 1;

  return (
    <div
      ref={ref}
      className="relative group grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-12 transition-all duration-300 hover:scale-[1.01]"
    >
      {/* left card */}
      <div className={`md:pr-6 ${isLeft ? "md:text-right" : "md:order-3 md:pl-6"}`}>
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, y: 24, x: isLeft ? -18 : 18 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-[11px] uppercase tracking-[0.28em]" style={{ color: "#7dd3fc" }}>
                {milestone.phase}
              </div>
              <h4
                className="mt-2 text-[28px] font-bold uppercase leading-[1.05] tracking-[-0.02em] text-[#f3ede2] md:text-[40px]"
                style={{ fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif' }}
              >
                {milestone.title}
              </h4>
              <ul className={`mt-4 flex flex-wrap gap-2 ${isLeft ? "md:justify-end" : ""}`}>
                {milestone.items.map((it, j) => (
                  <motion.li
                    key={it}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.12 + 0.25 + j * 0.08, duration: 0.5 }}
                    className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#cfcabf] backdrop-blur"
                  >
                    {it}
                  </motion.li>
                ))}
              </ul>
              {isFinal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.12 + 0.5, duration: 0.6 }}
                  className={`mt-5 inline-flex items-center gap-3 rounded-xl border border-[#7dd3fc]/30 bg-[#7dd3fc]/[0.06] px-4 py-3 ${
                    isLeft ? "md:ml-auto" : ""
                  }`}
                  style={{ boxShadow: "0 0 40px rgba(125,211,252,0.2)" }}
                >
                  <Trophy className="h-4 w-4" style={{ color: "#7dd3fc" }} />
                  <div className="text-[12px] text-[#cfcabf]">
                    Career readiness:{" "}
                    <span className="font-semibold text-[#f3ede2]">{progress}%</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* center node */}
      <div className="relative flex items-center justify-center md:order-2">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={show ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* halo */}
          <div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: "radial-gradient(closest-side, rgba(125,211,252,0.55), transparent 70%)",
            }}
          />
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-full md:h-16 md:w-16"
            style={{
              background: "linear-gradient(180deg, #1a1612 0%, #0c0a08 100%)",
              border: "1px solid rgba(125,211,252,0.45)",
              boxShadow: "inset 0 1px 0 rgba(196,181,253,0.18), 0 0 32px rgba(125,211,252,0.35)",
            }}
          >
            <Icon
              className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-300 group-hover:scale-110"
              style={{ color: "#7dd3fc" }}
              strokeWidth={1.6}
            />
          </div>
          {/* index */}
          <div
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-[#08090f]"
            style={{
              background: "linear-gradient(180deg, #f3d896, #7dd3fc)",
              boxShadow: "0 4px 12px rgba(125,211,252,0.5)",
            }}
          >
            {index}
          </div>
        </motion.div>
      </div>

      {/* opposite spacer (kept empty on purpose to alternate) */}
      <div className={isLeft ? "md:order-3" : "md:order-1"} />
    </div>
  );
}

/* ---------------- Floating insights ---------------- */

const INSIGHTS = [
  {
    label: "Market Demand",
    title: "Software Engineering",
    value: "↑ 28%",
    icon: TrendingUp,
    pos: "top-[8%] left-[-2%]",
    accent: true,
  },
  {
    label: "Placement Probability",
    title: "Across top tier",
    value: "82%",
    icon: Target,
    pos: "top-[26%] right-[-3%]",
  },
  {
    label: "Average Salary",
    title: "Entry · India",
    value: "₹18–25 LPA",
    icon: Briefcase,
    pos: "top-[52%] left-[-4%]",
  },
  {
    label: "Missing Skill",
    title: "Detected gap",
    value: "System Design",
    icon: Brain,
    pos: "top-[64%] right-[-2%]",
    accent: true,
  },
  {
    label: "Recommended",
    title: "Next 14 days",
    value: "Solve 50 Leetcode",
    icon: Lightbulb,
    pos: "top-[84%] left-[-1%]",
  },
];

function FloatingInsights({ generated }: { generated: boolean }) {
  return (
    <div aria-hidden="false" className="pointer-events-none absolute inset-0 hidden lg:block">
      {INSIGHTS.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={generated ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ delay: 0.6 + i * 0.18, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute w-[230px] ${card.pos}`}
            style={{
              animation: generated
                ? `tp-float ${10 + i}s ease-in-out ${i * 0.6}s infinite`
                : undefined,
            }}
          >
            <div
              className="rounded-2xl p-[1px]"
              style={{
                background: card.accent
                  ? "linear-gradient(135deg, rgba(125,211,252,0.5), rgba(255,255,255,0.04))"
                  : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
              }}
            >
              <div
                className="rounded-2xl p-4 backdrop-blur-xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(22,20,18,0.85) 0%, rgba(12,11,10,0.9) 100%)",
                  boxShadow: "0 24px 60px -25px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#7a766f]">
                  <Icon className="h-3 w-3" style={{ color: "#7dd3fc" }} />
                  {card.label}
                </div>
                <div className="mt-2 text-[13px] text-[#a8a39a]">{card.title}</div>
                <div
                  className="mt-1 text-[20px] font-medium tracking-tight text-[#f3ede2]"
                  style={{ fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif' }}
                >
                  {card.value}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default RoadmapSection;
