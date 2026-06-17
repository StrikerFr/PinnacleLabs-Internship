import { useEffect, useRef } from "react";

/**
 * Apple-style animated aurora background.
 * Soft drifting color orbs + subtle cursor parallax. Pure CSS/JS — no WebGL.
 */
export function AuroraBg() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;
    function onMove(e: PointerEvent) {
      const w = window.innerWidth,
        h = window.innerHeight;
      tx = (e.clientX / w - 0.5) * 40;
      ty = (e.clientY / h - 0.5) * 40;
    }
    function tick() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el!.style.setProperty("--mx", `${cx}px`);
      el!.style.setProperty("--my", `${cy}px`);
      raf = requestAnimationFrame(tick);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} className="aurora-root pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aurora-base" />
      <div className="aurora-blob aurora-1" />
      <div className="aurora-blob aurora-2" />
      <div className="aurora-blob aurora-3" />
      <div className="aurora-blob aurora-4" />
      <div className="aurora-blob aurora-5" />
      <div className="aurora-grain" />
    </div>
  );
}
