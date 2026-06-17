import { useEffect, useMemo, useRef, useState } from "react";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ============================================================
 * Intelligence Core — a living neural atmosphere.
 * Canvas2D: orbiting energy filaments, breathing nucleus,
 * cursor-reactive flow, signals collapsing inward.
 * ========================================================== */
function IntelligenceCore({
  progressRef,
  pointer,
  visibilityRef,
  responseRef,
}: {
  progressRef: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  visibilityRef: React.MutableRefObject<number>;
  responseRef: React.MutableRefObject<number>; // 0..1 response activation
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = window.innerWidth;
    let H = window.innerHeight;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Inflowing signal particles — collapse from edges toward core,
    // then orbit, then disperse back as "responses" radiate outward.
    type P = {
      angle: number;
      radius: number;
      targetRadius: number;
      speed: number;
      life: number;
      hue: number;
      size: number;
      alpha: number;
      mode: "inflow" | "orbit" | "outflow";
    };
    const NUM = 900;
    const ps: P[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const spawn = (i: number, mode: P["mode"] = "inflow") => {
      const angle = Math.random() * Math.PI * 2;
      ps[i] = {
        angle,
        radius: mode === "outflow" ? rand(40, 80) : rand(Math.min(W, H) * 0.55, Math.min(W, H) * 0.9),
        targetRadius: rand(70, 180),
        speed: rand(0.002, 0.008) * (Math.random() < 0.5 ? 1 : -1),
        life: 0,
        hue: Math.floor(Math.random() * 4),
        size: rand(0.5, 1.6),
        alpha: rand(0.35, 0.9),
        mode,
      };
    };
    for (let i = 0; i < NUM; i++) spawn(i);

    // Neural filaments — long orbiting curves
    type Fil = { angle: number; radius: number; speed: number; len: number; phase: number };
    const FIL_COUNT = 32;
    const fils: Fil[] = [];
    for (let i = 0; i < FIL_COUNT; i++) {
      fils.push({
        angle: Math.random() * Math.PI * 2,
        radius: rand(90, 260),
        speed: rand(0.0008, 0.003) * (Math.random() < 0.5 ? 1 : -1),
        len: rand(0.6, 1.8),
        phase: Math.random() * Math.PI * 2,
      });
    }

    const HUES: [number, number, number][] = [
      [180, 215, 255],
      [170, 240, 220],
      [225, 215, 255],
      [255, 220, 190],
    ];

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;

      const p = progressRef.current;
      const vis = visibilityRef.current;
      const resp = responseRef.current;

      // Phase curves
      const collapse = clamp01((p - 0.0) / 0.18); // signals collapsing inward (entry)
      const formed = clamp01((p - 0.16) / 0.12); // core formed
      const reveal = clamp01((p - 0.62) / 0.16); // planetary network reveals
      const close = clamp01((p - 0.86) / 0.10); // final expansion

      const cx = W * 0.5 + pointer.current.x * 20;
      const cy = H * 0.52 - pointer.current.y * 16;

      // Background motion trail — feels atmospheric
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(3,5,12,${0.18 + reveal * 0.05})`;
      ctx.fillRect(0, 0, W, H);

      // ---- Aurora veils behind core (soft radial sweeps)
      const veilCount = 3;
      ctx.globalCompositeOperation = "lighter";
      for (let v = 0; v < veilCount; v++) {
        const r = (180 + v * 110) * (1 + reveal * 0.6);
        const a = (0.06 + formed * 0.05) * vis * (1 - v * 0.25);
        const grd = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
        const hue = HUES[v % HUES.length];
        grd.addColorStop(0, `rgba(${hue[0]},${hue[1]},${hue[2]},${a.toFixed(3)})`);
        grd.addColorStop(1, `rgba(${hue[0]},${hue[1]},${hue[2]},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- Neural filaments — long orbiting arcs
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 0.7;
      for (let i = 0; i < fils.length; i++) {
        const f = fils[i];
        f.angle += f.speed * dt * (1 + resp * 1.5);
        const baseR = f.radius * (1 + Math.sin(now * 0.0008 + f.phase) * 0.04);
        const r = lerp(baseR * 1.5, baseR, formed) * (1 + reveal * 0.8);
        const hue = HUES[i % HUES.length];
        const a = (0.18 + resp * 0.25) * vis * formed;
        ctx.strokeStyle = `rgba(${hue[0]},${hue[1]},${hue[2]},${a.toFixed(3)})`;
        ctx.beginPath();
        const seg = 40;
        for (let s = 0; s <= seg; s++) {
          const t = s / seg;
          const ang = f.angle + t * f.len;
          const rr = r + Math.sin(t * Math.PI * 2 + now * 0.001 + i) * 6;
          const x = cx + Math.cos(ang) * rr;
          const y = cy + Math.sin(ang) * rr * 0.9;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ---- Signal particles
      const cursorX = (pointer.current.x * 0.5 + 0.5) * W;
      const cursorY = (-pointer.current.y * 0.5 + 0.5) * H;

      for (let i = 0; i < ps.length; i++) {
        const pt = ps[i];

        // Mode transitions driven by phases
        if (pt.mode === "inflow" && pt.radius < pt.targetRadius + 4) {
          pt.mode = "orbit";
          pt.life = 0;
        }
        if (resp > 0.7 && pt.mode === "orbit" && Math.random() < 0.01) {
          pt.mode = "outflow";
        }
        if (pt.mode === "outflow" && pt.radius > Math.max(W, H) * 0.7) {
          spawn(i, "inflow");
          continue;
        }

        if (pt.mode === "inflow") {
          pt.radius -= (1.2 + collapse * 2.5) * dt;
        } else if (pt.mode === "orbit") {
          pt.angle += pt.speed * dt * (1 + resp * 2);
          pt.radius += Math.sin(now * 0.002 + i) * 0.2;
        } else {
          pt.radius += (2 + resp * 4) * dt;
          pt.angle += pt.speed * dt * 0.6;
        }

        // Cursor influence — bend trajectories near pointer
        const px = cx + Math.cos(pt.angle) * pt.radius;
        const py = cy + Math.sin(pt.angle) * pt.radius * 0.9;
        const dx = px - cursorX;
        const dy = py - cursorY;
        const d2 = dx * dx + dy * dy;
        if (d2 < 18000) {
          const f = (1 - d2 / 18000) * 0.6;
          pt.angle += f * 0.04 * (Math.sign(Math.sin(pt.angle)) || 1);
        }

        const hue = HUES[pt.hue];
        const fadeIn =
          pt.mode === "inflow"
            ? clamp01(1 - pt.radius / (Math.min(W, H) * 0.9))
            : 1;
        const a = pt.alpha * vis * fadeIn * (pt.mode === "outflow" ? 0.7 : 1);
        ctx.fillStyle = `rgba(${hue[0]},${hue[1]},${hue[2]},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, pt.size, 0, Math.PI * 2);
        ctx.fill();

        // Connecting hairlines to neighbors (sparse)
        if (pt.mode === "orbit" && i % 7 === 0) {
          const j = (i + 13) % ps.length;
          const qj = ps[j];
          if (qj.mode === "orbit") {
            const qx = cx + Math.cos(qj.angle) * qj.radius;
            const qy = cy + Math.sin(qj.angle) * qj.radius * 0.9;
            const dd = Math.hypot(qx - px, qy - py);
            if (dd < 140) {
              ctx.strokeStyle = `rgba(${hue[0]},${hue[1]},${hue[2]},${(a * 0.18 * (1 - dd / 140)).toFixed(3)})`;
              ctx.lineWidth = 0.4;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(qx, qy);
              ctx.stroke();
            }
          }
        }
      }

      // ---- Living nucleus
      const beat = 1 + Math.sin(now * 0.0025) * 0.06 + resp * 0.2;
      const coreR = (44 + formed * 22) * beat;
      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.4);
      coreGrd.addColorStop(0, `rgba(240,248,255,${(0.85 * vis * formed).toFixed(3)})`);
      coreGrd.addColorStop(0.25, `rgba(190,220,255,${(0.45 * vis * formed).toFixed(3)})`);
      coreGrd.addColorStop(0.6, `rgba(120,160,230,${(0.18 * vis * formed).toFixed(3)})`);
      coreGrd.addColorStop(1, `rgba(40,70,140,0)`);
      ctx.fillStyle = coreGrd;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Concentric pulse rings
      for (let r = 0; r < 4; r++) {
        const rr = coreR + r * 28 + Math.sin(now * 0.001 + r) * 4;
        const a = (0.18 - r * 0.04) * vis * formed * (1 + resp * 0.6);
        ctx.strokeStyle = `rgba(200,225,255,${a.toFixed(3)})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ---- Planetary network reveal — orbiting nodes connected back to core
      if (reveal > 0.02) {
        const nodeCount = 9;
        const ringR = lerp(Math.min(W, H) * 0.34, Math.min(W, H) * 0.42, reveal);
        for (let i = 0; i < nodeCount; i++) {
          const ang = (i / nodeCount) * Math.PI * 2 + now * 0.00015;
          const nx = cx + Math.cos(ang) * ringR;
          const ny = cy + Math.sin(ang) * ringR * 0.78;
          const a = reveal * vis * 0.55;
          ctx.strokeStyle = `rgba(170,210,255,${(a * 0.4).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          // Node dot
          ctx.fillStyle = `rgba(220,235,255,${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(nx, ny, 1.8 + Math.sin(now * 0.003 + i) * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---- Final expansion bloom
      if (close > 0.01) {
        const er = lerp(coreR, Math.max(W, H) * 0.9, close);
        const grd = ctx.createRadialGradient(cx, cy, coreR, cx, cy, er);
        grd.addColorStop(0, `rgba(230,240,255,${(0.35 * close).toFixed(3)})`);
        grd.addColorStop(1, `rgba(230,240,255,0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, er, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [pointer, progressRef, visibilityRef, responseRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[54]"
      aria-hidden
    />
  );
}

/* ============================================================
 * Headline — UNDERSTANDING THE PLANET / REQUIRES MORE THAN DATA.
 * ========================================================== */
function Headline({ progress }: { progress: number }) {
  const l1 = clamp01((progress - 0.05) / 0.05);
  const l2 = clamp01((progress - 0.16) / 0.06);
  const out = clamp01(1 - (progress - 0.52) / 0.08);
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[12%] z-[60] flex flex-col items-center px-8 sm:px-12"
      style={{ opacity: out }}
    >
      <div className="font-mono-ui mb-5 text-[10px] tracking-[0.3em] text-foreground/45">
        CHAPTER 07 · WEATHERWATCH AI
      </div>
      <div className="text-center font-editorial">
        <Reveal t={l1} className="text-[8vw] text-foreground/95 sm:text-[4.4vw] lg:text-[3.4vw]">
          Understanding the planet
        </Reveal>
        <Reveal
          t={l2}
          className="mt-2 text-[10vw] italic text-foreground sm:text-[5.8vw] lg:text-[4.6vw]"
          glow
        >
          requires more than data.
        </Reveal>
      </div>
    </div>
  );
}

function Reveal({
  t,
  children,
  className,
  glow,
}: {
  t: number;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className="overflow-hidden pb-[0.18em]">
      <div
        className={className}
        style={{
          transform: `translateY(${(1 - t) * 110}%)`,
          transition: "transform 700ms cubic-bezier(.22,1,.36,1)",
          textShadow: glow ? "0 0 60px rgba(200,220,255,0.5)" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================
 * Orbiting questions — emerge around the intelligence.
 * User selects one; AI "responds" via environmental shift.
 * ========================================================== */
import type { LiveWeather } from "@/lib/weather.functions";


function QuestionField({
  progress,
  onSelect,
  selected,
  live,
}: {
  progress: number;
  onSelect: (i: number) => void;
  selected: number | null;
  live?: LiveWeather;
}) {
  const enter = clamp01((progress - 0.22) / 0.05);
  const exit = clamp01(1 - (progress - 0.74) / 0.06);
  const opacity = enter * exit;

  // Positions around the core
  const positions = useMemo(
    () => [
      { top: "26%", left: "8%" },
      { top: "62%", left: "10%" },
      { top: "30%", right: "8%" },
      { top: "68%", right: "10%" },
      { top: "82%", left: "44%" },
    ],
    [],
  );

  if (opacity <= 0.001) return null;

  const questionsList = live?.ai?.dynamicQuestions || [];

  return (
    <div className="pointer-events-none fixed inset-0 z-[58] hidden lg:block">
      {questionsList.map((q, i) => {
        const t = clamp01((progress - (0.24 + i * 0.012)) / 0.04);
        const isSel = selected === i;
        const isOther = selected !== null && selected !== i;
        const o = t * opacity * (isOther ? 0.18 : 1);
        return (
          <div
            key={i}
            className="absolute max-w-[280px]"
            style={{
              ...(positions[i] as React.CSSProperties),
              opacity: o,
              transform: `translateY(${(1 - t) * 12}px)`,
              transition: "opacity 480ms ease-out, transform 480ms ease-out",
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(i)}
              className="pointer-events-auto group flex items-start gap-3 text-left"
            >
              <span
                className="mt-2 inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: isSel ? "rgb(220,235,255)" : "rgba(180,210,255,0.7)",
                  boxShadow: isSel
                    ? "0 0 18px rgba(200,220,255,0.9)"
                    : "0 0 8px rgba(180,210,255,0.4)",
                }}
              />
              <span
                className="font-editorial italic text-[17px] leading-snug text-foreground/80 transition-colors duration-300 group-hover:text-foreground"
                style={{
                  textShadow: isSel ? "0 0 30px rgba(200,220,255,0.5)" : undefined,
                }}
              >
                {q.title}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * Environmental response — the atmosphere becomes the answer.
 * ========================================================== */
function ResponseLayer({
  selected,
  progress,
  live,
}: {
  selected: number | null;
  progress: number;
  live?: LiveWeather;
}) {
  if (selected === null || !live?.ai?.dynamicQuestions) return null;
  const r = live.ai.dynamicQuestions[selected];
  const exit = clamp01(1 - (progress - 0.74) / 0.06);
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[15%] z-[60] flex flex-col items-center px-8 text-center"
      style={{ opacity: exit }}
    >
      <div
        className="font-mono-ui mb-3 text-[10px] tracking-[0.35em] text-foreground/55 animate-fade-in"
        style={{ letterSpacing: "0.35em" }}
      >
        ATMOSPHERIC RESPONSE
      </div>
      <div
        className="font-editorial italic text-foreground text-2xl sm:text-3xl animate-fade-in"
        style={{ textShadow: "0 0 36px rgba(200,220,255,0.55)" }}
      >
        {r.title}
      </div>
      <div className="mt-5 max-w-[42ch] space-y-1.5">
        {r.lines.map((line, i) => (
          <div
            key={i}
            className="font-editorial text-[15px] leading-relaxed text-foreground/70 animate-fade-in"
            style={{ animationDelay: `${120 + i * 140}ms`, animationFillMode: "both" }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * Convergence caption — the realization.
 * ========================================================== */
function Convergence({ progress }: { progress: number }) {
  const t =
    clamp01((progress - 0.56) / 0.04) *
    clamp01(1 - (progress - 0.74) / 0.05);
  if (t <= 0.001) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[20%] z-[60] flex justify-center px-8"
      style={{ opacity: t }}
    >
      <p
        className="max-w-[40ch] text-center font-editorial italic text-foreground/90 text-2xl sm:text-3xl"
        style={{ textShadow: "0 0 40px rgba(200,220,255,0.4)" }}
      >
        One system. One planet. One continuous story.
      </p>
    </div>
  );
}

/* ============================================================
 * Final statement + CTA.
 * ========================================================== */
function FinalStatement({ progress }: { progress: number }) {
  const t = clamp01((progress - 0.82) / 0.08);
  if (t <= 0) return null;
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[62] flex flex-col items-center justify-center px-8"
      style={{ opacity: t }}
    >
      <div className="font-mono-ui mb-6 text-[10px] tracking-[0.4em] text-foreground/55">
        WEATHERWATCH AI
      </div>
      <div className="text-center font-editorial">
        <div
          className="text-[9vw] text-foreground/90 sm:text-[5vw] lg:text-[4vw]"
          style={{ textShadow: "0 0 50px rgba(200,220,255,0.4)" }}
        >
          We don't predict weather.
        </div>
        <div
          className="mt-2 text-[11vw] italic text-foreground sm:text-[6.4vw] lg:text-[5.2vw]"
          style={{ textShadow: "0 0 70px rgba(220,235,255,0.6)" }}
        >
          We understand it.
        </div>
      </div>

      <div className="pointer-events-auto mt-16 flex flex-col items-center gap-6 sm:flex-row sm:gap-12">
        <FinalLink label="Explore your city" />
        <div className="font-mono-ui text-[10px] text-foreground/30">·</div>
        <FinalLink label="Enter live intelligence" />
      </div>
    </div>
  );
}

function FinalLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="group inline-flex items-center gap-5"
    >
      <span className="font-mono-ui text-[11px] tracking-[0.2em] uppercase text-foreground/80 transition-colors duration-500 group-hover:text-foreground">
        {label}
      </span>
      <span className="relative block h-px w-20 bg-[color:var(--hairline)]">
        <span className="absolute inset-y-0 left-0 w-0 bg-foreground transition-all duration-700 group-hover:w-full" />
      </span>
      <span className="font-mono-ui text-[11px] text-foreground/55 transition-transform duration-500 group-hover:translate-x-2">
        →
      </span>
    </button>
  );
}

/* ============================================================
 * Scene 07 root.
 * ========================================================== */
export function Scene07({
  progress,
  scene07Scroll,
  pointer,
  live,
}: {
  progress: number;
  scene07Scroll: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  live?: LiveWeather;
}) {
  const visIn = clamp01(progress / 0.04);
  const visOut = clamp01(1 - (progress - 0.98) / 0.02);
  const visibility = visIn * visOut;
  const visibilityRef = useRef(0);
  visibilityRef.current = visibility;

  const [selected, setSelected] = useState<number | null>(null);
  // Auto-pick a question mid-scene if the user hasn't engaged, so the
  // environmental response always lands.
  useEffect(() => {
    const questionsLength = live?.ai?.dynamicQuestions?.length || 5;
    if (selected === null && progress > 0.5) {
      setSelected(Math.floor(Math.random() * questionsLength));
    }
    if (progress < 0.1 && selected !== null) {
      setSelected(null);
    }
  }, [progress, selected, live]);

  const responseRef = useRef(0);
  responseRef.current = selected !== null ? clamp01((progress - 0.32) / 0.06) : 0;

  if (visibility <= 0.001) return null;

  return (
    <>
      {/* Deep void wash — the brain emerges from infinite space */}
      <div
        className="pointer-events-none fixed inset-0 z-[52]"
        style={{
          opacity: visibility,
          background:
            "radial-gradient(ellipse at 50% 52%, rgba(8,14,30,0.65) 0%, rgba(2,4,10,0.95) 55%, rgba(0,1,4,1) 100%)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[53]"
        style={{
          opacity: visibility * 0.6,
          background:
            "radial-gradient(ellipse at 50% 52%, rgba(110,160,230,0.14) 0%, rgba(60,90,180,0.06) 45%, transparent 80%)",
          mixBlendMode: "screen",
        }}
      />

      <IntelligenceCore
        progressRef={scene07Scroll}
        pointer={pointer}
        visibilityRef={visibilityRef}
        responseRef={responseRef}
      />


      <QuestionField
        progress={progress}
        onSelect={setSelected}
        selected={selected}
        live={live}
      />
      <ResponseLayer selected={selected} progress={progress} live={live} />
      <Convergence progress={progress} />

    </>
  );
}
