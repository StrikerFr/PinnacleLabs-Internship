import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-store";
import { useCartDrawer } from "@/lib/cart-drawer-store";
import { useAuth } from "@/hooks/use-auth";

const LINKS = [
  { label: "Routine", href: "/#routine" },
  { label: "Results", href: "/#results" },
  { label: "Ingredients", href: "/#ingredients" },
  { label: "Why Us", href: "/#trust" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const cartCount = useCart((s) => s.totalQuantity());
  const openDrawer = useCartDrawer((s) => s.open);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { user } = useAuth();
  const { pathname } = useRouterState({ select: (s) => s.location });
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out`}>
      <div
        className={`mx-auto transition-all duration-500 ease-out max-w-[1400px] px-4 md:px-6 ${
          scrolled ? "mt-2 md:mt-2.5" : "mt-4 md:mt-5"
        }`}
      >
        <nav
          className={`relative flex items-center justify-between rounded-full transition-all duration-500 ${
            scrolled ? "py-2 px-6 md:px-7" : "py-3 px-5 md:px-8"
          }`}
          style={{
            background: scrolled ? "rgba(247, 243, 236, 0.88)" : "rgba(247, 243, 236, 0.45)",
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            border: scrolled
              ? "1px solid rgba(20, 58, 42, 0.08)"
              : "1px solid rgba(244, 236, 220, 0.6)",
            boxShadow: scrolled
              ? "0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 16px 36px -12px rgba(20, 10, 0, 0.12)"
              : "0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 8px 30px -14px rgba(60, 40, 20, 0.08)",
          }}
        >
          <Link
            to="/"
            onClick={(e) => {
              if (isHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            aria-label="VedaGlows — back to top"
            className="flex items-center transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <img
              decoding="async"
              src={"/assets/vedaglows-logo.png"}
              alt="VedaGlows"
              className={`w-auto object-contain transition-all duration-500 ease-out ${
                scrolled
                  ? "h-[68px] md:h-[80px] -my-3 md:-my-4"
                  : "h-[104px] md:h-[124px] -my-8 md:-my-10"
              }`}
              draggable={false}
            />
          </Link>

          {isHome && (
            <ul className="hidden md:flex items-center gap-8 lg:gap-11 text-[11.5px] tracking-[0.22em] uppercase text-foreground/70">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="relative inline-block py-1.5 transition-colors duration-300 hover:text-[#143A2A] group"
                  >
                    {l.label}
                    <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-[#143A2A] transition-all duration-300 ease-out group-hover:w-full group-hover:left-0" />
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-4 md:gap-5">
            <Link
              to={user ? "/account" : "/auth"}
              aria-label="Account"
              className="text-foreground/80 hover:text-[#143A2A] hover:scale-110 active:scale-95 transition-all duration-300"
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.4} />
            </Link>

            <button
              onClick={() => openDrawer(false)}
              aria-label="Cart"
              className="relative text-foreground/80 hover:text-[#143A2A] hover:scale-110 active:scale-95 transition-all duration-300 group"
            >
              <ShoppingBag
                className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-6"
                strokeWidth={1.4}
              />
              {mounted && cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 grid place-items-center text-[10px] font-medium rounded-full transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: "#143A2A",
                    color: "#F4ECDC",
                    boxShadow: "0 2px 5px rgba(20,58,42,0.3)",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => openDrawer(false)}
              className="hidden sm:inline-flex text-[11px] font-medium tracking-[0.22em] uppercase rounded-full px-5 md:px-6 py-2.5 md:py-3 text-[#F4ECDC] transition-all duration-500 ease-out hover:scale-[1.03] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #143A2A 0%, #1c4b37 100%)",
                boxShadow: scrolled
                  ? "0 4px 14px rgba(20, 58, 42, 0.2)"
                  : "0 10px 28px -4px rgba(20, 58, 42, 0.45)",
              }}
            >
              Start Reset
            </button>

            <button
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="md:hidden text-foreground/85 hover:text-[#143A2A] transition-colors"
            >
              <div className="relative h-5 w-5 flex items-center justify-center">
                <span
                  className={`absolute h-0.5 w-5 bg-current transform transition-all duration-300 ${open ? "rotate-45" : "-translate-y-1.5"}`}
                />
                <span
                  className={`absolute h-0.5 w-5 bg-current transition-all duration-300 ${open ? "opacity-0" : "opacity-100"}`}
                />
                <span
                  className={`absolute h-0.5 w-5 bg-current transform transition-all duration-300 ${open ? "-rotate-45" : "translate-y-1.5"}`}
                />
              </div>
            </button>
          </div>
        </nav>
      </div>

      <div
        className="md:hidden overflow-hidden transition-all duration-500 ease-out"
        style={{
          maxHeight: open ? "80vh" : 0,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-10px)",
        }}
      >
        <div
          className="mx-4 mt-3 rounded-3xl px-6 py-7"
          style={{
            background: "rgba(247, 243, 236, 0.96)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(20, 58, 42, 0.08)",
            boxShadow: "0 24px 60px -20px rgba(20,10,0,0.2)",
          }}
        >
          <ul className="flex flex-col gap-1">
            {isHome &&
              LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between py-3 border-b border-foreground/5 hover:text-[#143A2A] transition-colors"
                  >
                    <span className="font-serif italic text-[1.4rem] text-foreground/90">
                      {l.label}
                    </span>
                  </a>
                </li>
              ))}
            <li>
              <Link
                to={user ? "/account" : "/auth"}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-3 border-b border-foreground/5 hover:text-[#143A2A] transition-colors"
              >
                <span className="font-serif italic text-[1.4rem]">Account</span>
              </Link>
            </li>
            <li>
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-3 border-b border-foreground/5 hover:text-[#143A2A] transition-colors"
              >
                <span className="font-serif italic text-[1.4rem]">
                  Cart {mounted && cartCount > 0 && `(${cartCount})`}
                </span>
              </Link>
            </li>
          </ul>
          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="mt-6 block text-center text-[11px] tracking-[0.22em] uppercase rounded-full py-3.5 text-[#F4ECDC] transition-transform duration-300 active:scale-[0.98]"
            style={{
              background: "#143A2A",
              boxShadow: "0 8px 20px rgba(20, 58, 42, 0.25)",
            }}
          >
            Start Reset
          </Link>
        </div>
      </div>
    </header>
  );
}
