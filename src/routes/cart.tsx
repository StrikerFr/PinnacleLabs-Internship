import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/shared/Navbar";
import { useCart } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/products";
import { inr } from "@/lib/format";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Sparkles,
  Truck,
  BadgeCheck,
  Lock,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — VedaGlows" },
      {
        name: "description",
        content:
          "Review your VedaGlows 28-Day Skin Reset Kit selection, adjust quantities and head to secure checkout with free shipping and COD.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Your Cart — VedaGlows" },
      {
        property: "og:description",
        content: "Review your VedaGlows starter kit selection and continue to secure checkout.",
      },
      { property: "og:url", content: "https://heart-hug-nest.lovable.app/cart" },
    ],
  }),
  component: CartPage,
});

const TRUST = [
  { Icon: Truck, label: "Free Shipping" },
  { Icon: BadgeCheck, label: "COD Available" },
  { Icon: Lock, label: "Secure Checkout" },
  { Icon: ShieldCheck, label: "7-Day Promise" },
];

function CartPage() {
  const navigate = useNavigate();
  const { items, setStarterKitQty, removeItem, subtotal, totalQuantity } = useCart();
  const qty = totalQuantity();
  const sub = subtotal();
  const savings = qty * PRODUCTS.STARTER_KIT.price - sub;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[color:var(--ivory)]">
        <Navbar />
        <div className="mx-auto max-w-md px-4 pt-32 pb-24 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-foreground/30" strokeWidth={1.2} />
          <h1 className="mt-6 font-serif italic text-3xl">Your cart is empty</h1>
          <p className="mt-2 text-sm text-foreground/60">Start your 28-day skin reset today.</p>
          <Link
            to="/"
            className="mt-8 inline-block rounded-full px-8 py-3 text-xs tracking-[0.22em] uppercase text-primary-foreground"
            style={{ background: "#143A2A" }}
          >
            Shop Starter Kit
          </Link>
        </div>
      </main>
    );
  }

  const kitQty = items.find((i) => i.sku === PRODUCTS.STARTER_KIT.sku)?.quantity ?? 0;

  return (
    <main className="min-h-screen bg-[color:var(--ivory)] pb-32">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pt-28 md:pt-32">
        <h1 className="font-serif italic text-4xl md:text-5xl text-foreground">Your Cart</h1>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.sku}
              className="rounded-2xl bg-white p-5 md:p-6 border border-foreground/5 shadow-sm flex gap-4"
            >
              <div className="h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-xl bg-[color:var(--ivory)] grid place-items-center">
                <ShoppingBag className="h-8 w-8 text-foreground/40" strokeWidth={1.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg text-foreground">{item.name}</h3>
                <p className="text-xs text-foreground/50 mt-0.5">28-Day Skin Reset</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-foreground/10 px-1 py-1">
                    <button
                      onClick={() => setStarterKitQty(item.quantity - 1)}
                      className="h-8 w-8 grid place-items-center rounded-full hover:bg-foreground/5"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => setStarterKitQty(item.quantity + 1)}
                      className="h-8 w-8 grid place-items-center rounded-full hover:bg-foreground/5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.sku)}
                    className="text-foreground/40 hover:text-foreground p-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Upsell */}
        {kitQty === 1 && (
          <div
            className="mt-6 rounded-3xl p-6 md:p-7 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #143A2A 0%, #0E2F25 100%)",
              boxShadow: "0 30px 60px -30px rgba(20,58,42,0.4)",
            }}
          >
            <div className="flex items-start gap-3 text-[#E8C98A]">
              <Sparkles className="h-5 w-5 mt-1 shrink-0" />
              <div className="flex-1">
                <div className="text-[10px] tracking-[0.3em] uppercase opacity-80">
                  Upgrade Offer
                </div>
                <h3 className="mt-1 font-serif italic text-2xl text-[#F4ECDC]">
                  Add 1 more & save {inr(199)}
                </h3>
                <p className="mt-1 text-sm text-[#F4ECDC]/70">
                  2 Starter Kits for just {inr(799)} instead of {inr(998)}
                </p>
                <button
                  onClick={() => setStarterKitQty(2)}
                  className="mt-4 w-full md:w-auto px-6 py-3 rounded-full text-xs tracking-[0.22em] uppercase font-semibold"
                  style={{ background: "#E8C98A", color: "#0E2F25" }}
                >
                  Upgrade To Bundle — {inr(799)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 rounded-3xl bg-white p-6 md:p-7 border border-foreground/5 shadow-sm">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-foreground/70">
              <span>Items ({qty})</span>
              <span>{inr(qty * PRODUCTS.STARTER_KIT.price)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Bundle savings</span>
                <span>− {inr(savings)}</span>
              </div>
            )}
            <div className="flex justify-between text-foreground/70">
              <span>Shipping</span>
              <span className="text-green-700 font-medium">FREE</span>
            </div>
            <div className="border-t border-foreground/10 pt-3 mt-3 flex justify-between items-end">
              <span className="font-serif text-lg">Total</span>
              <span className="font-serif text-3xl">{inr(sub)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate({ to: "/checkout" })}
            className="mt-6 w-full rounded-full py-4 text-xs tracking-[0.3em] uppercase text-primary-foreground font-semibold"
            style={{ background: "#143A2A" }}
          >
            Proceed to Checkout
          </button>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10.5px] text-foreground/60">
            {TRUST.map(({ Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-[#C9A86A]" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
