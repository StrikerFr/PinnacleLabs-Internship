import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MENU_ITEMS = [
  { label: "Atmosphere", caption: "the living envelope" },
  { label: "Weather", caption: "real-time conditions" },
  { label: "Events", caption: "storms · disasters · alerts" },
  { label: "Air Quality", caption: "what you're breathing" },
  { label: "Intelligence", caption: "models · signals · data" },
  { label: "Predictions", caption: "the next 72 hours" },
  { label: "AI Core", caption: "the mind of the system" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [opacity, setOpacity] = useState(0.55);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      // Opacity drifts from 0.55 -> 0.95 as user scrolls. Never dominant.
      setOpacity(0.55 + p * 0.4);

      const delta = y - lastY.current;
      if (Math.abs(delta) > 4) {
        if (delta > 0 && y > 80) setHidden(true);
        else setHidden(false);
        lastY.current = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          y: hidden && !open ? -64 : 0,
          opacity: open ? 0 : opacity,
        }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-40 px-8 py-6 sm:px-12"
        style={{ pointerEvents: open ? "none" : "auto" }}
      >
        <div className="flex items-center justify-between text-white">
          <a
            href="/"
            className="font-mono-ui text-[10px] tracking-[0.32em] text-white/90 transition-colors hover:text-white"
          >
            WeatherWatch <span className="text-white/45">AI</span>
          </a>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative font-mono-ui text-[10px] tracking-[0.4em] text-white/85 transition-colors hover:text-white"
            aria-label="Open menu"
          >
            <span className="relative inline-block">
              MENU
              <span className="pointer-events-none absolute -bottom-1 left-0 h-px w-0 bg-white/80 transition-[width] duration-700 ease-out group-hover:w-full" />
            </span>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>{open && <MenuOverlay onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function MenuOverlay({ onClose }: { onClose: () => void }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);
  const rippleKey = useRef(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50"
    >
      {/* Translucent veil — Earth and atmosphere remain visible underneath */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(10,14,28,0.55) 0%, rgba(3,5,12,0.82) 60%, rgba(2,3,8,0.94) 100%)",
          backdropFilter: "blur(14px) saturate(1.05)",
          WebkitBackdropFilter: "blur(14px) saturate(1.05)",
        }}
      />

      {/* Drifting cloud field — reacts to hovered item */}
      <CloudField hoverIdx={hoverIdx} />

      {/* Particle reaction layer */}
      <Particles hoverIdx={hoverIdx} />

      {/* Atmospheric ripple from last hover */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            key={ripple.key}
            initial={{ opacity: 0.55, scale: 0 }}
            animate={{ opacity: 0, scale: 6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="pointer-events-none absolute h-40 w-40 rounded-full"
            style={{
              left: ripple.x - 80,
              top: ripple.y - 80,
              background:
                "radial-gradient(circle, rgba(170,210,255,0.25) 0%, rgba(110,168,255,0.08) 40%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Top bar inside overlay */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-8 py-6 sm:px-12">
        <motion.span
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="font-mono-ui text-[10px] tracking-[0.32em] text-white/85"
        >
          WeatherWatch <span className="text-white/45">AI</span>
        </motion.span>
        <motion.button
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          onClick={onClose}
          className="group font-mono-ui text-[10px] tracking-[0.4em] text-white/85 hover:text-white"
        >
          <span className="relative inline-block">
            CLOSE
            <span className="pointer-events-none absolute -bottom-1 left-0 h-px w-full bg-white/70 transition-transform duration-700 ease-out group-hover:scale-x-100 origin-left scale-x-100" />
          </span>
        </motion.button>
      </div>

      {/* Floating menu items */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8 sm:px-12">
        <ul className="w-full max-w-5xl space-y-1 sm:space-y-2">
          {MENU_ITEMS.map((item, i) => (
            <li key={item.label} className="overflow-hidden">
              <motion.button
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "110%", opacity: 0 }}
                transition={{
                  duration: 1,
                  delay: 0.25 + i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onPointerEnter={(e) => {
                  setHoverIdx(i);
                  rippleKey.current += 1;
                  setRipple({
                    x: e.clientX,
                    y: e.clientY,
                    key: rippleKey.current,
                  });
                }}
                onPointerLeave={() => setHoverIdx(null)}
                onPointerMove={(e) => {
                  const el = e.currentTarget;
                  const r = el.getBoundingClientRect();
                  const dx = (e.clientX - (r.left + r.width / 2)) * 0.04;
                  const dy = (e.clientY - (r.top + r.height / 2)) * 0.04;
                  el.style.transform = `translate(${dx}px, ${dy}px)`;
                }}
                onPointerOut={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translate(0,0)";
                }}
                className="group flex w-full items-baseline justify-between gap-8 py-3 text-left"
                style={{ transition: "transform 700ms cubic-bezier(.22,1,.36,1), color 600ms" }}
              >
                <span
                  className="font-editorial text-[12vw] leading-[0.95] sm:text-[7vw] lg:text-[5.2vw]"
                  style={{
                    color:
                      hoverIdx === null
                        ? "rgba(255,255,255,0.92)"
                        : hoverIdx === i
                          ? "rgba(255,255,255,1)"
                          : "rgba(255,255,255,0.28)",
                    transition: "color 700ms ease",
                    fontStyle: hoverIdx === i ? "italic" : "normal",
                  }}
                >
                  {item.label}
                </span>
                <span
                  className="font-mono-ui hidden text-[10px] tracking-[0.32em] sm:inline-block"
                  style={{
                    color:
                      hoverIdx === i ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
                    transition: "color 600ms ease",
                  }}
                >
                  {String(i + 1).padStart(2, "0")} · {item.caption}
                </span>
              </motion.button>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer hairline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-8 py-6 font-mono-ui text-[10px] tracking-[0.32em] text-white/35 sm:px-12"
      >
        <span>PLANETARY CONTROL · v1.0</span>
        <span>LIVE · ATMOSPHERIC LINK STABLE</span>
      </motion.div>
    </motion.div>
  );
}

function CloudField({ hoverIdx }: { hoverIdx: number | null }) {
  // Soft drifting cloud blobs. They lean toward the hovered item index.
  const blobs = useRef(
    Array.from({ length: 6 }).map((_, i) => ({
      x: 10 + i * 16,
      y: 20 + ((i * 37) % 60),
      s: 320 + (i % 3) * 120,
      hue: 220 + (i * 7) % 30,
    })),
  ).current;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => {
        const pull = hoverIdx == null ? 0 : (hoverIdx - 3) * 1.5;
        return (
          <motion.div
            key={i}
            animate={{
              x: [`${b.x}vw`, `${b.x + 4}vw`, `${b.x - 2}vw`, `${b.x}vw`],
              y: [`${b.y}vh`, `${b.y - 3 + pull}vh`, `${b.y + 2 + pull}vh`, `${b.y}vh`],
            }}
            transition={{
              duration: 18 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute rounded-full"
            style={{
              width: b.s,
              height: b.s,
              background: `radial-gradient(circle, oklch(0.78 0.08 ${b.hue} / 0.18) 0%, oklch(0.6 0.08 ${b.hue} / 0.05) 45%, transparent 70%)`,
              filter: "blur(40px)",
            }}
          />
        );
      })}
    </div>
  );
}

function Particles({ hoverIdx }: { hoverIdx: number | null }) {
  const particles = useRef(
    Array.from({ length: 40 }).map((_, i) => ({
      x: (i * 53) % 100,
      y: (i * 71) % 100,
      d: 6 + ((i * 13) % 14),
      s: 1 + ((i * 3) % 3),
    })),
  ).current;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          animate={{
            y: [0, -10, 0],
            opacity: hoverIdx == null ? [0.25, 0.5, 0.25] : [0.4, 0.9, 0.4],
          }}
          transition={{ duration: p.d, repeat: Infinity, ease: "easeInOut" }}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            boxShadow: "0 0 6px rgba(180,210,255,0.7)",
          }}
        />
      ))}
    </div>
  );
}
