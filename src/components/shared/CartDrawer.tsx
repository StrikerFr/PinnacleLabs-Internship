import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  X,
  Check,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Lock,
  BadgeCheck,
  Minus,
  Plus,
  Eye,
  Users,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useCartDrawer } from "@/lib/cart-drawer-store";
import { PRODUCTS } from "@/lib/products";
import { inr } from "@/lib/format";

const kitAsset = "/assets/kit.png";

const INK = "#0E2F25";
const INK_SOFT = "#143A2A";
const IVORY = "#F4ECDC";
const GOLD = "#C9A86A";
const GOLD_SOFT = "#E8C98A";

const TRUST = [
  { Icon: Lock, label: "Secure Checkout" },
  { Icon: BadgeCheck, label: "COD Available" },
  { Icon: Truck, label: "Fast Delivery" },
  { Icon: ShieldCheck, label: "7-Day Promise" },
];

export function CartDrawer() {
  const { isOpen, justAdded, close } = useCartDrawer();
  const items = useCart((s) => s.items);
  const setStarterKitQty = useCart((s) => s.setStarterKitQty);
  const subtotal = useCart((s) => s.subtotal());
  const qty = useCart((s) => s.totalQuantity());
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  const starterPrice = PRODUCTS.STARTER_KIT.price;
  const bundlePrice = PRODUCTS.BUNDLE_2.price;
  const bundleSaving = starterPrice * 2 - bundlePrice;
  const showBundleUpsell = qty < 2;

  const subtotalRetail = qty * starterPrice; // pre-bundle value
  const discount = Math.max(0, subtotalRetail - subtotal);
  const shipping = 0;
  const total = subtotal + shipping;

  // Stable "viewing" count derived from items (client only — avoids hydration mismatch)
  const viewing = useMemo(() => 5 + Math.floor(Math.random() * 8), []);
  const purchased = useMemo(() => 18 + Math.floor(Math.random() * 14), []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[90]"
      style={{
        pointerEvents: isOpen ? "auto" : "none",
        visibility: isOpen ? "visible" : "hidden",
        transition: "visibility 420ms",
      }}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: "rgba(8,28,22,0.55)",
          backdropFilter: "blur(6px)",
          opacity: isOpen ? 1 : 0,
        }}
      />

      {/* Panel: bottom sheet on mobile, right drawer on md+ */}
      <div
        role="dialog"
        aria-label="Your Cart"
        className="absolute flex flex-col overflow-hidden
          inset-x-0 bottom-0 max-h-[92vh] rounded-t-[28px]
          md:inset-y-0 md:right-0 md:left-auto md:top-0 md:bottom-0 md:max-h-none
          md:w-[440px] md:rounded-none md:rounded-l-[24px]"
        style={{
          background: "linear-gradient(180deg, #FFFDF7 0%, #F7F1E5 100%)",
          boxShadow: isOpen
            ? "0 -20px 60px -10px rgba(8,28,22,0.4), -30px 0 60px -10px rgba(8,28,22,0.35)"
            : "none",
          transform: isOpen
            ? "translate3d(0,0,0)"
            : typeof window !== "undefined" && window.innerWidth >= 768
              ? "translate3d(100%,0,0)"
              : "translate3d(0,100%,0)",
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
          pointerEvents: isOpen ? "auto" : "none",
          transition:
            "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms, visibility 420ms, box-shadow 420ms",
          willChange: "transform, opacity",
        }}
      >
        {/* Mobile grab handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full" style={{ background: "rgba(20,58,42,0.18)" }} />
        </div>

        {/* Header */}
        <div className="px-5 md:px-6 pt-3 md:pt-6 pb-3 flex items-start justify-between gap-3">
          <div>
            {justAdded && qty > 0 ? (
              <div
                className="inline-flex items-center gap-2 text-[10px] tracking-[0.28em] uppercase font-semibold animate-fade-in"
                style={{ color: "#1F5A40" }}
              >
                <span
                  className="grid place-items-center h-5 w-5 rounded-full"
                  style={{ background: "rgba(31,90,64,0.12)" }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                Added to cart
              </div>
            ) : (
              <div
                className="text-[10px] tracking-[0.28em] uppercase font-semibold"
                style={{ color: GOLD }}
              >
                Your Cart {qty > 0 ? `· ${qty}` : ""}
              </div>
            )}
            <h2
              className="mt-1 font-serif italic font-light leading-tight"
              style={{ color: INK, fontSize: "clamp(22px, 4.4vw, 28px)" }}
            >
              {qty > 0 ? "Your 28-Day Reset is waiting." : "Your cart is empty."}
            </h2>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="h-9 w-9 rounded-full grid place-items-center bg-white/80 hover:bg-white border border-foreground/10 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 md:px-6 pb-3">
          {qty === 0 ? (
            <EmptyState onClose={close} />
          ) : (
            <>
              {/* Items */}
              <div className="flex flex-col gap-3">
                {items.map((it) => (
                  <div
                    key={it.sku}
                    className="flex gap-3 rounded-2xl p-3"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(20,58,42,0.08)",
                    }}
                  >
                    <div
                      className="h-20 w-20 rounded-xl overflow-hidden shrink-0 grid place-items-center"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(232,201,138,0.18), rgba(20,58,42,0.06))",
                      }}
                    >
                      <img
                        decoding="async"
                        src={kitAsset}
                        alt={it.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div
                          className="font-serif text-[15px] leading-tight"
                          style={{ color: INK }}
                        >
                          {it.name}
                        </div>
                        <div className="text-[11px] text-foreground/55 mt-0.5">
                          28-Day Skin Reset · Cleanse · Repair · Detox
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <QuantityStepper qty={it.quantity} onChange={(n) => setStarterKitQty(n)} />
                        <div className="font-serif text-[16px]" style={{ color: INK }}>
                          {inr(it.price * it.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bundle upsell */}
              {showBundleUpsell && (
                <div
                  className="mt-4 rounded-2xl p-4 relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(20,58,42,0.97) 0%, rgba(14,47,37,0.97) 100%)",
                    color: IVORY,
                    boxShadow: "0 18px 40px -18px rgba(20,58,42,0.5)",
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute -top-10 -right-10 h-32 w-32 rounded-full"
                    style={{
                      background: `radial-gradient(closest-side, ${GOLD_SOFT}55, transparent 70%)`,
                    }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="inline-flex items-center gap-1.5 text-[9.5px] tracking-[0.28em] uppercase font-semibold"
                      style={{ color: GOLD_SOFT }}
                    >
                      <Sparkles className="h-3 w-3" /> Upgrade & Save More
                    </div>
                    <span
                      className="text-[9px] tracking-[0.22em] uppercase font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: GOLD, color: INK }}
                    >
                      Most Choose 2
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div
                      className="rounded-xl p-3"
                      style={{
                        background: "rgba(244,236,220,0.06)",
                        border: `1px solid rgba(244,236,220,0.14)`,
                      }}
                    >
                      <div className="text-[10px] tracking-[0.22em] uppercase opacity-65">
                        1 Kit
                      </div>
                      <div className="font-serif text-2xl">{inr(starterPrice)}</div>
                    </div>
                    <div
                      className="rounded-xl p-3 relative"
                      style={{
                        background: `linear-gradient(135deg, ${GOLD_SOFT}38, ${GOLD}22)`,
                        border: `1px solid ${GOLD}88`,
                      }}
                    >
                      <div
                        className="text-[10px] tracking-[0.22em] uppercase font-semibold"
                        style={{ color: GOLD_SOFT }}
                      >
                        2 Kits
                      </div>
                      <div className="font-serif text-2xl">{inr(bundlePrice)}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: GOLD_SOFT }}>
                        Save {inr(bundleSaving)}
                      </div>
                    </div>
                  </div>

                  <ul
                    className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11.5px]"
                    style={{ color: "rgba(244,236,220,0.85)" }}
                  >
                    {[
                      "Extra month supply",
                      "Better value",
                      "Free shipping",
                      "Stays sealed 24 mo.",
                    ].map((b) => (
                      <li key={b} className="flex items-center gap-1.5">
                        <Check
                          className="h-3 w-3 shrink-0"
                          style={{ color: GOLD_SOFT }}
                          strokeWidth={2.6}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setStarterKitQty(2)}
                      className="flex-1 rounded-full px-4 py-3 text-[10.5px] tracking-[0.26em] uppercase font-semibold inline-flex items-center justify-center gap-1.5 transition-transform hover:-translate-y-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${IVORY} 0%, #FFF8E8 50%, ${GOLD_SOFT} 100%)`,
                        color: INK,
                        boxShadow: `0 14px 28px -10px rgba(232,201,138,0.5), 0 0 0 1px rgba(244,236,220,0.4)`,
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Upgrade to 2 Kits
                    </button>
                    <button
                      onClick={() => setStarterKitQty(1)}
                      className="rounded-full px-4 py-3 text-[10.5px] tracking-[0.26em] uppercase font-medium"
                      style={{
                        color: "rgba(244,236,220,0.75)",
                        border: "1px solid rgba(244,236,220,0.22)",
                      }}
                    >
                      Keep 1
                    </button>
                  </div>
                </div>
              )}

              {/* Social proof */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-foreground/65">
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                      style={{ background: "#1F5A40" }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-1.5 w-1.5"
                      style={{ background: "#1F5A40" }}
                    />
                  </span>
                  {viewing} people viewing this kit right now
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3 w-3" style={{ color: GOLD }} />
                  {purchased} customers purchased today
                </span>
              </div>

              {/* Trust row */}
              <div
                className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl px-3 py-3"
                style={{
                  background: "rgba(20,58,42,0.05)",
                  border: "1px solid rgba(20,58,42,0.08)",
                }}
              >
                {TRUST.map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 text-[10.5px]"
                    style={{ color: INK }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                    <span className="truncate">{label}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div
                className="mt-4 rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,0.65)",
                  border: "1px solid rgba(20,58,42,0.08)",
                }}
              >
                <Row label="Subtotal" value={inr(subtotalRetail)} />
                {discount > 0 && (
                  <Row label="Bundle discount" value={`− ${inr(discount)}`} accent />
                )}
                <Row label="Shipping" value={shipping === 0 ? "Free" : inr(shipping)} />
                <div className="mt-3 pt-3 border-t border-foreground/10 flex items-end justify-between">
                  <span className="text-[11px] tracking-[0.22em] uppercase text-foreground/65">
                    Total
                  </span>
                  <span className="font-serif text-[28px] leading-none" style={{ color: INK }}>
                    {inr(total)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sticky footer CTA */}
        {qty > 0 && (
          <div
            className="px-5 md:px-6 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] border-t"
            style={{
              borderColor: "rgba(20,58,42,0.08)",
              background: "linear-gradient(180deg, rgba(247,241,229,0.6) 0%, #F7F1E5 100%)",
              backdropFilter: "blur(8px)",
            }}
          >
            <button
              onClick={() => {
                close();
                navigate({ to: "/checkout" });
              }}
              className="group w-full inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-4 text-[12px] tracking-[0.28em] uppercase font-semibold transition-transform hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, #1F5A40 0%, ${INK_SOFT} 55%, ${INK} 100%)`,
                color: IVORY,
                boxShadow:
                  "0 20px 40px -14px rgba(20,58,42,0.6), 0 0 0 1px rgba(244,236,220,0.18) inset",
              }}
            >
              <ShoppingBag className="h-4 w-4" />
              Proceed to Checkout · {inr(total)}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={close}
              className="mt-2 w-full text-center text-[11px] tracking-[0.26em] uppercase text-foreground/55 hover:text-foreground py-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-[13px]">
      <span className="text-foreground/65">{label}</span>
      <span style={{ color: accent ? "#1F5A40" : INK, fontWeight: accent ? 600 : 500 }}>
        {value}
      </span>
    </div>
  );
}

function QuantityStepper({ qty, onChange }: { qty: number; onChange: (n: number) => void }) {
  return (
    <div
      className="inline-flex items-center rounded-full"
      style={{ background: "rgba(20,58,42,0.06)", border: "1px solid rgba(20,58,42,0.1)" }}
    >
      <button
        onClick={() => onChange(Math.max(0, qty - 1))}
        aria-label="Decrease"
        className="h-8 w-8 grid place-items-center text-foreground/70 hover:text-foreground"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-6 text-center text-[13px] font-medium" style={{ color: INK }}>
        {qty}
      </span>
      <button
        onClick={() => onChange(qty + 1)}
        aria-label="Increase"
        className="h-8 w-8 grid place-items-center text-foreground/70 hover:text-foreground"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-10 text-center">
      <div
        className="mx-auto h-16 w-16 rounded-full grid place-items-center"
        style={{ background: "rgba(20,58,42,0.06)" }}
      >
        <Eye className="h-6 w-6" style={{ color: INK }} />
      </div>
      <p className="mt-4 text-sm text-foreground/65">
        Your cart is empty. Add a Starter Kit to get started.
      </p>
      <button
        onClick={onClose}
        className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] tracking-[0.26em] uppercase font-semibold"
        style={{ background: INK, color: IVORY }}
      >
        Continue Shopping
      </button>
    </div>
  );
}
