import { useEffect, useState } from "react";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

import type { LiveWeather } from "@/lib/weather.functions";

type EventKind = "cyclone" | "heat" | "flood" | "wildfire" | "quake";

type AtmosphericEvent = {
  kind: EventKind;
  top: string;
  left: string;
  size: number;
  title: string;
  region: string;
  metric: string;
  delay: number;
};


function EventMarker({
  event,
  reveal,
}: {
  event: AtmosphericEvent;
  reveal: number;
}) {
  const t = clamp01((reveal - event.delay) / 0.22);
  if (t <= 0) return null;

  // Right-side markers anchor labels on the left to avoid going off-screen.
  const leftPct = parseFloat(event.left);
  const labelOnLeft = leftPct > 55;

  return (
    <div
      className="group pointer-events-auto absolute"
      style={{
        top: event.top,
        left: event.left,
        transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * t})`,
        opacity: t * 0.95,
        transition: "opacity 320ms ease, transform 320ms ease",
      }}
    >
      <div
        className="relative"
        style={{ width: event.size, height: event.size }}
      >
        <EventGlyph kind={event.kind} size={event.size} />
      </div>

      <div
        className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap ${
          labelOnLeft ? "right-full mr-5 text-right" : "left-full ml-5 text-left"
        }`}
      >
        <div
          className={`flex items-center gap-3 ${labelOnLeft ? "flex-row-reverse" : ""}`}
        >
          <div className="h-px w-8 bg-foreground/25 transition-all duration-500 group-hover:w-14 group-hover:bg-foreground/60" />
          <div>
            <div className="font-mono-ui text-[9px] tracking-[0.22em] text-foreground/40">
              {event.region}
            </div>
            <div
              className="font-editorial text-xl text-foreground/90 leading-none mt-1.5"
              style={{ textShadow: "0 0 24px rgba(180,210,255,0.18)" }}
            >
              {event.title}
            </div>
            <div className="font-mono-ui mt-2 text-[10px] text-foreground/55">
              {event.metric}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventGlyph({ kind, size }: { kind: EventKind; size: number }) {
  const s = size;
  switch (kind) {
    case "cyclone":
      return (
        <svg
          viewBox="-50 -50 100 100"
          width={s}
          height={s}
          style={{ filter: "drop-shadow(0 0 18px rgba(140,180,255,0.35))" }}
        >
          <defs>
            <radialGradient id="cyc-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="40%" stopColor="rgba(180,210,255,0.4)" />
              <stop offset="100%" stopColor="rgba(120,160,220,0)" />
            </radialGradient>
          </defs>
          <g
            style={{
              transformOrigin: "50% 50%",
              animation: "cycSpin 18s linear infinite",
            }}
          >
            {[0, 90, 180, 270].map((rot, i) => (
              <path
                key={i}
                d="M 0 0 C 6 -6 22 -10 36 -2 C 22 4 8 12 0 28 Z"
                fill="rgba(190,215,255,0.12)"
                stroke="rgba(210,230,255,0.28)"
                strokeWidth="0.4"
                transform={`rotate(${rot})`}
              />
            ))}
          </g>
          <circle r="4" fill="url(#cyc-core)" />
        </svg>
      );
    case "heat":
      return (
        <div className="relative h-full w-full">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,140,80,0.45) 0%, rgba(255,90,40,0.12) 40%, transparent 75%)",
              animation: "heatPulse 4s ease-out infinite",
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute inset-[42%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,200,120,0.85) 0%, rgba(255,120,40,0.3) 60%, transparent 100%)",
              filter: "blur(2px)",
            }}
          />
        </div>
      );
    case "flood":
      return (
        <svg
          viewBox="0 0 100 100"
          width={s}
          height={s}
          style={{ filter: "drop-shadow(0 0 16px rgba(80,160,220,0.35))" }}
        >
          <defs>
            <radialGradient id="flood-g" cx="50%" cy="55%" r="50%">
              <stop offset="0%" stopColor="rgba(120,200,255,0.55)" />
              <stop offset="100%" stopColor="rgba(40,100,180,0)" />
            </radialGradient>
          </defs>
          <ellipse cx="50" cy="55" rx="34" ry="20" fill="url(#flood-g)" />
          <circle cx="50" cy="55" r="3" fill="rgba(200,230,255,0.9)" />
        </svg>
      );
    case "wildfire":
      return (
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,180,80,0.7) 0%, rgba(255,80,30,0.35) 35%, rgba(180,30,10,0.1) 65%, transparent 100%)",
            animation: "firePulse 3s ease-in-out infinite",
            mixBlendMode: "screen",
          }}
        />
      );
    case "quake":
      return (
        <svg viewBox="0 0 100 100" width={s} height={s}>
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="5"
              fill="none"
              stroke="rgba(255,200,120,0.5)"
              strokeWidth="0.7"
              style={{
                animation: `quakeRipple 3.4s ease-out infinite`,
                animationDelay: `${i * 1.1}s`,
                transformOrigin: "50% 50%",
              }}
            />
          ))}
          <circle
            cx="50"
            cy="50"
            r="2.5"
            fill="rgba(255,220,160,0.9)"
            style={{ filter: "drop-shadow(0 0 8px rgba(255,160,60,0.7))" }}
          />
        </svg>
      );
  }
}


function LiveFeed({ visibility, linesData }: { visibility: number; linesData?: string[] }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (visibility <= 0) return;
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, [visibility]);

  const activeLines = linesData && linesData.length > 0 
    ? linesData 
    : ["SCANNING GLOBAL FEEDS..."];

  const lines = Array.from(
    { length: 4 },
    (_, i) => activeLines[(tick + i) % activeLines.length],
  );

  return (
    <div
      className="pointer-events-none fixed right-10 bottom-16 z-30 hidden lg:block"
      style={{ opacity: visibility, transition: "opacity 400ms linear" }}
    >
      <div className="font-mono-ui mb-3 flex items-center gap-3 text-[9px] tracking-[0.28em] text-foreground/40">
        <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--ember)]">
          <span
            className="absolute inset-0 rounded-full bg-[color:var(--ember)]"
            style={{ animation: "feedPing 1.8s ease-out infinite" }}
          />
        </span>
        LIVE EVENT STREAM
      </div>
      <div className="w-[260px] space-y-1.5">
        {lines.map((l, i) => (
          <div
            key={`${tick}-${i}`}
            className="font-mono-ui text-[9.5px] tracking-[0.18em] text-foreground/65"
            style={{
              opacity: 1 - i * 0.22,
              animation: i === 0 ? "feedIn 600ms ease-out" : undefined,
            }}
          >
            <span className="text-foreground/30 mr-2">
              {String(1700 + ((tick * 7 + i * 3) % 99)).padStart(4, "0")}Z
            </span>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Scene03({ progress, live }: { progress: number; live?: LiveWeather }) {
  const t = clamp01(progress);

  const eventsReveal = clamp01((progress - 0.1) / 0.3);
  const head1 = clamp01((progress - 0.14) / 0.1);
  const head2 = clamp01((progress - 0.26) / 0.1);
  const caption = clamp01((progress - 0.42) / 0.12);
  const hazeIn = clamp01((progress - 0.86) / 0.08);

  const fade = 1 - hazeIn;

  return (
    <>
      <style>{`
        @keyframes cycSpin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes heatPulse { 0% { transform: scale(0.7); opacity: 0.85 } 100% { transform: scale(1.5); opacity: 0 } }
        @keyframes firePulse { 0%, 100% { opacity: 0.8; transform: scale(1) } 50% { opacity: 1; transform: scale(1.05) } }
        @keyframes quakeRipple { 0% { r: 5; opacity: 0.75 } 100% { r: 42; opacity: 0 } }
        @keyframes feedPing { 0% { transform: scale(1); opacity: 0.8 } 100% { transform: scale(3); opacity: 0 } }
        @keyframes feedIn { from { opacity: 0; transform: translateX(8px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes hazeDrift { 0%, 100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(-20px,10px,0) } }
        @keyframes ember { 0% { opacity: 0; transform: translateY(0) scale(0.4) } 30% { opacity: 1 } 100% { opacity: 0; transform: translateY(-30px) scale(0.2) } }
      `}</style>

      {/* Event markers — perimeter only, never crossing the headline */}
      <div
        className="pointer-events-none fixed inset-0 z-20 hidden lg:block"
        style={{ opacity: t * fade }}
      >
        <div className="pointer-events-auto absolute inset-0">
          {(live?.disasters || []).map((e, i) => (
            <EventMarker key={i} event={e} reveal={eventsReveal} />
          ))}
        </div>
      </div>

      <LiveFeed visibility={t * fade * 0.95} linesData={live?.news?.map((n) => n.title)} />

      {/* Headline removed: ChapterPanel handles the typography on the left. */}

      <AirHaze opacity={hazeIn} />
    </>
  );
}

function AirHaze({ opacity }: { opacity: number }) {
  if (opacity <= 0) return null;
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[25]"
      style={{ opacity }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(210,180,150,0.05) 0%, rgba(160,130,110,0.1) 40%, rgba(80,70,80,0.15) 80%, rgba(20,18,24,0.4) 100%)",
          animation: "hazeDrift 16s ease-in-out infinite",
        }}
      />
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => {
          const top = (i * 53) % 100;
          const left = (i * 71) % 100;
          const size = 1 + ((i * 13) % 3);
          const dur = 8 + ((i * 7) % 10);
          const delay = ((i * 11) % 12) * 0.4;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: size,
                height: size,
                background:
                  i % 3 === 0
                    ? "rgba(220,200,170,0.6)"
                    : "rgba(160,150,150,0.45)",
                boxShadow: "0 0 6px rgba(220,200,170,0.3)",
                animation: `ember ${dur}s linear infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>
      <div className="absolute inset-x-0 bottom-32 flex justify-center">
        <div className="font-mono-ui text-[10px] tracking-[0.32em] text-foreground/55">
          NEXT · AIR QUALITY INTELLIGENCE
        </div>
      </div>
    </div>
  );
}
