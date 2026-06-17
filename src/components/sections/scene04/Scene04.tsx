import { useEffect, useRef } from "react";
import type { LiveWeather } from "@/hooks/useLiveWeather";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/* ============================================================
 * Particle field — Canvas2D, cursor interactive.
 * Density and tint shift with scene04 progress so the camera
 * appears to drift through a polluted region (peak around 0.55)
 * and emerge into cleaner air.
 * ========================================================== */
function AirField({
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

    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      type: 0 | 1 | 2 | 3; // fine PM · dust · pollen · moisture
      phase: number;
      drift: number;
    };
    const NUM = 380;
    const ps: P[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    for (let i = 0; i < NUM; i++) {
      const r = Math.random();
      let type: P["type"];
      let size: number;
      if (r < 0.55) {
        type = 0;
        size = rand(0.5, 1.6);
      } else if (r < 0.78) {
        type = 1;
        size = rand(1.0, 2.2);
      } else if (r < 0.9) {
        type = 2;
        size = rand(1.4, 2.6);
      } else {
        type = 3;
        size = rand(0.4, 1.0);
      }
      ps.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: rand(-0.25, 0.25),
        vy: rand(-0.1, 0.2),
        size,
        alpha: rand(0.25, 0.85),
        type,
        phase: rand(0, Math.PI * 2),
        drift: rand(0.6, 1.4),
      });
    }

    const COLORS: Record<P["type"], [number, number, number]> = {
      0: [205, 215, 230], // fine PM — pale blue/grey
      1: [205, 175, 130], // dust — warm tan
      2: [220, 210, 130], // pollen — yellow-green
      3: [180, 215, 240], // moisture — cool
    };

    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(48, now - last) / 16.67;
      last = now;

      const p = progressRef.current;
      const vis = visibilityRef.current; // global mount visibility 0..1

      // Pollution density curve — gaussian peak around progress=0.55
      const pollute = Math.exp(-Math.pow((p - 0.55) / 0.16, 2));
      const density = lerp(0.35, 1.0, pollute);

      // Clear (translucent) for slight motion-blur trails
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgba(8,10,16,${0.18 + pollute * 0.06})`;
      ctx.fillRect(0, 0, W, H);

      // Warm pollution tint wash
      if (pollute > 0.02) {
        const grd = ctx.createRadialGradient(
          W * 0.5,
          H * 0.55,
          H * 0.1,
          W * 0.5,
          H * 0.55,
          H * 0.9,
        );
        grd.addColorStop(0, `rgba(170,110,70,${pollute * 0.18})`);
        grd.addColorStop(1, `rgba(20,15,25,0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // Cursor position in CSS px
      const cx = (pointer.current.x * 0.5 + 0.5) * W;
      const cy = (-pointer.current.y * 0.5 + 0.5) * H;

      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < ps.length; i++) {
        const pt = ps[i];

        // Cursor disturbance (radial push)
        const dx = pt.x - cx;
        const dy = pt.y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14000) {
          const f = (1 - d2 / 14000) * 0.55;
          const inv = 1 / Math.max(6, Math.sqrt(d2));
          pt.vx += dx * inv * f;
          pt.vy += dy * inv * f;
        }

        // Drift — invisible currents
        pt.phase += dt * 0.018;
        const curX = Math.sin(pt.phase + pt.y * 0.004) * 0.18 * pt.drift;
        const curY = Math.cos(pt.phase * 0.7 + pt.x * 0.003) * 0.10 * pt.drift;
        pt.x += (pt.vx + curX) * dt;
        pt.y += (pt.vy + curY) * dt;

        pt.vx *= 0.95;
        pt.vy *= 0.95;
        pt.vy += 0.004; // gentle settle

        if (pt.x < -20) pt.x = W + 20;
        if (pt.x > W + 20) pt.x = -20;
        if (pt.y < -20) pt.y = H + 20;
        if (pt.y > H + 20) pt.y = -20;

        // Boost fine-PM visibility in polluted phase, suppress moisture there
        let typeMul = 0.85;
        if (pt.type === 0) typeMul = 0.6 + pollute * 0.6;
        else if (pt.type === 1) typeMul = 0.5 + pollute * 0.5;
        else if (pt.type === 3) typeMul = 1.0 - pollute * 0.4;

        const a = pt.alpha * density * typeMul * vis;
        const c = COLORS[pt.type];
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
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
  }, [pointer, progressRef, visibilityRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[24]"
      aria-hidden
    />
  );
}

/* ============================================================
 * Embedded data labels — emerge from the atmosphere itself.
 * No card chrome. Hairline tick + connector + value.
 * ========================================================== */
// All data labels sit on the right side so they never collide with the
// ChapterPanel headline anchored on the left. Values come from live data.
const FALLBACK_DATA_POINTS = [
  { top: "22%", right: "8%",  big: "—", tag: "AQI",            sub: "AWAITING",  delay: 0.28 },
  { top: "38%", right: "10%", big: "—", tag: "PM2.5 µg/m³",    sub: "AWAITING",  delay: 0.34 },
  { top: "56%", right: "8%",  big: "—", tag: "HUMIDITY",       sub: "AWAITING",  delay: 0.40 },
  { top: "72%", right: "12%", big: "—", tag: "VISIBILITY km",  sub: "AWAITING",  delay: 0.46 },
] as const;

function buildDataPoints(live: LiveWeather | undefined) {
  if (!live) return FALLBACK_DATA_POINTS;
  const { air, current } = live;
  const vis = current.visibilityKm;
  const visLabel = vis >= 10 ? "CLEAR" : vis >= 4 ? "HAZE" : "LOW";
  return [
    { top: "22%", right: "8%",  big: String(air.aqi),                tag: "AQI",           sub: air.label.toUpperCase(),    delay: 0.28 },
    { top: "38%", right: "10%", big: air.pm25.toFixed(1),            tag: "PM2.5 µg/m³",   sub: `PM10 ${air.pm10.toFixed(0)}`, delay: 0.34 },
    { top: "56%", right: "8%",  big: `${Math.round(current.humidity)}%`, tag: "HUMIDITY",  sub: `CLOUD ${Math.round(current.cloudCover)}%`, delay: 0.40 },
    { top: "72%", right: "12%", big: vis.toFixed(1),                 tag: "VISIBILITY km", sub: visLabel,                   delay: 0.46 },
  ] as const;
}


function EmbeddedData({ progress, live }: { progress: number; live?: LiveWeather }) {
  const DATA_POINTS = buildDataPoints(live);
  return (
    <div className="pointer-events-none fixed inset-0 z-[28] hidden lg:block">
      {DATA_POINTS.map((d, i) => {
        const t = clamp01((progress - d.delay) / 0.08);
        const fade = clamp01(1 - (progress - 0.9) / 0.08); // dissolve as news takes over
        const opacity = t * fade;
        if (opacity <= 0.001) return null;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: (d as any).top,
              left: (d as any).left,
              right: (d as any).right,
              opacity,
              transform: `translateY(${(1 - t) * 14}px)`,
              transition: "opacity 240ms linear, transform 240ms linear",
            }}
          >
            <div className="flex items-end gap-3">
              <div className="flex flex-col items-center pb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground/70 shadow-[0_0_12px_rgba(180,210,255,0.7)]" />
                <div className="mt-1 h-7 w-px bg-gradient-to-b from-foreground/40 to-transparent" />
              </div>
              <div>
                <div className="font-mono-ui text-[9px] tracking-[0.22em] text-foreground/45">
                  {d.tag}
                </div>
                <div
                  className="font-editorial text-4xl text-foreground/95 leading-none mt-0.5 sm:text-5xl"
                  style={{ textShadow: "0 0 28px rgba(200,180,150,0.25)" }}
                >
                  {d.big}
                </div>
                <div className="font-mono-ui mt-1 text-[9px] tracking-[0.22em] text-foreground/45">
                  {d.sub}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * Whispered insights — appear sequentially, fade out.
 * ========================================================== */
const INSIGHTS = [
  { text: "Air quality is moderate.", from: 0.18 },
  { text: "Outdoor activity is safe.", from: 0.30 },
  { text: "Visibility remains stable.", from: 0.42 },
  { text: "Pollution expected to increase after sunset.", from: 0.56 },
];

function Insights({ progress }: { progress: number }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-44 z-[29] flex flex-col items-center gap-1">
      {INSIGHTS.map((it, i) => {
        const t = clamp01((progress - it.from) / 0.05);
        const out = clamp01(1 - (progress - (it.from + 0.12)) / 0.06);
        const opacity = t * out * (1 - clamp01((progress - 0.88) / 0.06));
        if (opacity <= 0.001) return null;
        return (
          <div
            key={i}
            className="font-editorial italic text-foreground/85 text-xl sm:text-2xl"
            style={{
              opacity,
              transform: `translateY(${(1 - t) * 8}px)`,
              textShadow: "0 0 22px rgba(180,210,255,0.25)",
              letterSpacing: "-0.01em",
            }}
          >
            {it.text}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * Forecast ticker — rotates atmospheric predictions.
 * ========================================================== */
const FORECASTS = [
  "Air quality improving in 3 hours.",
  "Pollen levels rising tomorrow.",
  "Visibility decreasing overnight.",
  "PM2.5 expected to drop 18% by 21:00.",
  "Inversion layer lifting at 06:40.",
];

function ForecastTicker({ progress }: { progress: number }) {
  const idx = Math.floor(progress * 12) % FORECASTS.length;
  const visible = clamp01((progress - 0.22) / 0.05) * clamp01(1 - (progress - 0.9) / 0.06);
  return (
    <div
      className="pointer-events-none fixed bottom-10 right-8 z-[29] hidden sm:right-12 lg:block"
      style={{ opacity: visible }}
    >
      <div className="font-mono-ui mb-2 flex items-center gap-3 text-[9px] tracking-[0.3em] text-foreground/40">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--atmosphere)]" />
        ATMOSPHERIC FORECAST
      </div>
      <div className="relative h-6 w-[300px] overflow-hidden">
        {FORECASTS.map((f, i) => (
          <div
            key={i}
            className="absolute inset-0 font-editorial italic text-foreground/80 text-base"
            style={{
              opacity: i === idx ? 1 : 0,
              transform: `translateY(${i === idx ? 0 : 10}px)`,
              transition: "opacity 500ms ease-out, transform 500ms ease-out",
            }}
          >
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
 * Human silhouettes — tiny figures along a horizon, walking.
 * The atmosphere around them changes with pollution density.
 * ========================================================== */
function Silhouettes({ progress }: { progress: number }) {
  const visible = clamp01((progress - 0.34) / 0.08) * clamp01(1 - (progress - 0.88) / 0.06);
  const pollute = Math.exp(-Math.pow((progress - 0.55) / 0.16, 2));

  const figures = [
    { d: "M 0 18 L 0 9 L -2 4 L 0 0 L 2 4 L 0 9 M -3 12 L 3 12", label: "Commuter", x: "12%", scale: 1, speed: 14 },
    { d: "M 0 18 L 0 10 L -3 5 L 0 1 L 3 5 L 0 10 M -2 14 L 2 14 M -3 18 L 3 18", label: "Runner", x: "28%", scale: 0.9, speed: 9 },
    { d: "M 0 18 L 0 9 L -2 4 L 0 0 L 2 4 L 0 9 M -3 13 L 3 13 M -4 18 L 4 18", label: "Cyclist", x: "62%", scale: 1.05, speed: 11 },
    { d: "M 0 16 L 0 8 L -2 4 L 0 1 L 2 4 L 0 8 M -2 12 L 2 12", label: "Child", x: "84%", scale: 0.78, speed: 16 },
  ];

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-[22%] z-[26] hidden lg:block"
      style={{ opacity: visible }}
    >
      <style>{`
        @keyframes walk { from { transform: translateX(-20px) } to { transform: translateX(20px) } }
        @keyframes bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1px) } }
      `}</style>
      {figures.map((f, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: f.x,
            bottom: 0,
            animation: `walk ${f.speed}s ease-in-out ${i % 2 === 0 ? "alternate" : "alternate-reverse"} infinite`,
          }}
        >
          {/* Atmospheric halo around figure — denser in polluted phase */}
          <div
            className="absolute -inset-6 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(190,150,110,0.35) 0%, rgba(170,140,100,0.12) 50%, transparent 75%)",
              opacity: 0.4 + pollute * 0.6,
              filter: "blur(8px)",
              mixBlendMode: "screen",
            }}
          />
          <svg
            width={28 * f.scale}
            height={32 * f.scale}
            viewBox="-6 -2 12 22"
            style={{ animation: `bob ${1.2 + i * 0.2}s ease-in-out infinite` }}
          >
            <path
              d={f.d}
              fill="none"
              stroke="rgba(235,235,240,0.92)"
              strokeWidth={0.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
 * Headline reveal — three lines, staggered.
 * "YOU DON'T JUST LIVE / IN THE ATMOSPHERE. / YOU BREATHE IT."
 * ========================================================== */
function Headline({ progress }: { progress: number }) {
  const l1 = clamp01((progress - 0.06) / 0.05);
  const l2 = clamp01((progress - 0.14) / 0.05);
  const l3 = clamp01((progress - 0.24) / 0.06);
  const out = clamp01(1 - (progress - 0.86) / 0.06);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[16%] z-[30] flex flex-col items-center px-8 sm:px-12"
      style={{ opacity: out }}
    >
      <div className="font-mono-ui mb-5 text-[10px] tracking-[0.3em] text-foreground/45">
        CHAPTER 04 · YOU BREATHE THIS
      </div>
      <div className="text-center font-editorial">
        <Reveal t={l1} className="text-[7vw] text-foreground/95 sm:text-[4.2vw] lg:text-[3.4vw]">
          You don&apos;t just live
        </Reveal>
        <Reveal t={l2} className="text-[7vw] text-foreground/85 sm:text-[4.2vw] lg:text-[3.4vw]">
          in the atmosphere.
        </Reveal>
        <Reveal
          t={l3}
          className="mt-3 text-[10vw] italic text-foreground sm:text-[6.4vw] lg:text-[5.4vw]"
          glow
        >
          You breathe it.
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
    <div className="overflow-hidden pb-[0.16em]">
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
 * Emotional pollution caption — appears at the deepest moment.
 * ========================================================== */
function PollutionMoment({ progress }: { progress: number }) {
  const t =
    clamp01((progress - 0.48) / 0.04) *
    clamp01(1 - (progress - 0.66) / 0.06);
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[42%] z-[30] flex justify-center px-8"
      style={{ opacity: t }}
    >
      <p
        className="max-w-[36ch] text-center font-editorial italic text-foreground/85 text-2xl sm:text-3xl"
        style={{ textShadow: "0 0 40px rgba(180,140,90,0.4)" }}
      >
        Every breath carries the city with it.
      </p>
    </div>
  );
}

/* ============================================================
 * Data-network handoff — at the end, particles "organize" into
 * dashed signal lines and news headlines materialize.
 * ========================================================== */
const NEWS = [
  "STORM TRACKS EAST · 6 STATES IN PATH",
  "PM2.5 SPIKES TO 142 · DELHI NCR",
  "WILDFIRE SMOKE BLANKETS PACIFIC NW",
  "POLLEN COUNT HITS SEASONAL HIGH",
  "AIR QUALITY ADVISORY · CENTRAL EUROPE",
];

function DataNetwork({ progress }: { progress: number }) {
  const t = clamp01((progress - 0.82) / 0.12);
  if (t <= 0) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[31]">
      {/* Signal lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={{ opacity: t * 0.85 }}
      >
        <defs>
          <linearGradient id="sig" x1="0" x2="1">
            <stop offset="0%" stopColor="rgba(200,220,255,0)" />
            <stop offset="50%" stopColor="rgba(200,220,255,0.6)" />
            <stop offset="100%" stopColor="rgba(200,220,255,0)" />
          </linearGradient>
        </defs>
        {[
          { d: "M -50 220 C 380 180, 760 280, 1500 200", delay: 0 },
          { d: "M -50 380 C 360 420, 820 320, 1500 420", delay: 1.4 },
          { d: "M -50 560 C 400 520, 880 620, 1500 560", delay: 2.8 },
          { d: "M -50 720 C 380 760, 760 660, 1500 740", delay: 4.2 },
        ].map((p, i) => (
          <path
            key={i}
            d={p.d}
            stroke="url(#sig)"
            strokeWidth={1}
            fill="none"
            strokeDasharray="3 10"
            style={{
              animation: `signalRun ${10 + i * 2}s linear infinite`,
              animationDelay: `-${p.delay}s`,
            }}
          />
        ))}
        {/* Nodes */}
        {[
          [240, 220], [560, 240], [880, 250], [1180, 210],
          [180, 400], [520, 380], [900, 360], [1240, 420],
          [260, 580], [600, 590], [960, 600], [1200, 560],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={2}
            fill="rgba(220,230,255,0.85)"
            style={{
              animation: `nodePulse ${2 + (i % 4) * 0.4}s ease-in-out infinite`,
              animationDelay: `${(i % 6) * 0.2}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes signalRun { from { stroke-dashoffset: 0 } to { stroke-dashoffset: -600 } }
          @keyframes nodePulse { 0%,100% { r:1.4; opacity:0.5 } 50% { r:2.6; opacity:1 } }
        `}</style>
      </svg>

      {/* Materializing news lines */}
      <div className="absolute inset-x-0 top-[18%] flex justify-center">
        <div className="w-full max-w-3xl px-8 space-y-2.5" style={{ opacity: t }}>
          {NEWS.map((n, i) => {
            const tt = clamp01((progress - (0.84 + i * 0.018)) / 0.018);
            if (tt <= 0) return null;
            return (
              <div
                key={i}
                className="font-mono-ui text-[10.5px] tracking-[0.22em] text-foreground/80"
                style={{
                  opacity: tt,
                  transform: `translateY(${(1 - tt) * 8}px) translateX(${(1 - tt) * -8}px)`,
                  transition: "transform 300ms ease-out",
                }}
              >
                <span className="text-[color:var(--ember)] mr-3">▸</span>
                <span className="text-foreground/40 mr-3">
                  {String(1700 + i * 17).padStart(4, "0")}Z
                </span>
                {n}
              </div>
            );
          })}
        </div>
      </div>

      {/* Foreshadow label */}
      <div
        className="absolute inset-x-0 bottom-14 flex justify-center"
        style={{ opacity: t }}
      >
        <div className="font-mono-ui text-[10px] tracking-[0.3em] text-foreground/55">
          NEXT · NEWS INTELLIGENCE
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Scene 04 root.
 * Local scene04 progress drives all overlays.
 * ========================================================== */
export function Scene04({
  progress,
  scene04Scroll,
  pointer,
  live,
}: {
  progress: number; // throttled 0..1
  scene04Scroll: React.MutableRefObject<number>; // realtime 0..1
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  live?: LiveWeather;
}) {
  // Visibility ramps in as the section enters and out near the very end
  const visIn = clamp01(progress / 0.04);
  const visOut = clamp01(1 - (progress - 0.96) / 0.04);
  const visibility = visIn * visOut;

  const visibilityRef = useRef(0);
  visibilityRef.current = visibility;

  // Pollution haze tint over Earth — peaks mid-scene
  const pollute = Math.exp(-Math.pow((progress - 0.55) / 0.16, 2));

  if (visibility <= 0.001) return null;

  return (
    <>
      {/* Earth dimmer — emphasizes the air, never removes the planet */}
      <div
        className="pointer-events-none fixed inset-0 z-[22]"
        style={{
          opacity: visibility,
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(10,12,20,0.35) 0%, rgba(8,8,14,0.78) 60%, rgba(4,4,8,0.95) 100%)",
        }}
      />

      {/* Volumetric particle field */}
      <AirField
        progressRef={scene04Scroll}
        pointer={pointer}
        visibilityRef={visibilityRef}
      />

      {/* Atmospheric warm wash during polluted pass */}
      <div
        className="pointer-events-none fixed inset-0 z-[25]"
        style={{
          opacity: pollute * visibility * 0.55,
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(180,120,80,0.18) 0%, rgba(120,80,60,0.12) 40%, transparent 78%)",
          mixBlendMode: "screen",
        }}
      />

      <EmbeddedData progress={progress} live={live} />
      <ForecastTicker progress={progress} />
      <DataNetwork progress={progress} />
    </>
  );
}
