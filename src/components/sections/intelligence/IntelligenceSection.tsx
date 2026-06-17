import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  TrendingUp,
  Sparkles,
  Brain,
  Target,
  Briefcase,
  Building2,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const COMPANIES = [
  { name: "Microsoft", match: 91 },
  { name: "Google", match: 78 },
  { name: "Amazon", match: 84 },
  { name: "Adobe", match: 89 },
];

const STRONG = ["React", "JavaScript", "Node.js", "UI Design"];
const MISSING = ["System Design", "Advanced DSA", "Cloud Architecture", "Interview Prep"];

const MARKET = [
  { role: "Frontend Engineer", delta: "+28%" },
  { role: "AI Engineer", delta: "+47%" },
  { role: "Product Designer", delta: "+19%" },
];

const FLOATING = [
  {
    label: "Top Recruiter",
    value: "Microsoft",
    icon: Building2,
    pos: "top-[4%] left-[-3%]",
    accent: true,
  },
  { label: "Placement Probability", value: "82%", icon: Target, pos: "top-[22%] right-[-3%]" },
  { label: "Hiring Trend", value: "Increasing", icon: TrendingUp, pos: "top-[52%] left-[-4%]" },
  {
    label: "Recommended Project",
    value: "Full Stack SaaS",
    icon: Layers,
    pos: "top-[68%] right-[-2%]",
    accent: true,
  },
  { label: "Weekly Focus", value: "System Design", icon: Cpu, pos: "top-[88%] left-[-2%]" },
];

export function IntelligenceSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [progress, setProgress] = useState(0); // 0..1
  const [mx, setMx] = useState({ x: 0.5, y: 0.4 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMx({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 2200);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const readiness = Math.round(87 * progress);
  const salaryLow = Math.round(8 + (18 - 8) * progress);
  const salaryHigh = Math.round(12 + (24 - 12) * progress);

  return (
    <section
      id="intelligence"
      className="relative isolate overflow-hidden scroll-mt-24"
      style={{ backgroundColor: "transparent", color: "#eaeaea" }}
    >
      <Atmosphere />

      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-6 pb-44 pt-32 lg:px-12 lg:pt-40">
        {/* Editorial header */}
        <div className="mx-auto max-w-[1000px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.02] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-[#bfbfbf] backdrop-blur-xl"
          >
            <span
              className="h-1 w-1 rounded-full"
              style={{ background: "#7dd3fc", boxShadow: "0 0 8px #7dd3fc" }}
            />
            Career Intelligence
          </motion.div>

          <div className="relative z-20">
            <motion.h2
              initial={{ opacity: 0, y: 22 }}
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
                Your career has data.
                <br />
                <span
                  className="transition-colors duration-500 hover:text-white"
                  style={{ color: "#7dd3fc" }}
                >
                  Most never see it.
                </span>
              </div>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="mx-auto mt-7 max-w-[680px] text-[15px] leading-relaxed text-[#a8a39a] md:text-[17px]"
          >
            TaskPilot analyzes your current skills, dream role, industry trends, hiring signals, and
            market demand to build personalized career intelligence.
          </motion.p>
        </div>

        {/* Dashboard */}
        <div
          ref={ref}
          className="relative mx-auto mt-24 max-w-[1180px]"
          style={{ perspective: 2200 }}
        >
          <div
            className="relative transition-transform duration-300 ease-out"
            style={{
              transform: `rotateX(${10 + (mx.y - 0.5) * -16}deg) rotateY(${(mx.x - 0.5) * 20}deg) translateZ(0)`,
              transformOrigin: "center center",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute inset-0 rounded-[28px] pointer-events-none transition-opacity duration-300 ease-out z-50 mix-blend-overlay"
              style={{
                background: `linear-gradient(${180 + (mx.x - 0.5) * 60}deg, rgba(255,255,255,0.12), transparent 40%, rgba(125,211,252,0.05))`,
                opacity: 0.4 + (0.5 - mx.y) * 0.6,
              }}
            />
            <Dashboard
              progress={progress}
              readiness={readiness}
              salaryLow={salaryLow}
              salaryHigh={salaryHigh}
            />
            <FloatingCards visible={inView} />
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </section>
  );
}

/* ---------------- Dashboard ---------------- */

function Dashboard({
  progress,
  readiness,
  salaryLow,
  salaryHigh,
}: {
  progress: number;
  readiness: number;
  salaryLow: number;
  salaryHigh: number;
}) {
  return (
    <div
      className="relative rounded-[28px] p-[1px]"
      style={{
        background:
          "linear-gradient(135deg, rgba(125,211,252,0.4), rgba(255,255,255,0.04) 35%, rgba(255,255,255,0.02) 65%, rgba(125,211,252,0.28))",
        boxShadow: "0 60px 140px -50px rgba(0,0,0,0.8), 0 30px 80px -30px rgba(125,211,252,0.25)",
      }}
    >
      <div
        className="rounded-[28px] p-6 backdrop-blur-xl md:p-10"
        style={{
          background: "linear-gradient(180deg, rgba(20,18,16,0.9) 0%, rgba(12,11,10,0.96) 100%)",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{
                background: "linear-gradient(180deg, #1a1612, #0c0a08)",
                border: "1px solid rgba(125,211,252,0.3)",
              }}
            >
              <Sparkles className="h-3 w-3" style={{ color: "#7dd3fc" }} strokeWidth={1.8} />
            </div>
            <span className="text-[12px] uppercase tracking-[0.24em] text-[#bfbfbf]">
              Intelligence · Live
            </span>
          </div>
          <div className="text-[11px] text-[#7a766f]">Synced just now</div>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-7 lg:grid-cols-[1.1fr_1.4fr]">
          {/* Left column */}
          <div className="space-y-6">
            <ReadinessRing readiness={readiness} progress={progress} />
            <SalaryProjection low={salaryLow} high={salaryHigh} progress={progress} />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Panel title="Dream Company Match" hint="Match score">
              <div className="space-y-3">
                {COMPANIES.map((c, i) => (
                  <div key={c.name}>
                    <div className="mb-1.5 flex items-center justify-between text-[12px] text-[#cfcabf]">
                      <span>{c.name}</span>
                      <span className="tabular-nums" style={{ color: "#7dd3fc" }}>
                        {Math.round(c.match * progress)}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.match * progress}%` }}
                        transition={{
                          duration: 1.2,
                          delay: 0.1 + i * 0.1,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="h-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, #b58a4a 0%, #7dd3fc 60%, #f3d896 100%)",
                          boxShadow: "0 0 12px rgba(125,211,252,0.4)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Panel title="Skills Strong" hint={`${STRONG.length} confirmed`}>
                <ul className="space-y-2">
                  {STRONG.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-[12px] text-[#cfcabf]">
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        style={{ color: "#9ec79c" }}
                        strokeWidth={2}
                      />
                      {s}
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="Missing Skills" hint="Priority gaps">
                <ul className="space-y-2">
                  {MISSING.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-[12px] text-[#cfcabf]">
                      <AlertCircle
                        className="h-3.5 w-3.5"
                        style={{ color: "#7dd3fc" }}
                        strokeWidth={2}
                      />
                      {s}
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>

            <Panel title="Market Intelligence" hint="Last 30 days">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {MARKET.map((m) => (
                  <div
                    key={m.role}
                    className="group/market rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition-all duration-300 hover:bg-white/[0.05] hover:scale-105 hover:border-[#7dd3fc]/30"
                  >
                    <div className="text-[11px] uppercase tracking-[0.18em] text-[#7a766f]">
                      Demand
                    </div>
                    <div className="mt-1 text-[13px] text-[#f3ede2] transition-colors group-hover/market:text-white">
                      {m.role}
                    </div>
                    <div
                      className="mt-2 flex items-center gap-1 text-[13px] transition-transform duration-300 group-hover/market:-translate-y-0.5"
                      style={{ color: "#7dd3fc" }}
                    >
                      <TrendingUp className="h-3 w-3" strokeWidth={2} />
                      <span className="tabular-nums">{m.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="group rounded-2xl border border-white/[0.05] p-4 md:p-5 transition-all duration-300 hover:bg-white/[0.02] hover:border-white/[0.1] hover:scale-[1.01]"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#bfbfbf]">{title}</div>
        {hint && (
          <div className="text-[10px] uppercase tracking-[0.18em] text-[#7a766f]">{hint}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function ReadinessRing({ readiness, progress }: { readiness: number; progress: number }) {
  const size = 200;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (readiness / 100) * c;

  return (
    <div
      className="rounded-2xl border border-white/[0.05] p-5"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#bfbfbf]">
          Career Readiness
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-[#7a766f]">Overall</div>
      </div>
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width={size} height={size} className="-rotate-90">
            <defs>
              <linearGradient id="ringGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3d896" />
                <stop offset="60%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#8a6a3a" />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={stroke}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="url(#ringGold)"
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ filter: "drop-shadow(0 0 12px rgba(125,211,252,0.5))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="tabular-nums text-[48px] font-medium leading-none tracking-[-0.04em] text-[#f3ede2]"
              style={{ fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif' }}
            >
              {readiness}%
            </div>
            <div
              className="mt-2 text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "#7dd3fc" }}
            >
              Calibrated
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-center text-[12px] text-[#a8a39a]">
        Composite of skills, projects, market fit & interview signals.
      </div>
    </div>
  );
}

function SalaryProjection({
  low,
  high,
  progress,
}: {
  low: number;
  high: number;
  progress: number;
}) {
  return (
    <div
      className="rounded-2xl border border-white/[0.05] p-5"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.005))",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#bfbfbf]">
          Salary Potential
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-[#7a766f]">India · Annual</div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#7a766f]">
            Current readiness
          </div>
          <div
            className="mt-1 text-[26px] font-medium tracking-[-0.02em] text-[#cfcabf]"
            style={{ fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif' }}
          >
            ₹8–12 <span className="text-[#7a766f]">LPA</span>
          </div>
        </div>

        <div className="relative h-px w-full bg-white/[0.06]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 left-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(125,211,252,0), #7dd3fc, rgba(125,211,252,0))",
              boxShadow: "0 0 16px rgba(125,211,252,0.6)",
            }}
          />
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#7dd3fc" }}>
            After completing roadmap
          </div>
          <div
            className="mt-1 text-[34px] font-medium leading-none tracking-[-0.03em] text-[#f3ede2] md:text-[40px]"
            style={{
              fontFamily: '"Geist", ui-sans-serif, system-ui, sans-serif',
              backgroundImage: "linear-gradient(180deg, #f5efe2, #7dd3fc)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            ₹{salaryRange(low, high)} <span className="text-[#a8a39a]">LPA</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function salaryRange(low: number, high: number) {
  return `${low}–${high}`;
}

/* ---------------- Floating cards ---------------- */

function FloatingCards({ visible }: { visible: boolean }) {
  return (
    <div aria-hidden="false" className="pointer-events-none absolute inset-0 hidden xl:block">
      {FLOATING.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 18, scale: 0.96, z: 30 }}
            animate={visible ? { opacity: 1, y: 0, scale: 1, z: 80 + i * 15 } : {}}
            transition={{ delay: 0.5 + i * 0.16, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute w-[220px] ${card.pos}`}
            style={{
              animation: visible
                ? `tp-float ${11 + i}s ease-in-out ${i * 0.7}s infinite`
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
                <div
                  className="mt-2 text-[20px] font-medium tracking-tight text-[#f3ede2]"
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

/* ---------------- Atmosphere ---------------- */

function Atmosphere() {
  const particles = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.6 + 0.4,
        delay: Math.random() * 8,
        dur: 9 + Math.random() * 10,
        opacity: 0.15 + Math.random() * 0.5,
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-[6%] h-[720px] w-[1100px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(125,211,252,0.16), rgba(125,211,252,0.05) 45%, transparent 70%)",
        }}
      />
      <div
        className="absolute left-[-12%] top-[45%] h-[520px] w-[520px] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(closest-side, rgba(120,90,60,0.2), transparent 70%)",
        }}
      />
      <div
        className="absolute right-[-10%] bottom-[10%] h-[560px] w-[560px] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(closest-side, rgba(180,130,80,0.18), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(10,10,10,0.55) 75%)",
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

export default IntelligenceSection;
