import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHASES = [
  "Initializing Atmospheric Systems",
  "Connecting Forecast Models",
  "Monitoring Global Events",
  "Preparing Intelligence Network",
];

// Total durations (ms) per screen
const SCREENS = [
  900,  // 1 — pure black + single particle
  1100, // 2 — particle moves, ripples
  1400, // 3 — atmospheric currents
  1600, // 4 — earth + clouds
  1800, // 5 — headline
];
const TOTAL = SCREENS.reduce((a, b) => a + b, 0);

export function BootLoader({ onComplete }: { onComplete: () => void }) {
  const [screen, setScreen] = useState(0);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let raf = 0;
    startRef.current = performance.now();
    const tick = (t: number) => {
      const elapsed = t - startRef.current;
      const p = Math.min(1, elapsed / TOTAL);
      setPct(Math.floor(p * 100));
      // determine screen
      let acc = 0;
      for (let i = 0; i < SCREENS.length; i++) {
        acc += SCREENS[i];
        if (elapsed < acc) {
          setScreen(i);
          break;
        }
        if (i === SCREENS.length - 1) setScreen(i);
      }
      if (p >= 1) {
        setDone(true);
        // allow exit fade
        setTimeout(() => onCompleteRef.current?.(), 1100);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const phaseIndex = Math.min(PHASES.length - 1, Math.floor((pct / 100) * PHASES.length));

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] overflow-hidden bg-black"
        >
          {/* Background gradient — atmosphere emerges in screen 3+ */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: screen >= 2 ? 1 : 0 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            style={{
              background:
                "radial-gradient(ellipse at 50% 55%, rgba(40,80,160,0.18) 0%, rgba(10,15,35,0.6) 45%, #000 80%)",
            }}
          />

          {/* Atmospheric currents — flowing arcs (screen 3) */}
          <AnimatePresence>
            {screen >= 2 && (
              <motion.svg
                key="currents"
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="xMidYMid slice"
                initial={{ opacity: 0 }}
                animate={{ opacity: screen >= 3 ? 0.35 : 0.55 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4 }}
              >
                <defs>
                  <linearGradient id="cur" x1="0" x2="1">
                    <stop offset="0%" stopColor="rgba(120,180,255,0)" />
                    <stop offset="50%" stopColor="rgba(170,210,255,0.9)" />
                    <stop offset="100%" stopColor="rgba(120,180,255,0)" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const y = 200 + i * 110;
                  const amp = 80 + i * 10;
                  return (
                    <motion.path
                      key={i}
                      d={`M -100 ${y} Q 250 ${y - amp} 500 ${y} T 1100 ${y}`}
                      stroke="url(#cur)"
                      strokeWidth={1}
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.8 }}
                      transition={{ duration: 2.2, delay: i * 0.12, ease: "easeInOut" }}
                    />
                  );
                })}
              </motion.svg>
            )}
          </AnimatePresence>

          {/* Earth — fades in screen 4 */}
          <AnimatePresence>
            {screen >= 3 && (
              <motion.div
                key="earth"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="relative h-[58vmin] w-[58vmin] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 30%, #2a6ea8 0%, #14406b 35%, #0a2342 65%, #04101e 100%)",
                    boxShadow:
                      "inset -30px -40px 80px rgba(0,0,0,0.7), 0 0 80px rgba(80,140,220,0.35), 0 0 220px rgba(60,120,210,0.25)",
                  }}
                >
                  {/* Cloud systems */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    initial={{ opacity: 0, rotate: 0 }}
                    animate={{ opacity: 0.55, rotate: 25 }}
                    transition={{ opacity: { duration: 1.6, delay: 0.6 }, rotate: { duration: 40, repeat: Infinity, ease: "linear" } }}
                    style={{
                      background:
                        "radial-gradient(ellipse 40% 18% at 30% 35%, rgba(255,255,255,0.6), transparent 60%), radial-gradient(ellipse 30% 12% at 65% 55%, rgba(255,255,255,0.5), transparent 60%), radial-gradient(ellipse 25% 10% at 50% 75%, rgba(255,255,255,0.4), transparent 60%)",
                      mixBlendMode: "screen",
                    }}
                  />
                  {/* Atmospheric rim */}
                  <div
                    className="pointer-events-none absolute -inset-3 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, transparent 62%, rgba(110,170,255,0.35) 70%, transparent 78%)",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Single particle — screen 1+2 motion */}
          <AnimatePresence>
            {screen < 3 && (
              <motion.div
                key="particle"
                className="absolute left-1/2 top-1/2"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  opacity: 1,
                  x: screen >= 1 ? [0, 30, -20, 0] : 0,
                  y: screen >= 1 ? [0, -20, 25, 0] : 0,
                }}
                exit={{ opacity: 0, scale: 4 }}
                transition={{
                  opacity: { duration: 0.9, ease: "easeOut" },
                  x: { duration: 2.4, ease: "easeInOut" },
                  y: { duration: 2.4, ease: "easeInOut" },
                }}
              >
                <div
                  className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                  style={{
                    boxShadow:
                      "0 0 18px 4px rgba(180,210,255,0.85), 0 0 60px 14px rgba(110,168,255,0.45)",
                  }}
                />
                {/* Ripples on screen 2 */}
                {screen >= 1 &&
                  [0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
                      initial={{ width: 8, height: 8, opacity: 0.6 }}
                      animate={{ width: 280, height: 280, opacity: 0 }}
                      transition={{
                        duration: 2.4,
                        delay: i * 0.7,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Headline — screen 5 */}
          <AnimatePresence>
            {screen >= 4 && (
              <motion.div
                key="headline"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1
                  className="font-editorial text-white"
                  style={{ fontSize: "clamp(2.4rem, 7vw, 6rem)", lineHeight: 0.95 }}
                >
                  Your city <span className="italic text-white/80">is alive.</span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle telemetry — bottom-left */}
          <div className="font-mono-ui pointer-events-none absolute bottom-8 left-8 text-[10px] tracking-[0.25em] text-white/40">
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.5 }}
              >
                {PHASES[phaseIndex]}…
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Subtle percentage — bottom-right */}
          <div className="font-mono-ui pointer-events-none absolute bottom-8 right-8 text-[10px] tracking-[0.25em] text-white/35 tabular-nums">
            {String(pct).padStart(3, "0")}
          </div>

          {/* Hairline at bottom — extremely subtle progress trace */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-white/5">
            <div
              className="h-full bg-white/30"
              style={{ width: `${pct}%`, transition: "width 120ms linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
