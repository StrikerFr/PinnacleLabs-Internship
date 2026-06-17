import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const LINKS = [
  { id: "roadmap", label: "Roadmap" },
  { id: "intelligence", label: "Intelligence" },
  { id: "method", label: "Method" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => navigate({ to: "/app" }), 600);
  };

  // Sticky shrink on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section observer
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      Boolean,
    ) as HTMLElement[];
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Sliding indicator follows hover or active
  useEffect(() => {
    const targetId = hoverId ?? active;
    const el = targetId ? itemRefs.current[targetId] : null;
    const parent = navRef.current;
    if (!el || !parent) {
      setIndicator((p) => ({ ...p, opacity: 0 }));
      return;
    }
    const a = el.getBoundingClientRect();
    const b = parent.getBoundingClientRect();
    setIndicator({ left: a.left - b.left, width: a.width, opacity: 1 });
  }, [hoverId, active, scrolled]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-4"
      >
        <div
          className={`relative grid w-full max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-full border transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            scrolled
              ? "border-white/[0.08] bg-black/40 px-3 py-2 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-3xl backdrop-saturate-[1.8]"
              : "border-transparent bg-transparent px-4 py-2.5 backdrop-blur-none"
          }`}
        >
          {/* logo */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group flex items-center gap-2 justify-self-start pl-2"
          >
            <span className="flex items-center gap-1.5 font-bold tracking-tight text-[16px] text-white">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #7dd3fc 0%, #c4b5fd 100%)",
                  boxShadow: "0 2px 8px -2px rgba(125,211,252,0.6)",
                }}
              />
              TaskPilot
            </span>
          </a>

          {/* center nav */}
          <nav
            ref={navRef}
            onMouseLeave={() => setHoverId(null)}
            className="relative hidden items-center justify-self-center md:flex"
          >
            <motion.div
              aria-hidden
              animate={{ left: indicator.left, width: indicator.width, opacity: indicator.opacity }}
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
              className="absolute top-1/2 h-8 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(196,181,253,0.18), rgba(125,211,252,0.12))",
                border: "1px solid rgba(196,181,253,0.25)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 20px -8px rgba(125,211,252,0.4)",
              }}
            />
            {LINKS.map((l) => {
              const isActive = active === l.id;
              return (
                <a
                  key={l.id}
                  ref={(el) => {
                    itemRefs.current[l.id] = el;
                  }}
                  href={`#${l.id}`}
                  onClick={(e) => handleClick(e, l.id)}
                  onMouseEnter={() => setHoverId(l.id)}
                  className={`relative z-10 flex items-center px-4 py-2 text-[12.5px] font-medium leading-none transition-colors duration-200 ${
                    isActive || hoverId === l.id ? "text-white" : "text-[#bfbfbf]"
                  }`}
                >
                  <span className="relative inline-flex items-center gap-1.5">
                    {isActive && (
                      <motion.span
                        layoutId="nav-dot"
                        className="h-1 w-1 rounded-full"
                        style={{ background: "#7dd3fc", boxShadow: "0 0 8px #7dd3fc" }}
                      />
                    )}
                    {l.label}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* right actions */}
          <div className="flex items-center gap-2 justify-self-end">
            <a
              href="/app"
              onClick={handleGetStarted}
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full px-4 py-2 text-[12px] font-medium text-[#08090f] cursor-pointer"
              style={{
                background: "linear-gradient(180deg, #c4b5fd 0%, #7dd3fc 100%)",
                boxShadow:
                  "0 8px 24px -10px rgba(125,211,252,0.6), inset 0 1px 0 rgba(255,255,255,0.45)",
              }}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Get Started
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
                strokeWidth={2.2}
              />
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white transition-colors hover:bg-white/[0.08] md:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Elegant Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] bg-[#fbfaf8] animate-in fade-in duration-700 ease-in-out fill-mode-forwards pointer-events-none flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#7dd3fc] border-t-transparent animate-spin opacity-50" />
        </div>
      )}

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[72px] z-40 rounded-2xl border border-white/[0.08] bg-black/80 p-2 backdrop-blur-2xl md:hidden"
          >
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => handleClick(e, l.id)}
                className="block rounded-xl px-4 py-3 text-[14px] text-[#dcdcdc] transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* spacer so hero content doesn't sit under fixed nav */}
      <div aria-hidden className="h-16" />
    </>
  );
}
