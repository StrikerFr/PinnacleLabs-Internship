import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCitySignalsData, type CitySignal } from "@/lib/weather.functions";
import { motion, AnimatePresence } from "framer-motion";

// Particle types and settings for canvas animation
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
};

const CITY_THEMES: Record<string, {
  color: [number, number, number]; // RGB
  speed: number;
  noise: number;
  glow: string;
}> = {
  DELHI: { color: [180, 140, 90], speed: 0.7, noise: 1.8, glow: "rgba(180,140,90,0.18)" }, // Dusty/Haze amber
  MUMBAI: { color: [34, 211, 238], speed: 1.6, noise: 0.9, glow: "rgba(34,211,238,0.18)" }, // Stormy/Rainy cyan
  BENGALURU: { color: [52, 211, 153], speed: 1.0, noise: 0.7, glow: "rgba(52,211,153,0.12)" }, // Pleasant/Garden green
  CHENNAI: { color: [248, 113, 113], speed: 1.3, noise: 1.2, glow: "rgba(248,113,113,0.18)" }, // Hot/Dry coral red
  HYDERABAD: { color: [192, 132, 252], speed: 0.9, noise: 0.9, glow: "rgba(192,132,252,0.15)" }, // Moderate/Clear purple
  KOLKATA: { color: [156, 163, 175], speed: 1.1, noise: 1.4, glow: "rgba(156,163,175,0.15)" }, // Overcast/Hazy grey
};

function CityCanvas({ activeCity }: { activeCity: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = CITY_THEMES[activeCity] || CITY_THEMES.DELHI;
  const targetColor = useRef<[number, number, number]>(theme.color);
  const currentColor = useRef<[number, number, number]>([...theme.color]);
  const targetSpeed = useRef(theme.speed);
  const currentSpeed = useRef(theme.speed);

  useEffect(() => {
    targetColor.current = theme.color;
    targetSpeed.current = theme.speed;
  }, [activeCity, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: Particle[] = [];
    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.35 + 0.15,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const lerp = (start: number, end: number, amt: number) => {
      return (1 - amt) * start + amt * end;
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.strokeStyle = "rgba(255,255,255,0.015)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      
      // Draw vertical lines
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // Draw horizontal lines
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    };

    const render = () => {
      // Lerp active city theme changes
      currentColor.current[0] = lerp(currentColor.current[0], targetColor.current[0], 0.05);
      currentColor.current[1] = lerp(currentColor.current[1], targetColor.current[1], 0.05);
      currentColor.current[2] = lerp(currentColor.current[2], targetColor.current[2], 0.05);
      currentSpeed.current = lerp(currentSpeed.current, targetSpeed.current, 0.05);

      ctx.fillStyle = "rgba(3, 3, 8, 0.12)"; // Soft trails
      ctx.fillRect(0, 0, width, height);

      // Draw weather grid texture
      drawGrid(ctx, width, height);

      const r = Math.round(currentColor.current[0]);
      const g = Math.round(currentColor.current[1]);
      const b = Math.round(currentColor.current[2]);

      particles.forEach((p) => {
        p.phase += 0.005;
        // Apply wind current vectors
        const windX = Math.sin(p.phase + p.y * 0.003) * 0.45 * currentSpeed.current;
        const windY = Math.cos(p.phase * 0.8 + p.x * 0.002) * 0.15 * currentSpeed.current;

        p.x += p.vx + windX;
        p.y += p.vy + windY;

        // Loop bounds
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [targetColor, targetSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

export function CitySignals() {
  const fetchSignals = useServerFn(getCitySignalsData);
  const [hoveredCity, setHoveredCity] = useState<string>("DELHI");

  const { data: cities, isLoading, error } = useQuery<CitySignal[]>({
    queryKey: ["city-signals"],
    queryFn: () => fetchSignals(),
    staleTime: 3 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const activeTheme = CITY_THEMES[hoveredCity] || CITY_THEMES.DELHI;

  if (error) {
    console.error("Error loading city signals:", error);
  }

  return (
    <section className="relative z-20 w-full bg-[#030308] border-t border-white/5 py-12 md:py-16 overflow-hidden flex flex-col items-center justify-center min-h-[100vh] md:h-[100vh]">
      {/* Background canvas particles and map grid */}
      <CityCanvas activeCity={hoveredCity} />
      
      {/* Soft color wash in the background */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out opacity-25 z-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${activeTheme.glow} 0%, transparent 70%)`
        }}
      />

      <div className="w-full max-w-7xl px-8 sm:px-12 relative z-10 flex flex-col justify-between h-full gap-8 md:gap-10">
        
        {/* Top Area: Header and Live Hud Status */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:hidden">
          <div>
            <div className="font-mono-ui text-[10px] tracking-[0.25em] text-foreground/45 mb-2">
              CHAPTER 08 • CITY SIGNALS
            </div>
            <h2 className="font-neue-montreal font-bold tracking-tighter text-[8vw] leading-[1.05] text-foreground sm:text-[5vw] lg:text-[4vw] max-w-2xl">
              THE CITIES<br />THAT NEVER<br />STOP MOVING.
            </h2>
            <p className="mt-3 font-neue-montreal text-foreground/45 text-xs sm:text-sm max-w-md">
              Live weather, air quality and weather-related intelligence from India&apos;s most active cities.
            </p>
          </div>

          {/* Live Status HUD */}
          <div className="flex flex-col items-start md:items-end text-left md:text-right font-mono-ui text-[8px] tracking-[0.18em] text-foreground/50 border border-white/5 bg-black/40 p-3.5 rounded-xl backdrop-blur-sm shrink-0 h-fit self-start">
            <div className="flex items-center gap-2 mb-1.5 font-bold text-orange-400">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span>● LIVE</span>
            </div>
            <div className="text-foreground/80 font-medium mb-0.5">Weather Updates Every 3 Hours</div>
            <div>Disaster Monitoring Active</div>
          </div>
        </div>

        {/* Center Experience */}
        {isLoading ? (
          <div className="w-full py-16 flex items-center justify-center font-mono-ui text-xs tracking-widest text-foreground/40 gap-3">
            <span className="h-2 w-2 rounded-full bg-foreground/40 animate-ping" />
            SYNCHRONIZING CITY INTELLIGENCE CELLS...
          </div>
        ) : !cities || cities.length === 0 ? (
          <div className="w-full py-16 flex items-center justify-center font-mono-ui text-xs tracking-widest text-red-400/60">
            FAILED TO ESTABLISH CITY INTELLIGENCE CONNECTION
          </div>
        ) : (
          <>
            {/* Desktop Experience (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-12 gap-8 lg:gap-12 items-stretch mt-2 w-full my-auto">
              {/* Left Column: Header + Cities List */}
              <div className="col-span-5 flex flex-col justify-between">
                <div>
                  <div className="font-mono-ui text-[10px] tracking-[0.25em] text-foreground/45 mb-2">
                    CHAPTER 08 • CITY SIGNALS
                  </div>
                  <h2 className="font-neue-montreal font-bold tracking-tighter text-[42px] lg:text-[54px] xl:text-[62px] leading-[1.0] text-white uppercase mb-4">
                    THE CITIES<br />THAT NEVER<br />STOP MOVING.
                  </h2>
                  <p className="font-neue-montreal text-foreground/45 text-sm lg:text-base max-w-lg mb-10 leading-relaxed">
                    Live weather, air quality and weather-related intelligence from India&apos;s most active cities.
                  </p>
                </div>

                <div className="flex flex-col border-t border-white/5 divide-y divide-white/5">
                  {cities.map((city) => {
                    const isHovered = hoveredCity === city.name;
                    const cityColor = CITY_THEMES[city.name]?.color || [255, 255, 255];
                    const rgbString = `rgb(${cityColor[0]}, ${cityColor[1]}, ${cityColor[2]})`;

                    return (
                      <div
                        key={city.name}
                        data-cursor="hover"
                        className="group flex items-center justify-between h-[76px] lg:h-[84px] px-2 cursor-pointer transition-all duration-300 ease-out"
                        onMouseEnter={() => setHoveredCity(city.name)}
                        style={{
                          opacity: isHovered ? 1 : 0.45,
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <span 
                            className="font-mono-ui text-[12px] w-3 transition-all duration-300"
                            style={{ color: isHovered ? rgbString : "transparent" }}
                          >
                            ▸
                          </span>
                          <h3 className="font-neue-montreal font-bold text-3xl lg:text-[34px] xl:text-[38px] text-foreground tracking-tight transition-colors duration-300">
                            {city.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-6 font-mono-ui text-xs">
                          <div 
                            className="font-neue-montreal font-bold text-3xl lg:text-[34px] xl:text-[38px] tracking-tighter w-12 text-right transition-all duration-300"
                            style={{
                              color: isHovered ? rgbString : "white",
                            }}
                          >
                            {Math.round(city.temp)}°
                          </div>
                          <div 
                            className="w-28 text-right uppercase tracking-[0.12em] text-[11px] lg:text-[13px] font-medium transition-colors duration-300"
                            style={{ color: isHovered ? rgbString : "rgba(255,255,255,0.7)" }}
                          >
                            {city.condition}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Live Status HUD + Active City Detail HUD Card */}
              <div className="col-span-7 flex flex-col gap-4">
                {/* Live Status HUD */}
                <div className="flex items-center justify-between font-mono-ui text-[11px] lg:text-[12px] tracking-[0.22em] text-foreground/50 border border-white/5 bg-black/40 px-6 py-3.5 rounded-xl backdrop-blur-sm shrink-0">
                  <div className="flex items-center gap-2.5 font-bold text-orange-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                    <span>● LIVE CELL TRANSMISSION</span>
                  </div>
                  <div className="flex gap-6">
                    <span>UPDATES: EVERY 3H</span>
                    <span>MONITORING: ACTIVE</span>
                  </div>
                </div>

                {/* Active City Detail HUD Card */}
                <div className="flex-1 flex flex-col justify-between bg-gradient-to-br from-white/[0.02] to-white/[0.005] border border-white/5 rounded-2xl p-8 lg:p-10 backdrop-blur-md relative min-h-[500px] lg:min-h-[560px] xl:min-h-[600px] shadow-[0_24px_48px_rgba(0,0,0,0.6)]">
                  {cities.find(c => c.name === hoveredCity) ? (
                    <AnimatePresence mode="wait">
                      {(() => {
                        const activeCityData = cities.find(c => c.name === hoveredCity)!;
                        const activeThemeColor = CITY_THEMES[activeCityData.name]?.color || [255, 255, 255];
                        const rgbString = `rgb(${activeThemeColor[0]}, ${activeThemeColor[1]}, ${activeThemeColor[2]})`;

                        return (
                          <motion.div
                            key={activeCityData.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-col h-full justify-between gap-5"
                          >
                            {/* Active City Header */}
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-baseline gap-4">
                                  <h3 className="font-neue-montreal font-bold text-4xl lg:text-[44px] xl:text-[48px] tracking-tight text-white leading-none">
                                    {activeCityData.name}
                                  </h3>
                                  <span 
                                    className="font-mono-ui text-[11px] lg:text-[13px] tracking-wider uppercase font-semibold"
                                    style={{ color: rgbString }}
                                  >
                                    {activeCityData.condition}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2.5 font-mono-ui text-[11px] lg:text-[13px] text-foreground/45">
                                  <span 
                                    className="h-1.5 w-1.5 rounded-full shrink-0" 
                                    style={{ 
                                      backgroundColor: activeCityData.aqi > 100 ? "rgb(251, 146, 60)" : "rgb(74, 222, 128)",
                                      boxShadow: activeCityData.aqi > 100 ? "0 0 8px rgb(251, 146, 60)" : "0 0 8px rgb(74, 222, 128)"
                                    }}
                                  />
                                  <span>AIR QUALITY: AQI {activeCityData.aqi} ({activeCityData.aqi > 100 ? "POOR" : "GOOD"})</span>
                                </div>
                              </div>

                              <div 
                                className="font-neue-montreal font-bold text-6xl lg:text-7xl xl:text-8xl tracking-tighter leading-none"
                                style={{ color: rgbString }}
                              >
                                {Math.round(activeCityData.temp)}°
                              </div>
                            </div>

                            {/* Info and News content split */}
                            <div className="grid grid-cols-12 gap-8 items-start">
                              {/* Metrics Grid */}
                              <div className="col-span-4 flex flex-col gap-4 border-r border-white/5 pr-4">
                                <div className="font-mono-ui text-[11px] tracking-[0.2em] text-foreground/30 font-semibold">CITY METRICS</div>
                                <div className="flex flex-col gap-3 font-mono-ui text-[12px] lg:text-[13px] tracking-wider text-foreground/75">
                                  <div className="flex justify-between">
                                    <span>FEELS LIKE</span>
                                    <span className="text-white font-bold">{Math.round(activeCityData.feelsLike)}°C</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>HUMIDITY</span>
                                    <span className="text-white font-bold">{activeCityData.humidity}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>WIND SPEED</span>
                                    <span className="text-white font-bold">{Math.round(activeCityData.windSpeed)} km/h</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>RAIN PROB</span>
                                    <span className="text-white font-bold">{activeCityData.rainProb}%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Live News Stream */}
                              <div className="col-span-8 flex flex-col gap-4 pl-2">
                                <div className="font-mono-ui text-[11px] tracking-[0.2em] text-foreground/30 font-semibold">LIVE WEATHER INTELLIGENCE STREAM</div>
                                <div className="space-y-4">
                                  {activeCityData.news.map((item, index) => (
                                    <div key={index} className="flex gap-4 items-center py-2 border-b border-white/5 last:border-none">
                                      {item.imageUrl && (
                                        <a href={item.url} target="_blank" rel="noreferrer" className="w-[64px] h-[64px] rounded-xl overflow-hidden shrink-0 bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                                          <img 
                                            src={item.imageUrl} 
                                            alt="" 
                                            className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity duration-300"
                                          />
                                        </a>
                                      )}
                                      <div className="flex flex-col gap-1 w-full min-w-0">
                                        <a 
                                          href={item.url} 
                                          target="_blank" 
                                          rel="noreferrer"
                                          className="font-neue-montreal font-semibold text-[14px] lg:text-[15px] xl:text-[16px] leading-snug text-foreground/90 hover:text-white transition-colors duration-200 block text-left truncate"
                                          title={item.title}
                                        >
                                          {item.title}
                                        </a>
                                        <div className="flex items-center gap-1.5 font-mono-ui text-[9px] lg:text-[10px] tracking-widest text-foreground/40">
                                          <span>SOURCE:</span>
                                          <a 
                                            href={item.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="text-orange-400/80 hover:text-orange-400 hover:underline transition-colors duration-200 uppercase font-semibold"
                                          >
                                            {item.source} ↗
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* AI Assessment at Bottom */}
                            <div className="pt-4 border-t border-white/5">
                              <div className="font-mono-ui text-[11px] tracking-[0.2em] text-foreground/30 mb-1.5 font-semibold">AI ANOMALY ASSESSMENT</div>
                              <p className="font-neue-montreal text-[13px] lg:text-[14px] leading-relaxed text-foreground/85 italic">
                                &ldquo;{activeCityData.insight}&rdquo;
                              </p>
                            </div>

                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  ) : (
                    <div className="flex items-center justify-center h-full font-mono-ui text-xs text-foreground/40">
                      SELECT A CITY FOR LIVE INTEL
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Experience (Swipeable Cards) */}
            <div className="md:hidden flex w-full overflow-x-auto snap-x snap-mandatory gap-6 scrollbar-hide py-4">
              {cities.map((city) => {
                const cityColor = CITY_THEMES[city.name]?.color || [255, 255, 255];
                const rgbString = `rgb(${cityColor[0]}, ${cityColor[1]}, ${cityColor[2]})`;

                return (
                  <div
                    key={city.name}
                    className="w-[85vw] shrink-0 snap-center border border-white/5 bg-black/60 p-6 rounded-2xl flex flex-col gap-6 backdrop-blur-md"
                  >
                    {/* City info */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-neue-montreal font-bold text-2xl tracking-tight text-white">
                          {city.name}
                        </h3>
                        <span 
                          className="font-mono-ui text-[10px] tracking-wider uppercase font-semibold mt-1 inline-block"
                          style={{ color: rgbString }}
                        >
                          {city.condition}
                        </span>
                      </div>
                      <div 
                        className="font-neue-montreal font-bold text-4xl tracking-tighter"
                        style={{ color: rgbString }}
                      >
                        {Math.round(city.temp)}°
                      </div>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4 font-mono-ui text-[10px] tracking-wide text-foreground/60">
                      <div>
                        <div>FEELS LIKE</div>
                        <div className="text-white font-bold mt-0.5">{Math.round(city.feelsLike)}°C</div>
                      </div>
                      <div>
                        <div>HUMIDITY</div>
                        <div className="text-white font-bold mt-0.5">{city.humidity}%</div>
                      </div>
                      <div>
                        <div>WIND SPEED</div>
                        <div className="text-white font-bold mt-0.5">{Math.round(city.windSpeed)} km/h</div>
                      </div>
                      <div>
                        <div>AIR QUALITY</div>
                        <div className="font-bold mt-0.5" style={{ color: city.aqi > 100 ? "rgb(251, 146, 60)" : "rgb(74, 222, 128)" }}>AQI {city.aqi}</div>
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div className="flex flex-col gap-2">
                      <div className="font-mono-ui text-[8.5px] tracking-[0.2em] text-foreground/30">AI INSIGHT</div>
                      <p className="font-neue-montreal text-[11.5px] leading-relaxed text-foreground/80 italic">
                        &ldquo;{city.insight}&rdquo;
                      </p>
                    </div>

                    {/* News Stream */}
                    <div className="flex flex-col gap-3">
                      <div className="font-mono-ui text-[8.5px] tracking-[0.2em] text-foreground/30">LIVE WEATHER NEWS</div>
                      <div className="flex flex-col gap-3">
                        {city.news.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-start py-1 border-b border-white/5 last:border-none text-left">
                            {item.imageUrl && (
                              <a href={item.url} target="_blank" rel="noreferrer" className="w-[40px] h-[40px] rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/10">
                                <img 
                                  src={item.imageUrl} 
                                  alt="" 
                                  className="w-full h-full object-cover opacity-80"
                                />
                              </a>
                            )}
                            <div className="flex flex-col gap-0.5 w-full min-w-0">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block font-neue-montreal text-[12px] leading-snug text-foreground/85 active:text-white"
                              >
                                {item.title}
                              </a>
                              <div className="flex items-center gap-1.5 font-mono-ui text-[7.5px] tracking-widest text-foreground/45 mt-0.5">
                                <span>SOURCE:</span>
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-orange-400 hover:underline transition-colors font-semibold"
                                >
                                  {item.source} ↗
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
