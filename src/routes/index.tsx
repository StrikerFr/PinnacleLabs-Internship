import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AtmosphereScene } from "@/components/sections/atmosphere/Scene";
import { Scene03 } from "@/components/sections/scene03/Scene03";
import { Scene04 } from "@/components/sections/scene04/Scene04";
import { Scene05 } from "@/components/sections/scene05/Scene05";
import { Scene06 } from "@/components/sections/scene06/Scene06";
import { Scene07 } from "@/components/sections/scene07/Scene07";
import { Scene08 } from "@/components/sections/scene08/Scene08";
import { CitySignals } from "@/components/sections/city-signals/CitySignals";
import { Nav } from "@/components/shared/nav/Nav";
import { AtmosphericCursor } from "@/components/shared/cursor/AtmosphericCursor";
import { BootLoader } from "@/components/shared/loader/BootLoader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLiveWeather, type LiveWeather } from "@/hooks/useLiveWeather";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WeatherWatch AI | Real-Time Weather Intelligence Platform" },
      {
        name: "description",
        content:
          "Experience weather like never before. Monitor forecasts, air quality, disaster alerts, environmental intelligence and AI-powered predictions through an immersive planetary interface.",
      },
      {
        name: "keywords",
        content:
          "Weather Intelligence, Weather Monitoring, Disaster Alerts, Air Quality Tracking, Environmental Monitoring, Weather Forecasting, Planetary Intelligence, AI Weather Assistant",
      },
      { property: "og:title", content: "WeatherWatch AI" },
      {
        property: "og:description",
        content:
          "A cinematic real-time weather intelligence platform combining weather forecasting, environmental monitoring, disaster tracking and AI-powered insights.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://weatherwatch-ai.vercel.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "WeatherWatch AI" },
      {
        name: "twitter:description",
        content:
          "A cinematic real-time weather intelligence platform combining weather forecasting, environmental monitoring, disaster tracking and AI-powered insights.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://weatherwatch-ai.vercel.app/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "WeatherWatch AI",
              url: "https://weatherwatch-ai.vercel.app/",
            },
            {
              "@type": "WebApplication",
              name: "WeatherWatch AI",
              url: "https://weatherwatch-ai.vercel.app/",
              applicationCategory: "WeatherApplication",
              operatingSystem: "Web",
              description:
                "Cinematic real-time weather intelligence platform with forecasts, air quality, disaster alerts and AI-powered insights.",
            },
            {
              "@type": "SoftwareApplication",
              name: "WeatherWatch AI",
              applicationCategory: "WeatherApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  const [ready, setReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { data: live } = useLiveWeather();

  const [progress, setProgress] = useState(0);
  const [scene03Progress, setScene03Progress] = useState(0);
  const scene03Ref = useRef<HTMLDivElement>(null);
  const scene03Scroll = useRef(0);
  const [scene04Progress, setScene04Progress] = useState(0);
  const scene04Ref = useRef<HTMLDivElement>(null);
  const scene04Scroll = useRef(0);
  const [scene05Progress, setScene05Progress] = useState(0);
  const scene05Ref = useRef<HTMLDivElement>(null);
  const scene05Scroll = useRef(0);
  const [scene06Progress, setScene06Progress] = useState(0);
  const scene06Ref = useRef<HTMLDivElement>(null);
  const scene06Scroll = useRef(0);
  const [scene07Progress, setScene07Progress] = useState(0);
  const scene07Ref = useRef<HTMLDivElement>(null);
  const scene07Scroll = useRef(0);
  const [scene08Progress, setScene08Progress] = useState(0);
  const scene08Ref = useRef<HTMLDivElement>(null);
  const scene08Scroll = useRef(0);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let raf = 0;
    let lastTick = 0;
    const onScroll = () => {
      const scene03Top = scene03Ref.current
        ? scene03Ref.current.getBoundingClientRect().top + window.scrollY
        : document.documentElement.scrollHeight;
      const introEndY = Math.max(1, scene03Top - window.innerHeight);
      scroll.current = Math.min(1, Math.max(0, window.scrollY / introEndY));

      const sec3 = scene03Ref.current;
      if (sec3) {
        const r = sec3.getBoundingClientRect();
        const vh = window.innerHeight;
        const docTop = r.top + window.scrollY;
        const docBottom = docTop + r.height;
        const startY = Math.max(0, docTop - vh);
        const endY = Math.max(startY + 1, docBottom - vh);
        scene03Scroll.current = Math.min(
          1,
          Math.max(0, (window.scrollY - startY) / (endY - startY)),
        );
      }

      const sec = scene04Ref.current;
      if (sec) {
        const r = sec.getBoundingClientRect();
        const vh = window.innerHeight;
        const docTop = r.top + window.scrollY;
        const docBottom = docTop + r.height;
        const startY = Math.max(0, docTop - vh);
        const endY = Math.max(startY + 1, docBottom - vh);
        scene04Scroll.current = Math.min(
          1,
          Math.max(0, (window.scrollY - startY) / (endY - startY)),
        );
      }

      const sec5 = scene05Ref.current;
      if (sec5) {
        const r = sec5.getBoundingClientRect();
        const vh = window.innerHeight;
        const docTop = r.top + window.scrollY;
        const docBottom = docTop + r.height;
        const startY = Math.max(0, docTop - vh);
        const endY = Math.max(startY + 1, docBottom - vh);
        scene05Scroll.current = Math.min(
          1,
          Math.max(0, (window.scrollY - startY) / (endY - startY)),
        );
      }

      const sec6 = scene06Ref.current;
      if (sec6) {
        const r = sec6.getBoundingClientRect();
        const vh = window.innerHeight;
        const docTop = r.top + window.scrollY;
        const docBottom = docTop + r.height;
        const startY = Math.max(0, docTop - vh);
        const endY = Math.max(startY + 1, docBottom - vh);
        scene06Scroll.current = Math.min(
          1,
          Math.max(0, (window.scrollY - startY) / (endY - startY)),
        );
      }

      const sec7 = scene07Ref.current;
      if (sec7) {
        const r = sec7.getBoundingClientRect();
        const vh = window.innerHeight;
        const docTop = r.top + window.scrollY;
        const docBottom = docTop + r.height;
        const startY = Math.max(0, docTop - vh);
        const endY = Math.max(startY + 1, docBottom - vh);
        scene07Scroll.current = Math.min(
          1,
          Math.max(0, (window.scrollY - startY) / (endY - startY)),
        );
      }

      const sec8 = scene08Ref.current;
      if (sec8) {
        const r = sec8.getBoundingClientRect();
        const vh = window.innerHeight;
        const docTop = r.top + window.scrollY;
        const docBottom = docTop + r.height;
        const startY = Math.max(0, docTop - vh);
        const endY = Math.max(startY + 1, docBottom - vh);
        scene08Scroll.current = Math.min(
          1,
          Math.max(0, (window.scrollY - startY) / (endY - startY)),
        );
      }
    };
    const loop = (time: number) => {
      onScroll();
      if (time - lastTick > 50) {
        lastTick = time;
        setProgress(scroll.current);
        setScene03Progress(scene03Scroll.current);
        setScene04Progress(scene04Scroll.current);
        setScene05Progress(scene05Scroll.current);
        setScene06Progress(scene06Scroll.current);
        setScene07Progress(scene07Scroll.current);
        setScene08Progress(scene08Scroll.current);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, []);

  const isMobile = useIsMobile();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.current.x = x;
      pointer.current.y = y;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const x = (t.clientX / window.innerWidth) * 2 - 1;
      const y = -((t.clientY / window.innerHeight) * 2 - 1);
      pointer.current.x = x;
      pointer.current.y = y;
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      // gamma: left-right [-90,90], beta: front-back [-180,180]
      const g = (e.gamma ?? 0) / 45;
      const b = ((e.beta ?? 0) - 45) / 45;
      pointer.current.x = Math.max(-1, Math.min(1, g));
      pointer.current.y = Math.max(-1, Math.min(1, -b));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  return (
    <div className="relative bg-background text-foreground">
      <AtmosphericCursor />
      {/* Fixed cinematic stage */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{ 
            opacity: ready ? Math.max(0, Math.min(1, 1 - (progress - 0.68) / 0.28)) : 0,
            transition: "opacity 500ms ease-out"
          }}
        >
          <AtmosphereScene pointer={pointer} scroll={scroll} isMobile={isMobile} />
        </div>
        {/* Vignette / boot blackout */}
        <div
          className="pointer-events-none absolute inset-0 bg-background transition-opacity duration-[1800ms]"
          style={{ opacity: revealed ? 0 : 1 }}
        />
        {/* Subtle volumetric fog wash */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(3,3,8,0.55) 70%, rgba(3,3,8,0.95) 100%)",
          }}
        />
      </div>

      {/* Single particle reveal */}
      <div
        className="pointer-events-none fixed inset-0 z-10 flex items-center justify-center"
        style={{
          opacity: revealed ? 0 : 1,
          transition: "opacity 900ms ease-out",
        }}
      >
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: "white",
            boxShadow:
              "0 0 24px 6px rgba(170,200,255,0.7), 0 0 80px 20px rgba(110,168,255,0.35)",
          }}
        />
      </div>

      {/* Invisible-by-default planetary navigation */}
      <Nav />

      {/* Hero */}
      <section className="relative z-20 flex min-h-[100svh] items-center px-8 sm:px-12">
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 12 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono-ui mb-10 text-[10px] text-foreground/55"
          >
            <span className="inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-[color:var(--ember)] mr-3 align-middle" />
            {live
              ? `Atmospheric intake · ${live.location.name}${live.location.country ? `, ${live.location.country}` : ""}`
              : "Atmospheric intake · locating…"}
          </motion.div>

          <h1 className="font-editorial text-foreground">
            <Line delay={0.4} revealed={revealed} className="text-[14vw] sm:text-[10vw] lg:text-[8.2vw]">
              Your city
            </Line>
            <Line delay={0.7} revealed={revealed} className="text-[14vw] sm:text-[10vw] lg:text-[8.2vw] italic text-foreground/85">
              is alive.
            </Line>

            <div className="mt-10 max-w-[58ch] space-y-2">
              <Line delay={1.0} revealed={revealed} className="text-[5.6vw] sm:text-[3vw] lg:text-[2.3vw] text-foreground/75">
                Every cloud.
              </Line>
              <Line delay={1.15} revealed={revealed} className="text-[5.6vw] sm:text-[3vw] lg:text-[2.3vw] text-foreground/55">
                Every storm.
              </Line>
              <Line delay={1.3} revealed={revealed} className="text-[5.6vw] sm:text-[3vw] lg:text-[2.3vw] text-foreground/40">
                Every warning.
              </Line>
            </div>

            <Line delay={1.6} revealed={revealed} className="mt-12 text-[7vw] sm:text-[4.2vw] lg:text-[3.4vw] text-foreground/90">
              In one place.
            </Line>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 10 }}
            transition={{ duration: 1, delay: 1.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 max-w-md text-sm leading-relaxed text-foreground/55"
          >
            {live?.ai.headline ??
              "Real-time weather intelligence powered by forecasts, disaster monitoring, air quality analysis and AI."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ duration: 1, delay: 2.2 }}
            className="mt-12"
          >
            <EnterCta />
          </motion.div>
        </div>
      </section>

      {/* Floating instrumentation around the planet */}
      <Instrumentation revealed={revealed} progress={progress} live={live} />

      {/* Holographic atmospheric readings — fade in as user descends */}
      <Holographics progress={progress} live={live} />

      {/* Jet stream overlay — appears in deeper descent */}
      <JetStreams progress={progress} />

      {/* Scene 02 — descent into your city */}
      <section className="relative z-20 flex min-h-[180svh] items-center px-8 sm:px-12">
        <div className="sticky top-0 flex min-h-[100svh] w-full max-w-7xl items-center">
          <div>
            <div className="font-mono-ui mb-8 flex items-center gap-3 text-[10px] text-foreground/45">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--ember)]" />
              Chapter 02 · 38.7 km altitude
            </div>
            <h2 className="font-editorial text-foreground">
              <div className="text-[10vw] sm:text-[6.2vw] lg:text-[5.2vw]">
                This is what your city
              </div>
              <div className="text-[10vw] sm:text-[6.2vw] lg:text-[5.2vw] italic text-foreground/85">
                feels like right now.
              </div>
            </h2>

            <motion.p
              className="mt-10 max-w-md text-sm leading-relaxed text-foreground/55"
            >
              {live?.ai.summary ??
                "Tuning into your atmosphere — fetching live conditions, air quality and AI-generated insight."}
            </motion.p>
          </div>
        </div>
      </section>

      <div ref={scene03Ref} className="relative z-[80] w-full">
        <CitySignals />
      </div>

      {/* Threshold into Scene 03 — atmosphere envelops the viewport */}
      <section className="relative z-20 flex min-h-[110svh] items-end px-8 pb-32 sm:px-12">
        <div className="font-mono-ui flex w-full max-w-7xl items-center justify-between text-[10px] text-foreground/40">
          <span>ENTERING TROPOSPHERE</span>
          <span>{Math.round(progress * 100)}% DESCENT</span>
          <span>NEXT · DISASTER INTELLIGENCE</span>
        </div>
      </section>      {/* Scene 03 — Disasters overlay */}
      <Scene03 progress={scene03Progress} live={live} />

      {/* Scene 04 — You breathe this (Air Quality Field) */}
      <Scene04
        progress={scene04Progress}
        scene04Scroll={scene04Scroll}
        pointer={pointer}
        live={live}
      />
      <div
        ref={scene04Ref}
        aria-label="Scene 04 scroll runway"
        className="relative z-[80] min-h-[180svh] px-8 sm:px-12"
      >
        <ChapterPanel
          eyebrow="Chapter 04 · You breathe this"
          title="You don't just live in the atmosphere. You breathe it."
          body="Every breath carries the city with it. Monitor fine PM2.5, dust, pollen, and moisture particles as you move through dynamic environmental fields."
        />
      </div>

      {/* Scene 05 — Signal intelligence */}
      <Scene05
        progress={scene05Progress}
        scene05Scroll={scene05Scroll}
        pointer={pointer}
      />
      <div
        ref={scene05Ref}
        aria-label="Scene 05 scroll runway"
        className="relative z-[80] min-h-[180svh] px-8 sm:px-12"
      >
        <ChapterPanel
          eyebrow="Chapter 05 · Signal Intelligence"
          title="Every weather event leaves a signal."
          body="Observe how live weather data patterns stream across global networks, lighting up infrastructure, transportation, and safety rails."
        />
      </div>

      {/* Scene 06 — Predictive intelligence */}
      <Scene06
        progress={scene06Progress}
        scene06Scroll={scene06Scroll}
        pointer={pointer}
      />
      <div
        ref={scene06Ref}
        aria-label="Scene 06 scroll runway"
        className="relative z-[80] min-h-[180svh] px-8 sm:px-12"
      >
        <ChapterPanel
          eyebrow="Chapter 06 · Predictive Intelligence"
          title="The atmosphere is always writing the future."
          body="Diverging and converging probability graphs simulate forecasts, projecting storm cells, wind currents, and weather cells hours ahead."
        />
      </div>      {/* Scene 07 — WeatherWatch AI · the intelligence */}
      <Scene07
        progress={scene07Progress}
        scene07Scroll={scene07Scroll}
        pointer={pointer}
        live={live}
      />
      <div
        ref={scene07Ref}
        aria-label="Scene 07 scroll runway"
        className="relative z-[80] min-h-[180svh] px-8 sm:px-12"
      >
        <ChapterPanel eyebrow="Chapter 07 · WeatherWatch AI" title="Understanding the planet requires more than data." body="Ask the system and it translates changing weather into clear decisions." />
      </div>

      {/* Scene 08 — the living planet returns · journey close */}
      <Scene08
        progress={scene08Progress}
        scene08Scroll={scene08Scroll}
        pointer={pointer}
      />
      <div
        ref={scene08Ref}
        aria-label="Scene 08 scroll runway"
        className="pointer-events-none relative z-[80] min-h-[180svh] px-8 sm:px-12"
      >
        <ChapterPanel 
          eyebrow="Chapter 08 · Living System" 
          title="The planet never stops changing. Neither do we." 
          body="WeatherWatch AI keeps watching as conditions move, intensify and resolve." 
          progress={scene08Progress}
        />
      </div>

      <BootLoader onComplete={() => {
        setReady(true);
        setRevealed(true);
      }} />

    </div>
  );
}

function ChapterPanel({
  eyebrow,
  title,
  body,
  progress,
}: {
  eyebrow: string;
  title: string;
  body: string;
  progress?: number;
}) {
  const opacity = progress !== undefined ? Math.max(0, Math.min(1, 1 - (progress - 0.72) / 0.12)) : 1;
  return (
    <div 
      className="sticky top-0 flex min-h-[100svh] w-full max-w-7xl items-center transition-opacity duration-150"
      style={{ opacity }}
    >
      <div className="max-w-4xl">
        <div className="font-mono-ui mb-8 flex items-center gap-3 text-[10px] text-foreground/55">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--ember)]" />
          {eyebrow}
        </div>
        <h2 className="font-neue-montreal font-bold tracking-tight text-[10vw] leading-[1.1] text-foreground drop-shadow-[0_0_32px_rgba(0,0,0,0.75)] sm:text-[6.2vw] lg:text-[5vw]">
          {title}
        </h2>
        <p className="mt-10 max-w-xl text-sm leading-relaxed text-foreground/65 drop-shadow-[0_0_18px_rgba(0,0,0,0.9)]">
          {body}
        </p>
      </div>
    </div>
  );
}

function Line({
  children,
  delay,
  revealed,
  className,
}: {
  children: React.ReactNode;
  delay: number;
  revealed: boolean;
  className?: string;
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "110%" }}
        animate={{ y: revealed ? "0%" : "110%" }}
        transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

function EnterCta() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className="group inline-flex cursor-pointer items-center gap-6"
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.15;
        const y = (e.clientY - r.top - r.height / 2) * 0.15;
        el.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "translate(0,0)";
      }}
      style={{ transition: "transform 600ms cubic-bezier(.22,1,.36,1)" }}
    >
      <div className="font-mono-ui text-[11px] text-foreground/85 transition-colors group-hover:text-foreground">
        Enter the atmosphere
      </div>
      <div className="relative h-px w-24 bg-[color:var(--hairline)]">
        <div className="absolute inset-y-0 left-0 w-0 bg-foreground transition-all duration-700 group-hover:w-full" />
      </div>
      <div className="font-mono-ui text-[11px] text-foreground/60 transition-transform duration-500 group-hover:translate-x-2">
        →
      </div>
    </div>
  );
}

function Instrumentation({ revealed, progress, live }: { revealed: boolean; progress: number; live?: LiveWeather }) {
  const c = live?.current;
  const items = [
    { label: "LOCAL PRESSURE", value: c ? `${c.pressureHpa} hPa` : "987 hPa" },
    { label: "WIND SPEED", value: c ? `${c.windKmh} km/h` : "182 km/h" },
    { label: "CLOUD COVER", value: c ? `${c.cloudCover}%` : "62%" },
    { label: "PRECIP PROB", value: c ? `${c.rainProb}%` : "14%" },
    { label: "VISIBILITY", value: c ? `${c.visibilityKm} km` : "10 km" },
  ] as const;
  
  // Dissolve as the descent begins
  const fade = Math.max(0, Math.min(1, 1 - (progress - 0.12) / 0.12));
  
  return (
    <>
      {/* Top Right: Instrumentation HUD */}
      <div
        className="pointer-events-none fixed top-[18%] right-8 lg:right-16 z-20 hidden lg:flex flex-col gap-8 items-end"
        style={{ opacity: fade, transition: "opacity 240ms linear" }}
      >
        {items.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: revealed ? 1 : 0, x: revealed ? 0 : 20 }}
            transition={{ duration: 1.2, delay: 2.0 + i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="h-px w-8 bg-foreground/20" />
            <div className="text-right">
              <div className="font-mono-ui text-[9px] text-foreground/45 tracking-widest">
                {it.label}
              </div>
              <div className="font-mono-ui text-[11px] text-foreground/85 mt-0.5">
                {it.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Right: Live Feed Panel */}
      <div
        className="pointer-events-none fixed bottom-12 right-8 lg:right-16 z-30 hidden lg:flex flex-col items-end w-[360px]"
        style={{ opacity: fade, transition: "opacity 240ms linear" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 15 }}
          transition={{ duration: 1.2, delay: 2.4 }}
          className="w-full pointer-events-auto"
        >
          <div className="flex items-center justify-end gap-2 mb-4">
            <div className="font-mono-ui text-[10px] tracking-[0.2em] text-cyan-400/80 font-bold uppercase">LIVE FEED</div>
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
          
          <div className="space-y-3 flex flex-col items-end">
            {(live?.news || []).slice(0, 3).map((newsItem, i) => (
              <a 
                key={`news-${i}`} 
                href={newsItem.url} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-4 p-3 rounded-2xl bg-[#090e14]/70 border border-white/5 hover:bg-[#0f1722]/90 hover:border-white/10 transition-all group backdrop-blur-md w-full text-left"
              >
                <div className="w-[52px] h-[52px] rounded-xl overflow-hidden shrink-0 bg-white/5">
                  <img 
                    src={newsItem.imageUrl} 
                    alt="" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
                  />
                </div>
                <div className="flex flex-col gap-1 w-full overflow-hidden">
                  <div className="text-[9px] font-mono-ui tracking-[0.15em] text-cyan-400 font-bold uppercase">
                    {newsItem.category}
                  </div>
                  <div className="text-[12px] font-semibold text-foreground/90 leading-tight group-hover:text-white transition-colors line-clamp-2 pr-1">
                    {newsItem.title}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function ProgressLine({
  children,
  progress,
  from,
  to,
  className,
}: {
  children: React.ReactNode;
  progress: number;
  from: number;
  to: number;
  className?: string;
}) {
  const t = clamp01((progress - from) / (to - from));
  return (
    <div className="overflow-hidden pb-[0.18em]">
      <div
        className={className}
        style={{
          transform: `translateY(${(1 - t) * 110}%)`,
          transition: "transform 200ms linear",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Holographics({ progress, live }: { progress: number; live?: LiveWeather }) {
  // Each reading has its own scroll window so they emerge sequentially
  // from inside the atmosphere as the user descends.
  const c = live?.current;
  const a = live?.air;
  const fmt = (n: number | undefined, d = 0) =>
    n === undefined || Number.isNaN(n) ? "—" : n.toFixed(d);
  const dirCardinal = (deg?: number) => {
    if (deg === undefined) return "";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
  };
  const readings = [
    { top: "14%", right: "8%",  big: `${fmt(c?.temperatureC)}°`, tag: "SURFACE TEMP", sub: `FEELS ${fmt(c?.feelsLikeC)}°`, from: 0.18, to: 0.30 },
    { top: "28%", right: "22%", big: `${fmt(c?.humidity)}%`,    tag: "HUMIDITY",      sub: c ? `CLOUD ${fmt(c.cloudCover)}%` : "—", from: 0.22, to: 0.34 },
    { top: "44%", right: "6%",  big: fmt(c?.windKmh),           tag: `WIND · ${dirCardinal(c?.windDir)} km/h`, sub: live?.ai?.travel ? "TRAVEL UPDATED" : (c?.isDay ? "DAY" : "NIGHT"), from: 0.28, to: 0.40 },
    { top: "60%", right: "20%", big: fmt(a?.aqi),               tag: "AIR QUALITY",   sub: (a?.label ?? "").toUpperCase(), from: 0.34, to: 0.46 },
    { top: "74%", right: "8%",  big: fmt(c?.uvIndex, 1),        tag: "UV INDEX",      sub: live?.ai?.health ? "HEALTH UPDATED" : ((c?.uvIndex ?? 0) >= 6 ? "HIGH" : (c?.uvIndex ?? 0) >= 3 ? "MODERATE" : "LOW"), from: 0.40, to: 0.52 },
    { top: "18%", left: "6%",   big: `${fmt(c?.rainProb)}%`,    tag: "RAIN PROB",     sub: c ? `VIS ${fmt(c.visibilityKm, 1)} km` : "—", from: 0.46, to: 0.58 },
    { bottom: "8%", left: "44%", big: fmt(c?.pressureHpa),      tag: "PRESSURE hPa",  sub: a ? `PM2.5 ${fmt(a.pm25, 1)}` : "—", from: 0.52, to: 0.64 },
  ] as const;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 hidden lg:block">
      {readings.map((r, i) => {
        const t = clamp01((progress - r.from) / (r.to - r.from));
        const fadeOut = clamp01(1 - (progress - 0.78) / 0.12); // dissolve before scene 03
        const opacity = t * fadeOut;
        return (
          <div
            key={i}
            className="absolute"
            style={{
              top: (r as any).top,
              left: (r as any).left,
              right: (r as any).right,
              bottom: (r as any).bottom,
              opacity,
              transform: `translateY(${(1 - t) * 18}px)`,
              transition: "opacity 240ms linear, transform 240ms linear",
            }}
          >
            <div className="flex items-end gap-3">
              {/* Hairline tick + connector */}
              <div className="flex flex-col items-center pb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground/70 shadow-[0_0_12px_rgba(180,210,255,0.7)]" />
                <div className="mt-1 h-8 w-px bg-gradient-to-b from-foreground/40 to-transparent" />
              </div>
              <div>
                <div className="font-mono-ui text-[9px] tracking-[0.22em] text-foreground/45">
                  {r.tag}
                </div>
                <div
                  className="font-editorial text-5xl text-foreground/95 sm:text-6xl"
                  style={{ textShadow: "0 0 24px rgba(180,210,255,0.25)" }}
                >
                  {r.big}
                </div>
                <div className="font-mono-ui mt-1 text-[9px] tracking-[0.22em] text-foreground/40">
                  {r.sub}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function JetStreams({ progress }: { progress: number }) {
  const opacity = clamp01((progress - 0.2) / 0.18) * clamp01(1 - (progress - 0.78) / 0.12);
  return (
    <svg
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
      style={{ opacity }}
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="jet" x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(180,210,255,0)" />
          <stop offset="50%" stopColor="rgba(180,210,255,0.55)" />
          <stop offset="100%" stopColor="rgba(180,210,255,0)" />
        </linearGradient>
      </defs>
      {[
        "M -50 340 C 300 260, 700 460, 1500 300",
        "M -50 520 C 360 600, 820 380, 1500 520",
        "M -50 220 C 380 140, 760 320, 1500 180",
        "M -50 700 C 400 760, 880 620, 1500 720",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="url(#jet)"
          strokeWidth={1}
          fill="none"
          strokeDasharray="4 14"
          style={{
            animation: `jetDrift ${22 + i * 5}s linear infinite`,
            animationDelay: `${-i * 3}s`,
          }}
        />
      ))}
      <style>{`@keyframes jetDrift { from { stroke-dashoffset: 0 } to { stroke-dashoffset: -800 } }`}</style>
    </svg>
  );
}
