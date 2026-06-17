import { useEffect, useRef } from "react";

/**
 * Atmospheric cursor — a glowing sensor exploring the planet.
 * - Hides the OS cursor sitewide.
 * - Single rAF loop, transform-only updates (no React re-renders).
 * - Expands + spawns soft particles on interactive hover.
 */
export function AtmosphericCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  const target = useRef({ x: -100, y: -100 });
  const dot = useRef({ x: -100, y: -100 });
  const halo = useRef({ x: -100, y: -100 });
  const hovering = useRef(false);
  const visible = useRef(false);
  const lastSpawn = useRef(0);

  useEffect(() => {
    // Hide native cursor only on capable pointer devices.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-atmos-cursor", "");
    styleEl.textContent = `
      html, body, *, *::before, *::after { cursor: none !important; }
      .atmos-cursor-show { opacity: 1 !important; }
    `;
    document.head.appendChild(styleEl);

    const onMove = (e: PointerEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!visible.current) {
        visible.current = true;
        dotRef.current?.classList.add("atmos-cursor-show");
        haloRef.current?.classList.add("atmos-cursor-show");
      }
      const t = e.target as HTMLElement | null;
      const isInteractive = !!t?.closest(
        'a, button, [role="button"], input, textarea, select, label, [data-cursor="hover"]',
      );
      hovering.current = isInteractive;
    };

    const onLeave = () => {
      visible.current = false;
      dotRef.current?.classList.remove("atmos-cursor-show");
      haloRef.current?.classList.remove("atmos-cursor-show");
    };

    const onDown = () => {
      if (haloRef.current) haloRef.current.style.setProperty("--press", "0.7");
    };
    const onUp = () => {
      if (haloRef.current) haloRef.current.style.setProperty("--press", "1");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    let raf = 0;
    const loop = (time: number) => {
      // Dot tracks tightly; halo lags for fluidity.
      dot.current.x += (target.current.x - dot.current.x) * 0.45;
      dot.current.y += (target.current.y - dot.current.y) * 0.45;
      halo.current.x += (target.current.x - halo.current.x) * 0.16;
      halo.current.y += (target.current.y - halo.current.y) * 0.16;

      const scale = hovering.current ? 2.4 : 1;
      const opacity = hovering.current ? 0.9 : 0.55;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${halo.current.x}px, ${halo.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        haloRef.current.style.opacity = visible.current ? String(opacity) : "0";
      }

      // Throttled particle spawn while hovering — attraction trail.
      if (hovering.current && visible.current && time - lastSpawn.current > 90) {
        lastSpawn.current = time;
        spawnParticle(fieldRef.current, halo.current.x, halo.current.y);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      styleEl.remove();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ contain: "strict" }}
    >
      <div ref={fieldRef} className="absolute inset-0" />
      <div
        ref={haloRef}
        className="absolute left-0 top-0 h-10 w-10 rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(170,210,255,0.35) 0%, rgba(110,168,255,0.18) 35%, rgba(110,168,255,0) 70%)",
          filter: "blur(2px)",
          transition: "opacity 300ms ease, transform 220ms cubic-bezier(.22,1,.36,1)",
          willChange: "transform, opacity",
          // @ts-expect-error custom prop
          "--press": "1",
        }}
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-[6px] w-[6px] rounded-full opacity-0"
        style={{
          background: "white",
          boxShadow:
            "0 0 8px 1px rgba(180,215,255,0.85), 0 0 20px 4px rgba(110,168,255,0.35)",
          transition: "opacity 300ms ease",
          willChange: "transform",
        }}
      />
    </div>
  );
}

function spawnParticle(host: HTMLDivElement | null, x: number, y: number) {
  if (!host) return;
  const p = document.createElement("span");
  const ang = Math.random() * Math.PI * 2;
  const dist = 18 + Math.random() * 22;
  const dx = Math.cos(ang) * dist;
  const dy = Math.sin(ang) * dist;
  p.style.cssText = `
    position:absolute; left:${x}px; top:${y}px;
    width:3px; height:3px; border-radius:9999px;
    background: rgba(200,225,255,0.9);
    box-shadow: 0 0 6px rgba(150,190,255,0.7);
    transform: translate(${dx}px, ${dy}px) scale(1);
    opacity: 0.85;
    transition: transform 700ms cubic-bezier(.22,1,.36,1), opacity 700ms ease;
    will-change: transform, opacity;
    pointer-events: none;
  `;
  host.appendChild(p);
  // Attract toward cursor center, then fade.
  requestAnimationFrame(() => {
    p.style.transform = `translate(0px, 0px) scale(0.2)`;
    p.style.opacity = "0";
  });
  setTimeout(() => p.remove(), 760);
}
