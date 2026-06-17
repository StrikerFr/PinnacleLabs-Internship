import { useEffect, useRef, useState } from "react";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ============================================================
 * Living Earth — the planet reappears, alive and aware.
 * Canvas2D globe with atmosphere, drifting weather systems,
 * traveling information arcs, soft cloud shadows.
 * ========================================================== */
function LivingEarth({
  progressRef,
  pointer,
  visibilityRef,
  hoverRef,
}: {
  progressRef: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  visibilityRef: React.MutableRefObject<number>;
  hoverRef: React.MutableRefObject<number>;
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

    // ---- Background stars (only meaningfully visible at the very end)
    type Star = { x: number; y: number; r: number; tw: number };
    const stars: Star[] = [];
    for (let i = 0; i < 260; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.1 + 0.3,
        tw: Math.random() * Math.PI * 2,
      });
    }

    // ---- Weather systems orbiting the globe
    type Sys = {
      lon: number;
      lat: number;
      speed: number;
      size: number;
      kind: "storm" | "front" | "high";
      phase: number;
    };
    const systems: Sys[] = [];
    for (let i = 0; i < 14; i++) {
      systems.push({
        lon: Math.random() * Math.PI * 2,
        lat: (Math.random() - 0.5) * 1.4,
        speed: (Math.random() * 0.0004 + 0.00012) * (Math.random() < 0.5 ? 1 : -1),
        size: Math.random() * 14 + 6,
        kind: Math.random() < 0.4 ? "storm" : Math.random() < 0.7 ? "front" : "high",
        phase: Math.random() * Math.PI * 2,
      });
    }

    // ---- Information arcs traveling between points on the surface
    type Arc = {
      lon0: number;
      lat0: number;
      lon1: number;
      lat1: number;
      t: number;
      speed: number;
      hue: number;
    };
    const arcs: Arc[] = [];
    const spawnArc = () => {
      arcs.push({
        lon0: Math.random() * Math.PI * 2,
        lat0: (Math.random() - 0.5) * 1.2,
        lon1: Math.random() * Math.PI * 2,
        lat1: (Math.random() - 0.5) * 1.2,
        t: 0,
        speed: 0.005 + Math.random() * 0.008,
        hue: Math.floor(Math.random() * 3),
      });
    };
    for (let i = 0; i < 8; i++) spawnArc();

    const HUES: [number, number, number][] = [
      [180, 215, 255],
      [170, 240, 220],
      [225, 215, 255],
    ];

    let raf = 0;
    let last = performance.now();
    let globalRot = 0;

    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;

      const p = progressRef.current;
      const vis = visibilityRef.current;
      const hover = hoverRef.current;

      // Phase curves
      const arrive = clamp01((p - 0.0) / 0.18); // earth pulls back into view
      const retreat = clamp01((p - 0.78) / 0.22); // ending: pull into space
      const ending = clamp01((p - 0.8) / 0.12);

      // Earth radius shrinks slightly at the end (camera pulls back into space)
      const baseR = Math.min(W, H) * 0.28;
      const radius = baseR * lerp(1.0, 0.55, retreat) * lerp(0.6, 1.0, arrive);
      const cx = W * 0.5 + pointer.current.x * 14;
      const cy = H * 0.52 - pointer.current.y * 10 - retreat * H * 0.04;

      globalRot += 0.0006 * dt * (1 + hover * 0.6);

      // Background wash
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(2,4,10,${0.22 + ending * 0.08})`;
      ctx.fillRect(0, 0, W, H);

      // Stars (fade in at the end)
      const starAlpha = vis * (0.15 + ending * 0.75);
      if (starAlpha > 0.02) {
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          s.x += 0.00003 * dt * (1 + hover * 1.5); // drift faster on hover
          if (s.x > 1) s.x = 0;
          
          const tw = 0.6 + 0.4 * Math.sin(now * 0.0015 + s.tw);
          ctx.fillStyle = `rgba(220,230,255,${(starAlpha * tw * 0.8).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---- Atmospheric halo (multi-layer)
      ctx.globalCompositeOperation = "lighter";
      for (let layer = 0; layer < 4; layer++) {
        const rr = radius * (1.04 + layer * 0.12);
        const a = (0.22 - layer * 0.05) * vis * (1 + hover * 0.5) * (1 - ending);
        const grd = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, rr);
        grd.addColorStop(0, `rgba(140,190,255,${(a * 0.6).toFixed(3)})`);
        grd.addColorStop(0.6, `rgba(110,170,240,${(a * 0.3).toFixed(3)})`);
        grd.addColorStop(1, `rgba(60,100,200,0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- Planet body (deep ocean base + soft terminator)
      ctx.globalCompositeOperation = "source-over";
      const body = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius,
      );
      body.addColorStop(0, `rgba(60,110,170,${(0.95 * vis * (1 - ending)).toFixed(3)})`);
      body.addColorStop(0.55, `rgba(20,50,110,${(0.92 * vis * (1 - ending)).toFixed(3)})`);
      body.addColorStop(1, `rgba(4,10,30,${(0.95 * vis * (1 - ending)).toFixed(3)})`);
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Subtle land masses (procedural blotches) — clipped to globe
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.globalCompositeOperation = "source-over";
      const landRot = globalRot * 0.4;
      const blots = 22;
      for (let i = 0; i < blots; i++) {
        const lon = (i / blots) * Math.PI * 2 + landRot + Math.sin(i) * 0.4;
        const lat = Math.sin(i * 1.7) * 0.9;
        const x = Math.cos(lon) * Math.cos(lat);
        const z = Math.sin(lon) * Math.cos(lat);
        if (z < 0) continue;
        const px = cx + x * radius * 0.94;
        const py = cy + Math.sin(lat) * radius * 0.94;
        const sz = radius * (0.08 + (i % 5) * 0.025);
        const a = 0.18 * vis * (0.5 + z * 0.5) * (1 - ending);
        const grd = ctx.createRadialGradient(px, py, 0, px, py, sz);
        grd.addColorStop(0, `rgba(110,140,140,${a.toFixed(3)})`);
        grd.addColorStop(1, `rgba(110,140,140,0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cloud band drifting around the planet
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 60; i++) {
        const lon = (i / 60) * Math.PI * 2 + globalRot * 1.4;
        const lat = Math.sin(i * 0.7 + now * 0.0003) * 0.9;
        const x = Math.cos(lon) * Math.cos(lat);
        const z = Math.sin(lon) * Math.cos(lat);
        if (z < 0) continue;
        const px = cx + x * radius * 0.96;
        const py = cy + Math.sin(lat) * radius * 0.96;
        const sz = radius * (0.05 + (i % 4) * 0.015);
        const a = 0.16 * vis * z * (1 - ending);
        ctx.fillStyle = `rgba(230,240,255,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      // Weather systems
      for (let i = 0; i < systems.length; i++) {
        const s = systems[i];
        s.lon += s.speed * dt * (1 + hover * 0.8);
        const lon = s.lon + globalRot;
        const x = Math.cos(lon) * Math.cos(s.lat);
        const z = Math.sin(lon) * Math.cos(s.lat);
        if (z < -0.05) continue;
        const px = cx + x * radius * 0.96;
        const py = cy + Math.sin(s.lat) * radius * 0.96;
        const pulse = 0.6 + 0.4 * Math.sin(now * 0.002 + s.phase);
        if (s.kind === "storm") {
          const sz = s.size * pulse;
          const grd = ctx.createRadialGradient(px, py, 0, px, py, sz);
          grd.addColorStop(0, `rgba(255,210,170,${(0.55 * vis * z * (1 - ending)).toFixed(3)})`);
          grd.addColorStop(1, `rgba(255,160,110,0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(px, py, sz, 0, Math.PI * 2);
          ctx.fill();
          // tiny core
          ctx.fillStyle = `rgba(255,235,210,${(0.7 * vis * z * (1 - ending)).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (s.kind === "front") {
          ctx.strokeStyle = `rgba(180,220,255,${(0.35 * vis * z * (1 - ending)).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(px - s.size, py);
          ctx.bezierCurveTo(
            px - s.size * 0.3, py - s.size * 0.5,
            px + s.size * 0.3, py + s.size * 0.5,
            px + s.size, py,
          );
          ctx.stroke();
        } else {
          ctx.strokeStyle = `rgba(170,240,220,${(0.3 * vis * z * (1 - ending)).toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.arc(px, py, s.size * pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();

      // ---- Information arcs (above the surface)
      ctx.globalCompositeOperation = "lighter";
      for (let i = arcs.length - 1; i >= 0; i--) {
        const a = arcs[i];
        a.t += a.speed * dt * (1 + hover * 1.2);
        if (a.t >= 1) {
          arcs.splice(i, 1);
          continue;
        }
        const lon0 = a.lon0 + globalRot;
        const lon1 = a.lon1 + globalRot;
        const x0 = Math.cos(lon0) * Math.cos(a.lat0);
        const z0 = Math.sin(lon0) * Math.cos(a.lat0);
        const x1 = Math.cos(lon1) * Math.cos(a.lat1);
        const z1 = Math.sin(lon1) * Math.cos(a.lat1);
        if (z0 < -0.1 && z1 < -0.1) continue;
        const p0x = cx + x0 * radius;
        const p0y = cy + Math.sin(a.lat0) * radius;
        const p1x = cx + x1 * radius;
        const p1y = cy + Math.sin(a.lat1) * radius;
        const mx = (p0x + p1x) / 2;
        const my = (p0y + p1y) / 2 - radius * 0.35;
        const hue = HUES[a.hue];
        const segs = 24;
        ctx.strokeStyle = `rgba(${hue[0]},${hue[1]},${hue[2]},${(0.25 * vis * (1 - ending)).toFixed(3)})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let s = 0; s <= segs * a.t; s++) {
          const t = s / segs;
          const xx = (1 - t) * (1 - t) * p0x + 2 * (1 - t) * t * mx + t * t * p1x;
          const yy = (1 - t) * (1 - t) * p0y + 2 * (1 - t) * t * my + t * t * p1y;
          if (s === 0) ctx.moveTo(xx, yy);
          else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
        // Head
        const ht = a.t;
        const hx = (1 - ht) * (1 - ht) * p0x + 2 * (1 - ht) * ht * mx + ht * ht * p1x;
        const hy = (1 - ht) * (1 - ht) * p0y + 2 * (1 - ht) * ht * my + ht * ht * p1y;
        ctx.fillStyle = `rgba(${hue[0]},${hue[1]},${hue[2]},${(0.85 * vis * (1 - ending)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(hx, hy, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      while (arcs.length < 10) spawnArc();

      // Hover ripple — atmospheric wave
      if (hover > 0.02) {
        const rcx = ending >= 0.9 ? W * 0.5 : cx;
        const rcy = ending >= 0.9 ? H * 0.82 : cy;
        const baseRadius = ending >= 0.9 ? 24 : radius;
        for (let r = 0; r < 3; r++) {
          const phase = ((now * 0.0006 + r * 0.33) % 1);
          const rr = ending >= 0.9 
            ? baseRadius + phase * 64
            : baseRadius * (1.05 + phase * 0.6);
          const a = hover * (1 - phase) * 0.35 * vis;
          ctx.strokeStyle = `rgba(200,225,255,${a.toFixed(3)})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.arc(rcx, rcy, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Final terminator gloss
      ctx.globalCompositeOperation = "source-over";
      const term = ctx.createRadialGradient(
        cx + radius * 0.5, cy + radius * 0.4, radius * 0.1,
        cx, cy, radius,
      );
      term.addColorStop(0, "rgba(0,0,0,0)");
      term.addColorStop(1, `rgba(0,0,5,${(0.45 * vis * (1 - ending)).toFixed(3)})`);
      ctx.fillStyle = term;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [pointer, progressRef, visibilityRef, hoverRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[64]"
      aria-hidden
    />
  );
}

/* ============================================================
 * Headline — THE PLANET / NEVER STOPS CHANGING. / NEITHER DO WE.
 * The third line lands much later.
 * ========================================================== */
function Headline({ progress }: { progress: number }) {
  const l1 = clamp01((progress - 0.06) / 0.05);
  const l2 = clamp01((progress - 0.16) / 0.05);
  const l3 = clamp01((progress - 0.42) / 0.06);
  const out = clamp01(1 - (progress - 0.74) / 0.06);
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[10%] z-[70] flex flex-col items-center px-8 sm:px-12"
      style={{ opacity: out }}
    >
      <div className="font-mono-ui mb-5 text-[10px] tracking-[0.3em] text-foreground/45">
        CHAPTER 08 · LIVING SYSTEM
      </div>
      <div className="text-center font-editorial">
        <Reveal t={l1} className="text-[8vw] text-foreground/90 sm:text-[4.2vw] lg:text-[3.2vw]">
          The planet
        </Reveal>
        <Reveal
          t={l2}
          className="mt-1 text-[10vw] italic text-foreground sm:text-[5.4vw] lg:text-[4.2vw]"
          glow
        >
          never stops changing.
        </Reveal>
        <Reveal
          t={l3}
          className="mt-6 text-[8vw] text-foreground/85 sm:text-[4.2vw] lg:text-[3.2vw]"
          glow
        >
          Neither do we.
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
          transition: "transform 800ms cubic-bezier(.22,1,.36,1)",
          textShadow: glow ? "0 0 60px rgba(200,220,255,0.5)" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================
 * Planetary status — live heartbeat indicators around the globe.
 * ========================================================== */
function PlanetaryStatus({ progress }: { progress: number }) {
  const enter = clamp01((progress - 0.24) / 0.06);
  const exit = clamp01(1 - (progress - 0.74) / 0.06);
  const opacity = enter * exit;
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1100);
    return () => clearInterval(id);
  }, []);

  const items = [
    {
      pos: { top: "26%", left: "6%" },
      label: "ACTIVE WEATHER SYSTEMS",
      value: 18 + (tick % 3),
    },
    {
      pos: { top: "62%", left: "8%" },
      label: "ENVIRONMENTAL SIGNALS",
      value: 42 + (tick % 5),
    },
    {
      pos: { top: "28%", right: "7%" },
      label: "ATMOSPHERIC DATA POINTS",
      value: (1.2 + (tick % 7) * 0.001).toFixed(3) + "M",
    },
    {
      pos: { top: "60%", right: "9%" },
      label: "POSSIBLE OUTCOMES",
      value: 127 + (tick % 11),
    },
  ];

  if (opacity <= 0.001) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[68] hidden lg:block" style={{ opacity }}>
      {items.map((it, i) => {
        const t = clamp01((progress - (0.26 + i * 0.012)) / 0.04);
        return (
          <div
            key={i}
            className="absolute"
            style={{
              ...(it.pos as React.CSSProperties),
              opacity: t,
              transform: `translateY(${(1 - t) * 10}px)`,
              transition: "opacity 500ms ease-out, transform 500ms ease-out",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: "rgba(180,215,255,0.85)",
                  boxShadow: "0 0 12px rgba(180,215,255,0.6)",
                  animation: "pulse 2.4s ease-in-out infinite",
                }}
              />
              <div>
                <div className="font-mono-ui text-[9px] tracking-[0.28em] text-foreground/45">
                  {it.label}
                </div>
                <div className="font-mono-ui mt-0.5 text-[13px] tabular-nums text-foreground/85">
                  {it.value}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div
        className="absolute bottom-[10%] left-1/2 -translate-x-1/2 font-mono-ui text-[9px] tracking-[0.4em] text-foreground/40"
      >
        UPDATING EVERY SECOND · {String(tick % 60).padStart(2, "0")}s
      </div>
    </div>
  );
}

/* ============================================================
 * Final CTA — single elegant link, reactive to hover.
 * ========================================================== */
function FinalCta({
  progress,
  onHoverChange,
}: {
  progress: number;
  onHoverChange: (v: number) => void;
}) {
  const enter = clamp01((progress - 0.5) / 0.06);
  const exit = clamp01(1 - (progress - 0.82) / 0.06);
  const opacity = enter * exit;
  if (opacity <= 0.001) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[58%] z-[70] flex justify-center px-8"
      style={{ opacity }}
    >
      <button
        type="button"
        className="pointer-events-auto group inline-flex items-center gap-6"
        onPointerEnter={() => onHoverChange(1)}
        onPointerLeave={() => onHoverChange(0)}
      >
        <span className="font-mono-ui text-[11px] tracking-[0.35em] uppercase text-foreground/85 transition-colors duration-500 group-hover:text-foreground">
          Enter live intelligence
        </span>
        <span className="relative block h-px w-28 bg-[color:var(--hairline)]">
          <span className="absolute inset-y-0 left-0 w-0 bg-foreground transition-all duration-700 group-hover:w-full" />
        </span>
        <span className="font-mono-ui text-[11px] text-foreground/60 transition-transform duration-500 group-hover:translate-x-2">
          →
        </span>
      </button>
    </div>
  );
}

/* ============================================================
 * Quiet planetary footer — invisible until almost the end.
 * ========================================================== */
function PlanetaryFooter({ progress, setHover }: { progress: number; setHover: (v: number) => void }) {
  const t = clamp01((progress - 0.86) / 0.08);
  if (t <= 0) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[14%] sm:bottom-[18%] z-[90] flex flex-col items-center px-4 sm:px-8 text-center"
      style={{ opacity: t }}
    >
      <div className="w-full max-w-5xl flex flex-col items-center gap-5">
        {/* Anchor indicator line */}
        <div className="w-20 h-px bg-white/10 mb-6" />

        {/* Center Column: Branding title lockup */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <h2 className="font-neue-montreal font-bold tracking-[0.35em] text-[28px] sm:text-[40px] lg:text-[48px] text-white leading-none">
            WEATHERWATCH AI
          </h2>
          <div className="font-mono-ui text-[12px] sm:text-[14px] tracking-[0.3em] text-cyan-400/90 font-bold uppercase mt-2">
            Project 3 • Pinnacle Labs
          </div>
        </div>

        {/* Large Back to Top button */}
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          onPointerEnter={() => setHover(1)}
          onPointerLeave={() => setHover(0)}
          className="pointer-events-auto border border-white/15 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] px-10 py-4 sm:px-12 sm:py-5 rounded-full text-[11px] sm:text-[12px] font-mono-ui uppercase tracking-[0.35em] text-white/80 hover:text-white transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] mt-8 select-none shadow-[0_0_24px_rgba(255,255,255,0.02)] hover:shadow-[0_0_32px_rgba(255,255,255,0.08)]"
          title="BACK TO SPACE"
        >
          BACK TO TOP ↑
        </button>
      </div>
    </div>
  );
}

/* ============================================================
 * Final whisper — "Still watching."
 * ========================================================== */
function StillWatching({ progress }: { progress: number }) {
  const t = clamp01((progress - 0.94) / 0.05);
  if (t <= 0) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[73] flex justify-center"
      style={{ opacity: t }}
    >
      <div
        className="font-editorial italic text-foreground/45 text-[12px] tracking-widest select-none pointer-events-none animate-pulse"
        style={{ textShadow: "0 0 16px rgba(200,220,255,0.25)" }}
      >
        Still watching.
      </div>
    </div>
  );
}

/* ============================================================
 * Scene 08 root.
 * ========================================================== */
export function Scene08({
  progress,
  scene08Scroll,
  pointer,
}: {
  progress: number;
  scene08Scroll: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const visIn = clamp01(progress / 0.04);
  const visibility = visIn; // never fully fades — the world keeps spinning
  const visibilityRef = useRef(0);
  visibilityRef.current = visibility;

  const hoverRef = useRef(0);
  const [, setHoverTick] = useState(0);
  const setHover = (v: number) => {
    hoverRef.current = v;
    setHoverTick((x) => x + 1);
  };

  if (visibility <= 0.001) return null;

  return (
    <>
      {/* Deep space wash that strengthens at the end */}
      <div
        className="pointer-events-none fixed inset-0 z-[62]"
        style={{
          opacity: visibility,
          background:
            "radial-gradient(ellipse at 50% 52%, rgba(6,10,22,0.55) 0%, rgba(2,4,10,0.95) 60%, rgba(0,1,4,1) 100%)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-[63]"
        style={{
          opacity: visibility * 0.5,
          background:
            "radial-gradient(ellipse at 50% 52%, rgba(110,160,230,0.12) 0%, rgba(60,90,180,0.05) 50%, transparent 80%)",
          mixBlendMode: "screen",
        }}
      />

      <LivingEarth
        progressRef={scene08Scroll}
        pointer={pointer}
        visibilityRef={visibilityRef}
        hoverRef={hoverRef}
      />

      <PlanetaryStatus progress={progress} />
      <FinalCta progress={progress} onHoverChange={setHover} />
      <PlanetaryFooter progress={progress} setHover={setHover} />
      <StillWatching progress={progress} />
    </>
  );
}
