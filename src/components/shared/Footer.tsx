import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  ArrowUpRight,
  MapPin,
  Check,
  Sparkles,
  Headphones,
  Mail,
  Phone,
} from "lucide-react";

type FooterPath = "/" | "/support" | "/privacy" | "/terms" | "/refund" | "/about" | "/faqs";

const POLICY_LINKS: { label: string; to: FooterPath }[] = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Refund Policy", to: "/refund" },
];

const COMPANY_LINKS: { label: string; to: FooterPath }[] = [
  { label: "About", to: "/about" },
  { label: "Customer Support", to: "/support" },
  { label: "Shipping", to: "/refund" },
  { label: "FAQs", to: "/faqs" },
];

export function Footer() {
  const wordRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [subbed, setSubbed] = useState(false);
  const [email, setEmail] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const el = wordRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setMouse({
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const update = () => {
      const t = new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setTime(t);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  const WORD = "VEDAGLOWS";

  return (
    <footer
      id="site-footer"
      className="relative overflow-hidden"
      style={{ background: "#0F2E25", color: "#F4ECDC" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 100%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[60vh] w-[80vw] rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(232,201,138,0.18), transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 md:px-10">
        {/* ─── TOP STATEMENT ─── */}
        <div className="pt-20 sm:pt-24 md:pt-32 pb-12 md:pb-16 text-center">
          <div
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border mb-6 sm:mb-8"
            style={{
              borderColor: "rgba(232,201,138,0.35)",
              background: "rgba(232,201,138,0.06)",
            }}
          >
            <span
              className="relative inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "#E8C98A" }}
            >
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: "#E8C98A" }}
              />
            </span>
            <span
              className="text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase"
              style={{ color: "#E8C98A" }}
            >
              Made In India · Shipping Nationwide
            </span>
          </div>

          <h2
            className="font-serif leading-[0.98] tracking-tight px-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(32px, 6vw, 90px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
            }}
          >
            Your Skin Deserves{" "}
            <em className="italic font-light" style={{ color: "#E8C98A" }}>
              Simplicity.
            </em>
          </h2>
          <p
            className="mt-5 sm:mt-6 max-w-md mx-auto text-[13px] sm:text-base font-light leading-relaxed px-2"
            style={{ color: "rgba(244,236,220,0.62)" }}
          >
            Modern Ayurvedic skincare designed to help you build a routine you'll actually follow.
          </p>

          {/* Email capture */}
          <div className="mt-10 sm:mt-14">
            <div
              className="text-[9.5px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em] uppercase mb-4 sm:mb-5"
              style={{ color: "#E8C98A" }}
            >
              Join 12,000+ On The Ritual List
            </div>
            <form
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSubbed(true);
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                disabled={subbed}
                className="w-full sm:flex-1 bg-transparent border-b px-0 py-3 text-sm font-light tracking-wide placeholder:text-[rgba(244,236,220,0.35)] focus:outline-none transition-colors text-center sm:text-left"
                style={{ borderColor: "rgba(244,236,220,0.18)", color: "#F4ECDC" }}
              />
              <button
                type="submit"
                className="group relative overflow-hidden px-6 sm:px-8 py-3 text-[11px] tracking-[0.28em] uppercase transition-all duration-500 inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                style={{
                  background: subbed ? "#E8C98A" : "#F4ECDC",
                  color: "#12382D",
                  borderRadius: 999,
                }}
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  {subbed ? (
                    <>
                      <Check className="h-3.5 w-3.5" strokeWidth={2.2} /> You're In
                    </>
                  ) : (
                    <>
                      Subscribe
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-45"
                        strokeWidth={2}
                      />
                    </>
                  )}
                </span>
              </button>
            </form>
            <div
              className="mt-3 text-[9.5px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.25em] uppercase"
              style={{ color: "rgba(244,236,220,0.4)" }}
            >
              First-order 10% off · No spam, ever
            </div>
          </div>
        </div>

        {/* ─── CUSTOMER SUPPORT BANNER ─── */}
        <div
          className="group relative rounded-[28px] p-[1px] mb-12 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(232,201,138,0.55) 0%, rgba(232,201,138,0.08) 35%, rgba(232,201,138,0.06) 65%, rgba(232,201,138,0.5) 100%)",
          }}
        >
          {/* animated aurora glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-24 opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(40% 60% at 15% 30%, rgba(232,201,138,0.22) 0%, transparent 60%), radial-gradient(45% 65% at 85% 70%, rgba(120,200,160,0.18) 0%, transparent 60%)",
              animation: "supportGlow 12s ease-in-out infinite",
            }}
          />

          <div
            className="relative rounded-[27px] px-5 sm:px-8 py-6 sm:py-7"
            style={{
              background:
                "linear-gradient(140deg, rgba(15,42,30,0.96) 0%, rgba(20,58,42,0.92) 55%, rgba(15,42,30,0.96) 100%)",
            }}
          >
            {/* corner sparkle */}
            <Sparkles
              aria-hidden
              className="absolute top-4 right-4 h-3.5 w-3.5 opacity-60"
              style={{ color: "#E8C98A", animation: "supportTwinkle 3.2s ease-in-out infinite" }}
            />

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
              {/* LEFT: icon + headline + status */}
              <div className="flex items-start gap-4 sm:gap-5 min-w-0">
                <span className="relative shrink-0">
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(232,201,138,0.45) 0%, transparent 70%)",
                      animation: "supportPulse 2.6s ease-in-out infinite",
                    }}
                  />
                  <span
                    className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(232,201,138,0.28) 0%, rgba(232,201,138,0.08) 100%)",
                      border: "1px solid rgba(232,201,138,0.45)",
                      boxShadow: "inset 0 1px 0 rgba(244,236,220,0.18)",
                    }}
                  >
                    <Headphones
                      className="h-6 w-6"
                      style={{ color: "#E8C98A" }}
                      strokeWidth={1.6}
                    />
                  </span>
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className="text-[10px] tracking-[0.34em] uppercase font-semibold"
                      style={{ color: "#E8C98A" }}
                    >
                      We're Here To Help
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] tracking-[0.18em] uppercase font-semibold"
                      style={{
                        background: "rgba(74,222,128,0.12)",
                        border: "1px solid rgba(74,222,128,0.35)",
                        color: "#86EFAC",
                      }}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span
                          className="absolute inline-flex h-full w-full rounded-full opacity-75"
                          style={{
                            background: "#4ADE80",
                            animation: "supportPing 1.8s ease-out infinite",
                          }}
                        />
                        <span
                          className="relative inline-flex h-1.5 w-1.5 rounded-full"
                          style={{ background: "#4ADE80" }}
                        />
                      </span>
                      Online Now
                    </span>
                  </div>

                  <div
                    className="font-serif italic text-[20px] sm:text-[26px] leading-tight mt-2 text-[#F4ECDC]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Talk to a real human, 7 days a week.
                  </div>
                  <p className="mt-1.5 text-[12px] sm:text-[13px] text-[#F4ECDC]/60 leading-relaxed max-w-[42ch]">
                    Average reply under 2 hours. Real Ayurvedic guidance, no bots, no scripts.
                  </p>

                  {/* contact pills */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <a
                      href="mailto:vedaglows@gmail.com"
                      className="group/pill flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
                      style={{
                        background: "rgba(244,236,220,0.04)",
                        border: "1px solid rgba(244,236,220,0.1)",
                      }}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: "rgba(232,201,138,0.14)" }}
                      >
                        <Mail className="h-3.5 w-3.5" style={{ color: "#E8C98A" }} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[9px] tracking-[0.22em] uppercase text-[#F4ECDC]/50">
                          Email
                        </span>
                        <span className="block text-[12px] text-[#F4ECDC]/90 truncate">
                          vedaglows@gmail.com
                        </span>
                      </span>
                    </a>
                    <a
                      href="tel:+919999999999"
                      className="group/pill flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
                      style={{
                        background: "rgba(244,236,220,0.04)",
                        border: "1px solid rgba(244,236,220,0.1)",
                      }}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: "rgba(232,201,138,0.14)" }}
                      >
                        <Phone className="h-3.5 w-3.5" style={{ color: "#E8C98A" }} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[9px] tracking-[0.22em] uppercase text-[#F4ECDC]/50">
                          Call
                        </span>
                        <span className="block text-[12px] text-[#F4ECDC]/90 truncate">
                          +91 99999 99999
                        </span>
                      </span>
                    </a>
                    <a
                      href="https://instagram.com/vedaglows"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/pill flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
                      style={{
                        background: "rgba(244,236,220,0.04)",
                        border: "1px solid rgba(244,236,220,0.1)",
                      }}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: "rgba(232,201,138,0.14)" }}
                      >
                        <Instagram className="h-3.5 w-3.5" style={{ color: "#E8C98A" }} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[9px] tracking-[0.22em] uppercase text-[#F4ECDC]/50">
                          DM Us
                        </span>
                        <span className="block text-[12px] text-[#F4ECDC]/90 truncate">
                          @vedaglows
                        </span>
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* RIGHT: CTA */}
              <div className="flex flex-col items-stretch lg:items-end gap-2 shrink-0">
                <Link
                  to="/support"
                  className="relative inline-flex items-center justify-center gap-2 w-full lg:w-auto px-7 py-4 rounded-full text-[11px] font-semibold tracking-[0.3em] uppercase transition-all hover:-translate-y-0.5 hover:scale-[1.02] overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #F0D89A 0%, #E8C98A 45%, #C9A86A 100%)",
                    color: "#0F2A1E",
                    boxShadow:
                      "0 24px 50px -18px rgba(201,168,106,0.65), inset 0 1px 0 rgba(255,255,255,0.45)",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full"
                    style={{
                      background:
                        "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
                      animation: "supportShine 3.4s ease-in-out infinite",
                    }}
                  />
                  <MessageCircle className="relative h-4 w-4" />
                  <span className="relative">Contact Support</span>
                </Link>
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#F4ECDC]/45 text-center lg:text-right">
                  Mon–Sun · 9 AM – 9 PM IST
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MARQUEE TAGLINE ─── */}
        <div
          className="relative overflow-hidden py-5 sm:py-6 border-y"
          style={{ borderColor: "rgba(244,236,220,0.08)" }}
        >
          <div className="marquee-track flex gap-12 w-max items-center">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex gap-12 items-center shrink-0">
                {[
                  "Simple",
                  "Ayurvedic",
                  "Made For Indian Skin",
                  "3-Step Ritual",
                  "Free Shipping ₹999+",
                  "7-Day Promise",
                  "Cruelty Free",
                  "Made In India",
                ].map((w, i) => (
                  <span
                    key={`${k}-${i}`}
                    className="flex items-center gap-12 text-[12px] sm:text-[14px] tracking-[0.18em] sm:tracking-[0.2em] uppercase font-light shrink-0"
                    style={{ color: "rgba(244,236,220,0.55)" }}
                  >
                    {w}
                    <Sparkles
                      className="h-3.5 w-3.5"
                      style={{ color: "#E8C98A" }}
                      strokeWidth={1.5}
                    />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ─── COLUMNS ─── */}
        <div className="py-12 sm:py-16 md:py-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          <div className="sm:col-span-2 md:col-span-1">
            <Link
              to="/"
              className="font-serif text-2xl tracking-tight inline-block"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#F4ECDC" }}
            >
              Veda<span style={{ color: "#E8C98A" }}>Glow</span>
            </Link>
            <p
              className="mt-4 text-[13px] leading-relaxed font-light max-w-[280px]"
              style={{ color: "rgba(244,236,220,0.55)" }}
            >
              Modern Ayurvedic skincare focused on simplicity, consistency, and visible results.
            </p>
            <div
              className="mt-5 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.18em] uppercase"
              style={{ color: "rgba(244,236,220,0.5)" }}
            >
              <MapPin className="h-3 w-3" style={{ color: "#E8C98A" }} strokeWidth={1.6} />
              Mathura, UP, IN
              <span className="mx-1 opacity-40">·</span>
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: "#9ED69B" }}
              >
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: "#9ED69B" }}
                />
              </span>
              <span className="tabular-nums">{time} IST</span>
            </div>
          </div>

          <FooterLinkCol
            title="Shop"
            items={[
              { label: "Skin Reset Kit", to: "/" },
              { label: "Daily Clean", to: "/" },
              { label: "Glow Repair", to: "/" },
              { label: "Deep Detox", to: "/" },
            ]}
          />
          <FooterLinkCol title="Company" items={COMPANY_LINKS} />

          <div>
            <div
              className="text-[10px] tracking-[0.35em] uppercase mb-5"
              style={{ color: "#E8C98A" }}
            >
              Follow Us
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  Icon: Instagram,
                  name: "Instagram",
                  count: "@vedaglows",
                  href: "https://instagram.com/vedaglows",
                },
                {
                  Icon: MessageCircle,
                  name: "WhatsApp",
                  count: "Chat",
                  href: "https://wa.me/919999999999",
                },
              ].map(({ Icon, name, count, href }) => (
                <a
                  key={name}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-md border transition-all duration-400 hover:-translate-y-0.5"
                  style={{
                    borderColor: "rgba(244,236,220,0.1)",
                    background: "rgba(244,236,220,0.02)",
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5 group-hover:text-[#E8C98A] transition-colors"
                    style={{ color: "rgba(244,236,220,0.7)" }}
                    strokeWidth={1.6}
                  />
                  <span
                    className="flex-1 text-[12px] font-light tracking-wide truncate"
                    style={{ color: "rgba(244,236,220,0.75)" }}
                  >
                    {name}
                  </span>
                  <span
                    className="text-[9px] tracking-[0.16em] uppercase shrink-0"
                    style={{ color: "rgba(232,201,138,0.7)" }}
                  >
                    {count}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ─── GIANT WORDMARK ─── */}
        <div
          ref={wordRef}
          className="relative -mx-5 sm:-mx-6 md:-mx-10 select-none cursor-default group/word"
          style={{ minHeight: "clamp(60px, 18vw, 220px)" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover/word:opacity-100"
            style={{
              background: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(232,201,138,0.32), transparent 38%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center px-3" aria-hidden>
            <div
              className="flex w-full items-center justify-between font-serif leading-none"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(44px, 16vw, 220px)",
                fontWeight: 300,
                letterSpacing: "-0.04em",
              }}
            >
              {WORD.split("").map((ch, i) => (
                <span
                  key={i}
                  className="footer-letter inline-block transition-all duration-500 ease-out"
                  style={{ color: "rgba(244,236,220,0.85)" }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>
          <div
            aria-hidden
            className="absolute left-5 right-5 sm:left-6 sm:right-6 bottom-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(232,201,138,0.4), transparent)",
            }}
          />
        </div>

        {/* ─── BOTTOM ROW ─── */}
        <div className="py-7 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div
            className="text-[10.5px] sm:text-[11px] tracking-[0.16em] sm:tracking-[0.18em] font-light"
            style={{ color: "rgba(244,236,220,0.45)" }}
          >
            &copy; 2026 VedaGlows. Crafted with intention.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-8 gap-y-2">
            {POLICY_LINKS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="group relative text-[10.5px] sm:text-[11px] tracking-[0.16em] sm:tracking-[0.18em] font-light hover:text-[#F4ECDC] transition-colors"
                style={{ color: "rgba(244,236,220,0.55)" }}
              >
                {label}
                <span
                  className="absolute left-0 -bottom-0.5 h-px w-0 group-hover:w-full transition-all duration-400"
                  style={{ background: "rgba(232,201,138,0.5)" }}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkCol({
  title,
  items,
}: {
  title: string;
  items: { label: string; to: FooterPath }[];
}) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.35em] uppercase mb-5" style={{ color: "#E8C98A" }}>
        {title}
      </div>
      <ul className="space-y-3.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              to={item.to}
              className="group relative inline-flex items-center gap-1.5 text-[13.5px] font-light text-[rgba(244,236,220,0.6)] hover:text-[#F4ECDC] hover:translate-x-1 transition-all"
            >
              <span className="relative">
                {item.label}
                <span
                  className="absolute left-0 -bottom-0.5 h-px w-0 group-hover:w-full transition-all duration-400"
                  style={{ background: "#E8C98A" }}
                />
              </span>
              <ArrowUpRight
                className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                style={{ color: "#E8C98A" }}
                strokeWidth={1.8}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
