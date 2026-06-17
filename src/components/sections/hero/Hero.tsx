import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Search,
  Command,
  Target,
  GitBranch,
  ListChecks,
  TrendingUp,
  Briefcase,
  Brain,
  Lightbulb,
  Building2,
  Check,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Navbar } from "./Navbar";

const CHIPS = [
  { icon: Target, label: "Learn React in 30 days" },
  { icon: Briefcase, label: "Become a Product Designer" },
  { icon: Building2, label: "Crack Google Interview" },
  { icon: TrendingUp, label: "Launch a Startup" },
];

const LOGOS = ["Linear", "Vercel", "Notion", "Framer", "Arc", "Raycast"];

export function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const [mx, setMx] = useState({ x: 0.5, y: 0.4 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMx({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-screen flex-col overflow-hidden pb-24"
      style={{ backgroundColor: "transparent", color: "#eaeaea" }}
    >
      {/* CENTERED HERO TEXT */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center px-6 pt-10 text-center lg:pt-14">
        <div className="relative z-20">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="mt-6 font-bold uppercase tracking-[-0.025em] text-white"
            style={{
              fontFamily: "Geist, sans-serif",
              lineHeight: 0.92,
              fontSize: "clamp(48px, 7.2vw, 116px)",
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
              Goals In.{" "}
              <span
                className="bg-clip-text text-transparent transition-all duration-500"
                style={{
                  backgroundImage: "linear-gradient(180deg, #c4b5fd 0%, #7dd3fc 55%, #6366f1 100%)",
                }}
              >
                Action Out
              </span>
              <span style={{ color: "#7dd3fc" }}>.</span>
            </div>
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#bfbfbf]"
        >
          AI turns any ambition into a daily plan that adapts to your pace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <MagneticButton primary href="/app">
            Start Planning Free
            <ArrowUpRight className="h-4 w-4" />
          </MagneticButton>
        </motion.div>
      </div>

      {/* CLOUD DASHBOARD — floating under text */}
      <div className="relative z-10 mx-auto mt-16 w-full max-w-[1180px] px-6 lg:mt-20">
        {/* cloud glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-6 -z-10 h-[420px] w-[90%] -translate-x-1/2 rounded-[100%] opacity-80 blur-3xl transition-transform duration-700 ease-out"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(125,211,252,0.35), transparent 70%), radial-gradient(40% 40% at 30% 70%, rgba(196,181,253,0.25), transparent 70%), radial-gradient(40% 40% at 70% 30%, rgba(99,102,241,0.28), transparent 70%)",
            transform: `translate(-50%, ${(mx.y - 0.5) * -50}px)`,
          }}
        />
        {/* soft underline shadow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 left-1/2 -z-10 h-16 w-[80%] -translate-x-1/2 rounded-[100%] blur-2xl transition-transform duration-700 ease-out"
          style={{
            background: "rgba(0,0,0,0.55)",
            transform: `translate(calc(-50% + ${(mx.x - 0.5) * 40}px), 0)`,
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
          style={{ perspective: 2200 }}
        >
          <div
            className="relative transition-transform duration-300 ease-out"
            style={{
              transform: `rotateX(${10 + (mx.y - 0.5) * -16}deg) rotateY(${(mx.x - 0.5) * 20}deg) translateZ(0)`,
              transformOrigin: "center top",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="absolute inset-0 rounded-[24px] pointer-events-none transition-opacity duration-300 ease-out z-50 mix-blend-overlay"
              style={{
                background: `linear-gradient(${180 + (mx.x - 0.5) * 60}deg, rgba(255,255,255,0.12), transparent 40%, rgba(125,211,252,0.05))`,
                opacity: 0.4 + (0.5 - mx.y) * 0.6,
              }}
            />
            <Dashboard />
          </div>
        </motion.div>

        {/* CHIPS row below dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
        >
          {CHIPS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-[11px] text-[#bfbfbf] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#7dd3fc]/30 hover:bg-[#7dd3fc]/[0.05] hover:text-white"
            >
              <Icon
                className="h-3 w-3 transition-colors group-hover:text-[#7dd3fc]"
                strokeWidth={1.6}
              />
              {label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* BOTTOM — trust logos */}
      <div className="relative z-10 mx-auto mt-20 flex w-full max-w-[1480px] flex-col items-center gap-4 px-8 lg:px-12">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#7a7a7a]">
          Trusted by builders at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] font-medium text-white/45">
          {LOGOS.map((n) => (
            <span key={n} className="transition-colors hover:text-white/80">
              {n}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============== BACKGROUND ============== */
function BackgroundLayer({ mx }: { mx: { x: number; y: number } }) {
  return (
    <>
      <div
        className="absolute inset-0 -z-30"
        style={{
          background: "radial-gradient(120% 80% at 50% 0%, rgba(23,23,23,0.4) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-30 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 85%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden">
        <Monolith className="left-[3%] top-[5%]" h="85%" rotate={-6} delay={0} />
        <Monolith className="right-[4%] top-[8%]" h="80%" rotate={5} delay={0.4} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 transition-transform duration-700 ease-out"
        style={{
          left: `calc(${mx.x * 100}% - 400px)`,
          top: `calc(${mx.y * 100}% - 400px)`,
          width: 800,
          height: 800,
          background:
            "radial-gradient(circle, rgba(196,181,253,0.10), rgba(125,211,252,0.04) 35%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[1100px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(125,211,252,0.10), transparent 70%)",
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-10">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-px w-px rounded-full"
            style={{
              top: `${(i * 71) % 100}%`,
              left: `${(i * 43) % 100}%`,
              background: i % 3 === 0 ? "#7dd3fc" : "#eaeaea",
              boxShadow:
                i % 3 === 0 ? "0 0 6px rgba(125,211,252,0.7)" : "0 0 4px rgba(234,234,234,0.4)",
            }}
            animate={{ opacity: [0.15, 0.7, 0.15] }}
            transition={{ duration: 3 + (i % 5), repeat: Infinity, delay: (i % 7) * 0.3 }}
          />
        ))}
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40"
        style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85) 90%)" }}
      />
    </>
  );
}

function Monolith({
  className,
  h,
  rotate,
  delay,
  opacity = 0.6,
}: {
  className: string;
  h: string;
  rotate: number;
  delay: number;
  opacity?: number;
}) {
  return (
    <motion.div
      className={`absolute ${className} w-[220px]`}
      style={{ height: h, transform: `rotate(${rotate}deg)`, opacity }}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: [0, -10, 0], opacity }}
      transition={{
        y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay },
        opacity: { duration: 1.4, delay },
      }}
    >
      <div
        className="relative h-full w-full rounded-[28px] border border-white/[0.05]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 50%, rgba(125,211,252,0.05) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 0 80px -20px rgba(125,211,252,0.15)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(196,181,253,0.5), transparent)",
          }}
        />
      </div>
    </motion.div>
  );
}

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
          const el = ref.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px, ${(e.clientY - r.top - r.height / 2) * 0.15}px)`;
        }}
        onMouseLeave={() => {
          if (ref.current) ref.current.style.transform = "translate(0,0)";
        }}
        className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-3 text-[12.5px] font-medium transition-transform duration-300 ease-out cursor-pointer ${
          primary
            ? "text-[#08090f]"
            : "border border-white/10 bg-white/[0.03] text-white backdrop-blur-md hover:bg-white/[0.06]"
        }`}
        style={
          primary
            ? {
                background: "linear-gradient(180deg, #c4b5fd 0%, #7dd3fc 100%)",
                boxShadow:
                  "0 18px 40px -15px rgba(125,211,252,0.55), inset 0 1px 0 rgba(255,255,255,0.4)",
              }
            : undefined
        }
      >
        {primary && (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        )}
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

/* ============== DASHBOARD — compact ============== */
function Dashboard() {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] border border-white/[0.07]"
      style={{
        background: "linear-gradient(180deg, #131313 0%, #0d0d0d 100%)",
        boxShadow: "0 50px 100px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* chrome */}
      <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-white/10" />
            <span className="h-2 w-2 rounded-full bg-white/10" />
            <span className="h-2 w-2 rounded-full bg-white/10" />
          </div>
          <div
            className="ml-2 flex items-center gap-1.5 text-[10px] text-[#7a7a7a]"
            style={{ fontFamily: "Geist Mono, monospace" }}
          >
            <Sparkles className="h-2.5 w-2.5" style={{ color: "#7dd3fc" }} strokeWidth={1.8} />
            taskpilot.ai<span className="text-white/30">/</span>dashboard
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 text-[10px] text-[#7a7a7a]">
          <Command className="h-2.5 w-2.5" /> K
        </span>
      </div>

      <div className="grid grid-cols-12 gap-2.5 p-3">
        {/* AI Goal Generator */}
        <div
          className="col-span-12 rounded-xl border border-white/[0.06] p-3"
          style={{
            background:
              "radial-gradient(120% 100% at 0% 0%, rgba(125,211,252,0.12), transparent 60%), #101010",
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-[#7a7a7a]">
              <Sparkles className="h-2.5 w-2.5" style={{ color: "#7dd3fc" }} strokeWidth={1.8} />
              AI Goal Generator
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-1.5 py-0.5 text-[9px] text-emerald-300">
              <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />{" "}
              Ready
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-[#7a7a7a]" />
            <span className="flex-1 truncate text-[12px] text-white">
              Become a Senior Product Designer at a FAANG company
            </span>
            <button
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-[#08090f]"
              style={{
                background: "linear-gradient(180deg, #c4b5fd, #7dd3fc)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              Generate
            </button>
          </div>
        </div>

        {/* Roadmap */}
        <Panel className="col-span-7" icon={GitBranch} title="Roadmap" badge="12 wk">
          <div className="space-y-1">
            {[
              { w: "W1–2", t: "Design Foundations", p: 100 },
              { w: "W3–5", t: "Figma & Prototyping", p: 78 },
              { w: "W6–8", t: "Research & Strategy", p: 42 },
              { w: "W9–10", t: "Portfolio Cases", p: 12 },
            ].map((row) => (
              <div key={row.w} className="flex items-center gap-2 text-[10.5px]">
                <span
                  className="w-10 shrink-0 text-[9px] uppercase text-[#7a7a7a]"
                  style={{ fontFamily: "Geist Mono, monospace" }}
                >
                  {row.w}
                </span>
                <span className="flex-1 truncate text-white">{row.t}</span>
                <div className="h-1 w-14 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.p}%`,
                      background: "linear-gradient(90deg, #c4b5fd, #7dd3fc)",
                    }}
                  />
                </div>
                <span
                  className="w-7 text-right text-[9px] text-[#bfbfbf]"
                  style={{ fontFamily: "Geist Mono, monospace" }}
                >
                  {row.p}%
                </span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Progress */}
        <Panel className="col-span-5" icon={TrendingUp} title="Progress">
          <div className="flex items-center gap-3">
            <Ring percent={68} />
            <div className="flex-1 space-y-1.5 text-[10.5px]">
              {[
                { l: "Streak", v: "42d" },
                { l: "Tasks", v: "318" },
                { l: "Skills", v: "12" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="flex items-center justify-between border-b border-white/[0.04] pb-1 last:border-0"
                >
                  <span className="text-[#bfbfbf]">{s.l}</span>
                  <span
                    className="font-medium text-white"
                    style={{ fontFamily: "Geist Mono, monospace" }}
                  >
                    {s.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Tasks */}
        <Panel className="col-span-5" icon={ListChecks} title="Today">
          <ul className="space-y-1.5 text-[11px]">
            {[
              { t: "Audit Stripe checkout", done: true },
              { t: "Sketch dashboard variants", done: true },
              { t: "Read NN/g heuristics", done: false },
            ].map((row) => (
              <li key={row.t} className="flex items-center gap-2">
                <span
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border"
                  style={{
                    borderColor: row.done ? "rgba(125,211,252,0.6)" : "rgba(255,255,255,0.12)",
                    background: row.done
                      ? "linear-gradient(180deg, #c4b5fd, #7dd3fc)"
                      : "transparent",
                  }}
                >
                  {row.done && <Check className="h-2 w-2 text-[#08090f]" strokeWidth={3} />}
                </span>
                <span className={row.done ? "text-[#7a7a7a] line-through" : "text-white"}>
                  {row.t}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Career Intelligence */}
        <Panel className="col-span-7" icon={Brain} title="Career Intelligence">
          <div className="space-y-1.5">
            {[
              { l: "Systems Thinking", v: 88 },
              { l: "Visual Craft", v: 74 },
              { l: "Product Strategy", v: 61 },
            ].map((s) => (
              <div key={s.l}>
                <div className="mb-0.5 flex items-center justify-between text-[10px]">
                  <span className="text-[#bfbfbf]">{s.l}</span>
                  <span className="text-white/70" style={{ fontFamily: "Geist Mono, monospace" }}>
                    {s.v}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${s.v}%`,
                      background: "linear-gradient(90deg, #7dd3fc, #c4b5fd)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Insight */}
        <div
          className="col-span-12 flex items-center gap-2.5 rounded-xl border border-white/[0.06] px-3 py-2.5"
          style={{
            background: "linear-gradient(90deg, rgba(125,211,252,0.06), transparent 60%), #101010",
          }}
        >
          <Lightbulb
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: "#7dd3fc" }}
            strokeWidth={1.8}
          />
          <p className="flex-1 text-[11px] text-[#eaeaea]">
            Stripe just opened <span className="text-white">2 Senior IC4</span> design roles, your
            readiness is <span className="text-white">87%</span>.
          </p>
          <ArrowUpRight className="h-3.5 w-3.5 text-[#7a7a7a]" />
        </div>
      </div>
    </div>
  );
}

function Panel({
  className = "",
  icon: Icon,
  title,
  badge,
  children,
}: {
  className?: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
    strokeWidth?: number;
  }>;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.06] p-3 ${className}`}
      style={{ background: "#101010" }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-[#7a7a7a]">
          <Icon className="h-2.5 w-2.5" style={{ color: "#7dd3fc" }} strokeWidth={1.8} />
          {title}
        </div>
        {badge && (
          <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 text-[9px] text-[#bfbfbf]">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Ring({ percent }: { percent: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[68px] w-[68px] shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="url(#rg)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
        />
        <defs>
          <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[14px] font-semibold text-white">{percent}%</span>
      </div>
    </div>
  );
}
