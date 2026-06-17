import { useEffect, useRef } from "react";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ============================================================
 * Network field — Canvas2D.
 * Thousands of glowing data particles flowing along invisible
 * currents. Particles snap onto network "rails" mid-scene,
 * then extend forward into the future near the end of the scene
 * (handoff into Predictive Intelligence).
 * ========================================================== */
function NetworkField({
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

    // ---- Build a soft neural lattice of nodes
    type Node = { x: number; y: number; r: number; phase: number; cat: number };
    const NODE_COUNT = 46;
    const nodes: Node[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: rand(0.05, 0.95) * W,
        y: rand(0.12, 0.92) * H,
        r: rand(1.2, 2.4),
        phase: rand(0, Math.PI * 2),
        cat: Math.floor(Math.random() * 6),
      });
    }

    // Pre-compute edges: each node links to 2-3 nearest neighbours
    type Edge = { a: number; b: number; len: number };
    const edges: Edge[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const dists: { j: number; d: number }[] = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        dists.push({ j, d: Math.sqrt(dx * dx + dy * dy) });
      }
      dists.sort((a, b) => a.d - b.d);
      const k = 2 + (i % 2);
      for (let n = 0; n < k; n++) {
        const j = dists[n].j;
        if (i < j) edges.push({ a: i, b: j, len: dists[n].d });
      }
    }

    // ---- Particles
    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      phase: number;
      // when bound to an edge:
      edge: number; // -1 = free
      tEdge: number; // 0..1 along edge
      speed: number;
      hue: number; // 0..5 category
    };
    const NUM = 1100;
    const ps: P[] = [];
    for (let i = 0; i < NUM; i++) {
      ps.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: rand(-0.25, 0.25),
        vy: rand(-0.15, 0.15),
        size: rand(0.5, 1.5),
        alpha: rand(0.3, 0.9),
        phase: rand(0, Math.PI * 2),
        edge: -1,
        tEdge: Math.random(),
        speed: rand(0.0018, 0.005),
        hue: Math.floor(Math.random() * 6),
      });
    }

    // Category palette — cool intelligence tones, never news-red
    const CATS: [number, number, number][] = [
      [180, 215, 255], // Weather
      [165, 235, 220], // Environment
      [255, 200, 150], // Emergency
      [200, 200, 240], // Transportation
      [180, 240, 200], // Public Safety
      [220, 215, 255], // Infrastructure
    ];

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;

      const p = progressRef.current;
      const vis = visibilityRef.current;

      // Phases:
      //  0.00 - 0.20  free drift (atmosphere reorganizing)
      //  0.20 - 0.55  binding to network edges
      //  0.55 - 0.80  full network alive
      //  0.80 - 1.00  extending forward (predictive)
      const bindStrength = clamp01((p - 0.18) / 0.32);
      const networkBrightness = clamp01((p - 0.10) / 0.20);
      const forecast = clamp01((p - 0.78) / 0.18);

      // Background — slight motion blur trail
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(5,7,14,${0.18 + networkBrightness * 0.05})`;
      ctx.fillRect(0, 0, W, H);

      // ---- Draw edges (network rails)
      if (networkBrightness > 0.02) {
        ctx.globalCompositeOperation = "lighter";
        for (let e = 0; e < edges.length; e++) {
          const eg = edges[e];
          // Skip the long, ugly edges
          if (eg.len > Math.min(W, H) * 0.55) continue;
          const A = nodes[eg.a];
          const B = nodes[eg.b];
          const baseA = 0.05 + networkBrightness * 0.16;
          ctx.strokeStyle = `rgba(160,195,235,${baseA.toFixed(3)})`;
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          ctx.lineTo(B.x, B.y);
          ctx.stroke();
        }

        // Future projections — extend selected edges off-screen to the right
        if (forecast > 0.01) {
          ctx.setLineDash([2, 6]);
          for (let i = 0; i < nodes.length; i++) {
            if (i % 3 !== 0) continue;
            const N = nodes[i];
            const angle = Math.sin(N.phase + now * 0.0004) * 0.4;
            const reach = lerp(60, 380, forecast);
            const tx = N.x + Math.cos(angle) * reach;
            const ty = N.y + Math.sin(angle) * reach * 0.3;
            ctx.strokeStyle = `rgba(210,225,255,${(0.05 + forecast * 0.35).toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(N.x, N.y);
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }
      }

      // ---- Update + draw particles
      ctx.globalCompositeOperation = "lighter";
      const cx = (pointer.current.x * 0.5 + 0.5) * W;
      const cy = (-pointer.current.y * 0.5 + 0.5) * H;

      for (let i = 0; i < ps.length; i++) {
        const pt = ps[i];

        // Decide whether this particle binds to an edge
        if (pt.edge < 0 && bindStrength > 0 && Math.random() < 0.004 * bindStrength) {
          pt.edge = Math.floor(Math.random() * edges.length);
          pt.tEdge = Math.random();
        }
        // Some particles unbind to keep things alive
        if (pt.edge >= 0 && Math.random() < 0.0005) pt.edge = -1;

        if (pt.edge >= 0 && bindStrength > 0.05) {
          const eg = edges[pt.edge];
          const A = nodes[eg.a];
          const B = nodes[eg.b];
          pt.tEdge += pt.speed * dt * (1.6 + forecast * 0.6);
          if (pt.tEdge > 1) pt.tEdge = 0;
          const tx = A.x + (B.x - A.x) * pt.tEdge;
          const ty = A.y + (B.y - A.y) * pt.tEdge;
          // Smoothly settle onto the rail
          pt.x = lerp(pt.x, tx, 0.18 * bindStrength);
          pt.y = lerp(pt.y, ty, 0.18 * bindStrength);
        } else {
          // Free drift
          const dx = pt.x - cx;
          const dy = pt.y - cy;
          const d2 = dx * dx + dy * dy;
          if (d2 < 16000) {
            const f = (1 - d2 / 16000) * 0.5;
            const inv = 1 / Math.max(6, Math.sqrt(d2));
            pt.vx += dx * inv * f;
            pt.vy += dy * inv * f;
          }
          pt.phase += dt * 0.02;
          const curX = Math.sin(pt.phase + pt.y * 0.004) * 0.18;
          const curY = Math.cos(pt.phase * 0.7 + pt.x * 0.003) * 0.12;
          pt.x += (pt.vx + curX) * dt;
          pt.y += (pt.vy + curY) * dt;
          pt.vx *= 0.95;
          pt.vy *= 0.95;
        }

        if (pt.x < -20) pt.x = W + 20;
        if (pt.x > W + 20) pt.x = -20;
        if (pt.y < -20) pt.y = H + 20;
        if (pt.y > H + 20) pt.y = -20;

        const a = pt.alpha * vis * (0.55 + networkBrightness * 0.5);
        const c = CATS[pt.hue];
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---- Draw nodes (with pulse)
      if (networkBrightness > 0.02) {
        for (let i = 0; i < nodes.length; i++) {
          const N = nodes[i];
          const pulse = 0.6 + 0.4 * Math.sin(now * 0.002 + N.phase);
          const c = CATS[N.cat];
          const a = networkBrightness * vis * pulse;
          // halo
          const grd = ctx.createRadialGradient(N.x, N.y, 0, N.x, N.y, 14);
          grd.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${(a * 0.55).toFixed(3)})`);
          grd.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(N.x, N.y, 14, 0, Math.PI * 2);
          ctx.fill();
          // core
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(a * 0.95).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(N.x, N.y, N.r, 0, Math.PI * 2);
          ctx.fill();
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
      className="pointer-events-none fixed inset-0 z-[34]"
      aria-hidden
    />
  );
}

/* ============================================================
 * Headline — "EVERY WEATHER EVENT / LEAVES A SIGNAL."
 * ========================================================== */
function Headline({ progress }: { progress: number }) {
  const l1 = clamp01((progress - 0.04) / 0.05);
  const l2 = clamp01((progress - 0.16) / 0.06);
  const out = clamp01(1 - (progress - 0.84) / 0.08);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[14%] z-[40] flex flex-col items-center px-8 sm:px-12"
      style={{ opacity: out }}
    >
      <div className="font-mono-ui mb-5 text-[10px] tracking-[0.3em] text-foreground/45">
        CHAPTER 05 · SIGNAL INTELLIGENCE
      </div>
      <div className="text-center font-editorial">
        <Reveal t={l1} className="text-[8vw] text-foreground/95 sm:text-[4.6vw] lg:text-[3.6vw]">
          Every weather event
        </Reveal>
        <Reveal
          t={l2}
          className="mt-2 text-[10vw] italic text-foreground sm:text-[6.2vw] lg:text-[5vw]"
          glow
        >
          leaves a signal.
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
          textShadow: glow ? "0 0 50px rgba(180,210,255,0.35)" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================
 * Category ecosystems — living taxonomy labels around the field.
 * Not menu items. Hairline + soft pulse.
 * ========================================================== */
const CATEGORIES = [
  { top: "26%", left: "5%", label: "WEATHER",        sig: "1,284", tint: "180,215,255", from: 0.20 },
  { top: "40%", left: "7%", label: "ENVIRONMENT",    sig: "  612", tint: "165,235,220", from: 0.26 },
  { top: "56%", left: "4%", label: "PUBLIC SAFETY",  sig: "  348", tint: "180,240,200", from: 0.32 },
  { top: "26%", right: "5%", label: "TRANSPORTATION", sig: "  927", tint: "200,200,240", from: 0.22 },
  { top: "40%", right: "7%", label: "EMERGENCY",      sig: "  154", tint: "255,200,150", from: 0.28 },
  { top: "56%", right: "4%", label: "INFRASTRUCTURE", sig: "  481", tint: "220,215,255", from: 0.34 },
] as const;

function Categories({ progress }: { progress: number }) {
  const out = clamp01(1 - (progress - 0.88) / 0.06);
  return (
    <div className="pointer-events-none fixed inset-0 z-[36] hidden lg:block" style={{ opacity: out }}>
      {CATEGORIES.map((c, i) => {
        const t = clamp01((progress - c.from) / 0.06);
        if (t <= 0.001) return null;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: (c as any).top,
              left: (c as any).left,
              right: (c as any).right,
              opacity: t,
              transform: `translateY(${(1 - t) * 12}px)`,
              transition: "opacity 240ms linear, transform 240ms linear",
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: `rgb(${c.tint})`,
                  boxShadow: `0 0 10px rgba(${c.tint},0.7)`,
                  animation: "nodePulse05 2.4s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
              <span className="font-mono-ui text-[9px] tracking-[0.28em] text-foreground/55">
                {c.label}
              </span>
            </div>
            <div className="mt-1 ml-3.5 font-mono-ui text-[10px] text-foreground/80">
              <span className="text-foreground/35 mr-1.5">SIG</span>
              {c.sig}
            </div>
            <style>{`@keyframes nodePulse05 { 0%,100% { opacity:.55 } 50% { opacity: 1 } }`}</style>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * Live signal stream — text fragments arriving on the network.
 * No card chrome. Mono-typed feed pinned bottom-center.
 * ========================================================== */
const SIGNALS: { text: string; cat: string; tint: string; from: number }[] = [
  { text: "Heavy rainfall intensifying · Mumbai coastal districts", cat: "WEATHER",        tint: "180,215,255", from: 0.30 },
  { text: "Flood warning issued · Konkan belt",                     cat: "PUBLIC SAFETY",  tint: "180,240,200", from: 0.34 },
  { text: "Traffic disruption · Western Express Hwy slowed 62%",    cat: "TRANSPORT",      tint: "200,200,240", from: 0.38 },
  { text: "Visibility reduction detected · BOM airport · 1.2 km",   cat: "TRANSPORT",      tint: "200,200,240", from: 0.42 },
  { text: "Emergency response dispatched · NDRF teams mobilised",   cat: "EMERGENCY",      tint: "255,200,150", from: 0.46 },
  { text: "Power restoration underway · 12 substations reporting",  cat: "INFRASTRUCTURE", tint: "220,215,255", from: 0.50 },
  { text: "Monsoon activity intensified · 3-day outlook revised",   cat: "WEATHER",        tint: "180,215,255", from: 0.54 },
  { text: "Air quality recovering · PM2.5 down 28% post-rainfall",  cat: "ENVIRONMENT",    tint: "165,235,220", from: 0.58 },
  { text: "Storm cell forming · 240 km SW of Vizag",                cat: "WEATHER",        tint: "180,215,255", from: 0.62 },
  { text: "Coastal advisory · fishermen recall in effect",          cat: "PUBLIC SAFETY",  tint: "180,240,200", from: 0.66 },
];

function LiveSignals({ progress }: { progress: number }) {
  const out = clamp01(1 - (progress - 0.90) / 0.06);
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[40] flex justify-center px-8"
      style={{ opacity: out }}
    >
      <div className="w-full max-w-3xl">
        <div className="font-mono-ui mb-3 flex items-center gap-3 text-[9px] tracking-[0.3em] text-foreground/40">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--ember)]" />
          LIVE SIGNAL FEED · GLOBAL
          <span className="ml-auto text-foreground/30">{progress > 0.2 ? "STREAMING" : "STANDBY"}</span>
        </div>
        <div className="space-y-1.5">
          {SIGNALS.map((s, i) => {
            const t = clamp01((progress - s.from) / 0.025);
            if (t <= 0) return null;
            return (
              <div
                key={i}
                className="flex items-baseline gap-3"
                style={{
                  opacity: t,
                  transform: `translateX(${(1 - t) * -10}px)`,
                  transition: "transform 320ms ease-out",
                }}
              >
                <span
                  className="font-mono-ui text-[9px] tracking-[0.2em]"
                  style={{ color: `rgb(${s.tint})` }}
                >
                  ▸
                </span>
                <span className="font-mono-ui text-[9px] tracking-[0.22em] text-foreground/35 w-[7ch] shrink-0">
                  {String(1700 + i * 13).padStart(4, "0")}Z
                </span>
                <span
                  className="font-mono-ui text-[9px] tracking-[0.22em] text-foreground/35 w-[15ch] shrink-0"
                  style={{ color: `rgba(${s.tint},0.55)` }}
                >
                  {s.cat}
                </span>
                <span className="font-editorial text-[13px] text-foreground/85 leading-snug">
                  {s.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Chain-reaction panel — visualizes one event cascading
 * through the network. Center-screen, mid-scene moment.
 *   Heavy Rainfall → Traffic Disruption → Flood Warning
 *                  → Emergency Response → News Coverage
 * ========================================================== */
const CHAIN = [
  { label: "Heavy Rainfall",     tint: "180,215,255" },
  { label: "Traffic Disruption", tint: "200,200,240" },
  { label: "Flood Warning",      tint: "180,240,200" },
  { label: "Emergency Response", tint: "255,200,150" },
  { label: "News Coverage",      tint: "220,215,255" },
];

function ChainReaction({ progress }: { progress: number }) {
  const enter = clamp01((progress - 0.46) / 0.04);
  const exit = clamp01(1 - (progress - 0.74) / 0.05);
  const v = enter * exit;
  if (v <= 0.001) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[44%] z-[38] flex justify-center px-8"
      style={{ opacity: v }}
    >
      <div className="flex items-center gap-3 sm:gap-5">
        {CHAIN.map((c, i) => {
          const t = clamp01((progress - (0.48 + i * 0.04)) / 0.03);
          return (
            <div key={i} className="flex items-center gap-3 sm:gap-5">
              <div
                style={{
                  opacity: t,
                  transform: `translateY(${(1 - t) * 8}px)`,
                  transition: "transform 300ms ease-out",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      background: `rgb(${c.tint})`,
                      boxShadow: `0 0 14px rgba(${c.tint},0.85)`,
                    }}
                  />
                  <span className="font-editorial italic text-foreground/90 text-sm sm:text-base whitespace-nowrap">
                    {c.label}
                  </span>
                </div>
              </div>
              {i < CHAIN.length - 1 && (
                <div
                  className="relative h-px overflow-hidden"
                  style={{
                    width: 36,
                    background: "rgba(180,200,235,0.18)",
                    opacity: t,
                  }}
                >
                  <div
                    className="absolute inset-y-0 w-3"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(210,230,255,0.85), transparent)",
                      animation: "chainPulse05 1.8s linear infinite",
                      animationDelay: `${i * 0.25}s`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes chainPulse05 { from { transform: translateX(-12px) } to { transform: translateX(40px) } }`}</style>
    </div>
  );
}

/* ============================================================
 * Predictive handoff — future signal pathways extend forward.
 * Final beat of scene 05, foreshadow of next scene.
 * ========================================================== */
function PredictiveHandoff({ progress }: { progress: number }) {
  const t = clamp01((progress - 0.80) / 0.12);
  if (t <= 0) return null;
  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 top-[40%] z-[40] flex justify-center px-8"
        style={{ opacity: t }}
      >
        <p
          className="max-w-[40ch] text-center font-editorial italic text-foreground/85 text-xl sm:text-2xl"
          style={{ textShadow: "0 0 30px rgba(180,210,255,0.35)" }}
        >
          The network begins forecasting itself.
        </p>
      </div>
      <div
        className="pointer-events-none fixed inset-x-0 bottom-10 z-[40] flex justify-center"
        style={{ opacity: t }}
      >
        <div className="font-mono-ui text-[10px] tracking-[0.3em] text-foreground/55">
          NEXT · PREDICTIVE INTELLIGENCE
        </div>
      </div>
    </>
  );
}

/* ============================================================
 * Scene 05 root.
 * ========================================================== */
export function Scene05({
  progress,
  scene05Scroll,
  pointer,
}: {
  progress: number; // throttled 0..1
  scene05Scroll: React.MutableRefObject<number>; // realtime 0..1
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const visIn = clamp01(progress / 0.04);
  const visOut = clamp01(1 - (progress - 0.96) / 0.04);
  const visibility = visIn * visOut;
  const visibilityRef = useRef(0);
  visibilityRef.current = visibility;

  if (visibility <= 0.001) return null;

  return (
    <>
      {/* Deep observatory dim wash */}
      <div
        className="pointer-events-none fixed inset-0 z-[32]"
        style={{
          opacity: visibility,
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(8,12,22,0.55) 0%, rgba(4,6,12,0.88) 60%, rgba(2,3,8,0.97) 100%)",
        }}
      />
      {/* Cool intelligence tint */}
      <div
        className="pointer-events-none fixed inset-0 z-[33]"
        style={{
          opacity: visibility * 0.5,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(80,120,180,0.10) 0%, rgba(40,60,110,0.06) 50%, transparent 80%)",
          mixBlendMode: "screen",
        }}
      />

      <NetworkField
        progressRef={scene05Scroll}
        pointer={pointer}
        visibilityRef={visibilityRef}
      />


      <LiveSignals progress={progress} />
      <PredictiveHandoff progress={progress} />
    </>
  );
}