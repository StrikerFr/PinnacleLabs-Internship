import { useEffect, useRef } from "react";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ============================================================
 * Prediction field — Canvas2D.
 * Particles flow left→right along time. As the scene progresses,
 * trails extend forward, branch into multiple futures, the
 * simulation diverges, then converges onto the strongest path.
 * Finally everything contracts toward a singular intelligence
 * core (handoff to the final scene).
 * ========================================================== */
function PredictionField({
  progressRef,
  pointer,
  visibilityRef,
}: {
  progressRef: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  visibilityRef: React.MutableRefObject<number>;
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

    // ---- Origin seeds (current events on the left edge of the field)
    type Seed = { x: number; y: number; phase: number };
    const seeds: Seed[] = [];
    const SEED_COUNT = 7;
    for (let i = 0; i < SEED_COUNT; i++) {
      seeds.push({
        x: 0.06 * W,
        y: (0.18 + (i / (SEED_COUNT - 1)) * 0.64) * H,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // ---- Particles flowing forward in time
    type P = {
      x: number;
      y: number;
      vy: number;
      life: number;     // 0..1
      seed: number;     // index into seeds
      branch: number;   // -1..1 directional bias
      alpha: number;
      size: number;
      hue: number;      // 0..3
    };
    const NUM = 1300;
    const ps: P[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const spawn = (i: number) => {
      const s = Math.floor(Math.random() * seeds.length);
      ps[i] = {
        x: seeds[s].x + rand(-4, 4),
        y: seeds[s].y + rand(-6, 6),
        vy: 0,
        life: 0,
        seed: s,
        branch: rand(-1, 1),
        alpha: rand(0.35, 0.95),
        size: rand(0.5, 1.6),
        hue: Math.floor(Math.random() * 4),
      };
    };
    for (let i = 0; i < NUM; i++) spawn(i);

    // Probability palette (cool, intelligence-tinted)
    const HUES: [number, number, number][] = [
      [180, 215, 255], // primary
      [170, 240, 220], // alt
      [225, 215, 255], // soft violet
      [255, 210, 170], // sparse warm — rare events
    ];

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;

      const p = progressRef.current;
      const vis = visibilityRef.current;

      // Phase curves:
      //  diverge  — branches fan out (peak ~0.45)
      //  converge — simulation collapses onto dominant path (~0.75)
      //  singular — everything contracts to one intelligence core (~0.95)
      const reach     = clamp01((p - 0.06) / 0.18);                  // how far futures extend
      const diverge   = clamp01((p - 0.20) / 0.20) * (1 - clamp01((p - 0.62) / 0.10));
      const converge  = clamp01((p - 0.62) / 0.14);
      const singular  = clamp01((p - 0.86) / 0.10);

      // Singularity target — center of screen
      const sx = W * 0.5;
      const sy = H * 0.55;

      // Motion-blur trail
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(4,6,12,${0.16 + reach * 0.04 + singular * 0.04})`;
      ctx.fillRect(0, 0, W, H);

      // ---- Probability fan guide curves (visible once branching begins)
      if (diverge > 0.05 || converge > 0.05) {
        ctx.globalCompositeOperation = "lighter";
        ctx.lineWidth = 0.5;
        for (let s = 0; s < seeds.length; s++) {
          const seed = seeds[s];
          // 3 future pathways per seed: intensifies, weakens, shifts
          for (let b = -1; b <= 1; b++) {
            const fan = b * (0.22 - converge * 0.20); // collapse fan as it converges
            const endX = lerp(seed.x, W * 0.92, reach);
            const endY = lerp(seed.y, seed.y + fan * H * 0.55, reach);
            // Pull toward singular core at the very end
            const finalX = lerp(endX, sx, singular);
            const finalY = lerp(endY, sy, singular);
            const ctrlX = lerp(seed.x + 80, (seed.x + finalX) * 0.5, 0.6);
            const ctrlY = (seed.y + finalY) * 0.5 + Math.sin(now * 0.0006 + s + b) * 6;

            const a = (0.04 + diverge * 0.18 + converge * 0.12) * vis;
            ctx.strokeStyle = `rgba(180,210,250,${a.toFixed(3)})`;
            ctx.setLineDash([2, 7]);
            ctx.beginPath();
            ctx.moveTo(seed.x, seed.y);
            ctx.quadraticCurveTo(ctrlX, ctrlY, finalX, finalY);
            ctx.stroke();
          }
        }
        ctx.setLineDash([]);
      }

      // ---- Particles (temporal flow)
      ctx.globalCompositeOperation = "lighter";
      const cx = (pointer.current.x * 0.5 + 0.5) * W;
      const cy = (-pointer.current.y * 0.5 + 0.5) * H;

      for (let i = 0; i < ps.length; i++) {
        const pt = ps[i];
        const seed = seeds[pt.seed];

        // March forward in time
        const baseSpeed = 0.8 + reach * 1.6;
        pt.life += 0.004 * dt * (1 + reach * 0.8);
        pt.x += baseSpeed * dt;

        // Branching: lateral drift, scaled by diverge, reduced by converge
        const fan = pt.branch * (0.35 - converge * 0.30);
        const targetY = seed.y + fan * H * 0.55 * pt.life;
        pt.y = lerp(pt.y, targetY, 0.04 * (0.4 + diverge));

        // Subtle turbulence
        pt.y += Math.sin(now * 0.001 + pt.x * 0.01 + pt.seed) * 0.25;

        // Cursor gravity (gentle)
        const dx = pt.x - cx;
        const dy = pt.y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000) {
          const f = (1 - d2 / 12000) * 0.35;
          const inv = 1 / Math.max(6, Math.sqrt(d2));
          pt.x += dx * inv * f * 1.5;
          pt.y += dy * inv * f * 1.5;
        }

        // Singularity: pull everything toward intelligence core
        if (singular > 0.02) {
          pt.x = lerp(pt.x, sx, 0.04 * singular);
          pt.y = lerp(pt.y, sy, 0.04 * singular);
        }

        // Lifecycle: recycle when off-screen or fully aged
        if (
          pt.life > 1 ||
          pt.x > W + 30 ||
          pt.y < -20 ||
          pt.y > H + 20
        ) {
          spawn(i);
          continue;
        }

        // Render — head is bright, fade with life
        const c = HUES[pt.hue];
        const a = pt.alpha * vis * (1 - pt.life * 0.55);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();

        // Faint trail dot one step behind
        if (pt.life > 0.05) {
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(a * 0.4).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(pt.x - baseSpeed * 4, pt.y, pt.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---- Seed origin pulses
      for (let s = 0; s < seeds.length; s++) {
        const seed = seeds[s];
        const ax = lerp(seed.x, sx, singular);
        const ay = lerp(seed.y, sy, singular);
        const pulse = 0.55 + 0.45 * Math.sin(now * 0.0022 + seed.phase);
        const a = vis * (0.5 + reach * 0.4) * pulse;
        const grd = ctx.createRadialGradient(ax, ay, 0, ax, ay, 18);
        grd.addColorStop(0, `rgba(200,220,255,${(a * 0.55).toFixed(3)})`);
        grd.addColorStop(1, `rgba(200,220,255,0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(ax, ay, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(220,235,255,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(ax, ay, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- Intelligence core (final beat)
      if (singular > 0.02) {
        const coreA = singular * vis;
        const radius = 60 + Math.sin(now * 0.0025) * 6;
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 2.2);
        grd.addColorStop(0, `rgba(230,240,255,${(coreA * 0.55).toFixed(3)})`);
        grd.addColorStop(0.35, `rgba(180,210,255,${(coreA * 0.25).toFixed(3)})`);
        grd.addColorStop(1, `rgba(60,90,160,0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 2.2, 0, Math.PI * 2);
        ctx.fill();
        // Concentric rings
        for (let r = 0; r < 3; r++) {
          ctx.strokeStyle = `rgba(200,220,255,${(coreA * (0.18 - r * 0.05)).toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.arc(sx, sy, radius + r * 22 + Math.sin(now * 0.001 + r) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [pointer, progressRef, visibilityRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[44]"
      aria-hidden
    />
  );
}

/* ============================================================
 * Headline — "THE ATMOSPHERE / IS ALWAYS WRITING / THE FUTURE."
 * ========================================================== */
function Headline({ progress }: { progress: number }) {
  const l1 = clamp01((progress - 0.04) / 0.05);
  const l2 = clamp01((progress - 0.14) / 0.05);
  const l3 = clamp01((progress - 0.26) / 0.06);
  const out = clamp01(1 - (progress - 0.78) / 0.08);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[12%] z-[50] flex flex-col items-center px-8 sm:px-12"
      style={{ opacity: out }}
    >
      <div className="font-mono-ui mb-5 text-[10px] tracking-[0.3em] text-foreground/45">
        CHAPTER 06 · PREDICTIVE INTELLIGENCE
      </div>
      <div className="text-center font-editorial">
        <Reveal t={l1} className="text-[8vw] text-foreground/95 sm:text-[4.4vw] lg:text-[3.4vw]">
          The atmosphere
        </Reveal>
        <Reveal t={l2} className="text-[8vw] text-foreground/85 sm:text-[4.4vw] lg:text-[3.4vw]">
          is always writing
        </Reveal>
        <Reveal
          t={l3}
          className="mt-2 text-[11vw] italic text-foreground sm:text-[6.4vw] lg:text-[5.2vw]"
          glow
        >
          the future.
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
          transition: "transform 600ms cubic-bezier(.22,1,.36,1)",
          textShadow: glow ? "0 0 50px rgba(180,210,255,0.4)" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================
 * Probability branches — three futures with weighted bars.
 * Center-right, mid-scene. Pure typography + hairlines, no cards.
 *   Storm Intensifies        70%
 *   Storm Weakens            20%
 *   Storm Changes Direction  10%
 * ========================================================== */
const BRANCHES = [
  { label: "Storm Intensifies",       prob: 70, tint: "180,215,255", from: 0.30 },
  { label: "Storm Weakens",           prob: 20, tint: "170,240,220", from: 0.34 },
  { label: "Storm Changes Direction", prob: 10, tint: "225,215,255", from: 0.38 },
];

function ProbabilityBranches({ progress }: { progress: number }) {
  const enter = clamp01((progress - 0.28) / 0.04);
  const exit = clamp01(1 - (progress - 0.78) / 0.06);
  // Probability bars subtly redistribute toward dominant path as we converge
  const converge = clamp01((progress - 0.62) / 0.14);
  return (
    <div
      className="pointer-events-none fixed inset-y-0 right-10 z-[48] hidden lg:flex items-center"
      style={{ opacity: enter * exit }}
    >
      <div className="w-[300px]">
        <div className="font-mono-ui mb-4 flex items-center gap-2 text-[9px] tracking-[0.3em] text-foreground/45">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--ember)]" />
          FORECAST · ATL-04 · 06H
        </div>
        <div className="space-y-4">
          {BRANCHES.map((b, i) => {
            const t = clamp01((progress - b.from) / 0.04);
            // Dominant grows, others shrink
            const target =
              i === 0
                ? b.prob + converge * 18
                : Math.max(2, b.prob - converge * (i === 1 ? 12 : 6));
            const pct = Math.round(target);
            return (
              <div key={i} style={{ opacity: t }}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{
                        background: `rgb(${b.tint})`,
                        boxShadow: `0 0 10px rgba(${b.tint},0.75)`,
                      }}
                    />
                    <span className="font-editorial italic text-foreground/85 text-[15px] leading-none">
                      {b.label}
                    </span>
                  </div>
                  <span
                    className="font-mono-ui text-[11px] tabular-nums text-foreground/85"
                    style={{ color: `rgb(${b.tint})` }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  className="relative mt-2 h-px w-full"
                  style={{ background: "rgba(180,200,235,0.14)" }}
                >
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, rgba(${b.tint},0.85), rgba(${b.tint},0.15))`,
                      transition: "width 800ms cubic-bezier(.22,1,.36,1)",
                    }}
                  />
                </div>
                <div className="font-mono-ui mt-1.5 text-[9px] tracking-[0.22em] text-foreground/35">
                  CONFIDENCE {Math.round(60 + t * 30 + (i === 0 ? converge * 8 : -converge * 4))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Atmospheric forecast observations — left column.
 * Voice of the atmosphere itself. Editorial italic.
 * ========================================================== */
const OBSERVATIONS = [
  { text: "Heavy rainfall likely within 6 hours.",          from: 0.32 },
  { text: "Flood risk increasing along coastal districts.", from: 0.38 },
  { text: "Visibility reduction expected after sunset.",    from: 0.44 },
  { text: "Air quality expected to improve overnight.",     from: 0.50 },
  { text: "Traffic disruption possible tomorrow morning.",  from: 0.56 },
  { text: "Pressure systems converging on a single path.",  from: 0.66 },
];

function Observations({ progress }: { progress: number }) {
  const out = clamp01(1 - (progress - 0.82) / 0.06);
  return (
    <div
      className="pointer-events-none fixed inset-y-0 left-10 z-[48] hidden lg:flex items-center"
      style={{ opacity: out }}
    >
      <div className="w-[320px]">
        <div className="font-mono-ui mb-4 flex items-center gap-2 text-[9px] tracking-[0.3em] text-foreground/45">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--atmosphere)]" />
          ATMOSPHERIC OBSERVATIONS
        </div>
        <div className="space-y-3.5">
          {OBSERVATIONS.map((o, i) => {
            const t = clamp01((progress - o.from) / 0.03);
            const fade = clamp01(1 - (progress - (o.from + 0.20)) / 0.05);
            const opacity = t * fade;
            if (opacity <= 0.001) return null;
            return (
              <div
                key={i}
                style={{
                  opacity,
                  transform: `translateX(${(1 - t) * -8}px)`,
                  transition: "transform 320ms ease-out",
                }}
              >
                <div className="font-editorial italic text-foreground/85 text-[15px] leading-snug">
                  {o.text}
                </div>
                <div className="font-mono-ui mt-1 text-[9px] tracking-[0.22em] text-foreground/35">
                  T+{String(i * 47 + 12).padStart(3, "0")}min · CONF {72 + (i % 4) * 5}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Convergence caption — the realization moment.
 * ========================================================== */
function ConvergenceMoment({ progress }: { progress: number }) {
  const t =
    clamp01((progress - 0.64) / 0.04) *
    clamp01(1 - (progress - 0.82) / 0.05);
  if (t <= 0.001) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[40%] z-[50] flex justify-center px-8"
      style={{ opacity: t }}
    >
      <p
        className="max-w-[38ch] text-center font-editorial italic text-foreground/90 text-2xl sm:text-3xl"
        style={{ textShadow: "0 0 40px rgba(180,210,255,0.35)" }}
      >
        The future is uncertain — but the patterns are not.
      </p>
    </div>
  );
}

/* ============================================================
 * Intelligence emergence — final beat. The presence appears.
 * ========================================================== */
function IntelligenceEmergence({ progress }: { progress: number }) {
  const t = clamp01((progress - 0.86) / 0.10);
  if (t <= 0) return null;
  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-[58%] z-[51] flex flex-col items-center px-8"
        style={{ opacity: t }}
      >
        <div
          className="font-mono-ui mb-3 text-[10px] tracking-[0.4em] text-foreground/55"
          style={{ letterSpacing: "0.4em" }}
        >
          PRESENCE DETECTED
        </div>
        <div
          className="font-editorial italic text-foreground text-2xl sm:text-3xl"
          style={{ textShadow: "0 0 40px rgba(200,220,255,0.55)" }}
        >
          Something is listening.
        </div>
      </div>
      <div
        className="pointer-events-none fixed inset-x-0 bottom-10 z-[51] flex justify-center"
        style={{ opacity: t }}
      >
        <div className="font-mono-ui text-[10px] tracking-[0.3em] text-foreground/55">
          NEXT · WEATHERWATCH AI
        </div>
      </div>
    </>
  );
}

/* ============================================================
 * Scene 06 root.
 * ========================================================== */
export function Scene06({
  progress,
  scene06Scroll,
  pointer,
}: {
  progress: number;
  scene06Scroll: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const visIn = clamp01(progress / 0.04);
  const visOut = clamp01(1 - (progress - 0.97) / 0.03);
  const visibility = visIn * visOut;
  const visibilityRef = useRef(0);
  visibilityRef.current = visibility;

  if (visibility <= 0.001) return null;

  return (
    <>
      {/* Deep observatory wash */}
      <div
        className="pointer-events-none fixed inset-0 z-[42]"
        style={{
          opacity: visibility,
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(6,10,22,0.55) 0%, rgba(3,5,12,0.92) 60%, rgba(1,2,6,0.98) 100%)",
        }}
      />
      {/* Cool predictive tint */}
      <div
        className="pointer-events-none fixed inset-0 z-[43]"
        style={{
          opacity: visibility * 0.55,
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(90,130,200,0.10) 0%, rgba(40,60,120,0.06) 50%, transparent 80%)",
          mixBlendMode: "screen",
        }}
      />

      <PredictionField
        progressRef={scene06Scroll}
        pointer={pointer}
        visibilityRef={visibilityRef}
      />

      <ProbabilityBranches progress={progress} />
      <IntelligenceEmergence progress={progress} />
    </>
  );
}