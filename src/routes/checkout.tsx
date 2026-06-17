import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/shared/Navbar";
import { useCart } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/products";
import { inr } from "@/lib/format";
import { validateCoupon } from "@/lib/coupons.functions";
import { createOrder } from "@/lib/orders.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Check,
  Truck,
  BadgeCheck,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  ChevronDown,
  ChevronUp,
  Wallet,
  Banknote,
  ArrowRight,
} from "lucide-react";

const kitAsset = "/assets/kit.png";

const INK = "#0E2F25";
const INK_SOFT = "#143A2A";
const IVORY = "#F4ECDC";
const GOLD = "#C9A86A";
const GOLD_SOFT = "#E8C98A";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout — VedaGlows" },
      {
        name: "description",
        content:
          "Complete your VedaGlows order on our secure checkout. Free shipping across India, Cash on Delivery available, 7-day satisfaction promise.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Secure Checkout — VedaGlows" },
      {
        property: "og:description",
        content: "Complete your VedaGlows order securely. Free shipping, COD and a 7-day promise.",
      },
      { property: "og:url", content: "https://heart-hug-nest.lovable.app/checkout" },
    ],
  }),
  component: CheckoutPage,
});

type PaymentMethod = "razorpay" | "cod";
const COD_ADVANCE = 39;

interface Address {
  full_name: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = useCart((s) => s.items);
  const subtotalFn = useCart((s) => s.subtotal);
  const clear = useCart((s) => s.clear);
  const totalQuantity = useCart((s) => s.totalQuantity);
  const setStarterKitQty = useCart((s) => s.setStarterKitQty);

  const [address, setAddress] = useState<Address>({
    full_name: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const validate = useServerFn(validateCoupon);
  const submit = useServerFn(createOrder);

  useEffect(() => {
    if (!user) return;
    setAddress((a) => ({ ...a, email: user.email ?? a.email }));
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (data)
          setAddress((a) => ({ ...a, full_name: data.full_name ?? "", phone: data.phone ?? "" }));
      });
  }, [user]);

  const qty = totalQuantity();
  const sub = subtotalFn();
  const retail = qty * PRODUCTS.STARTER_KIT.price;
  const bundleSavings = Math.max(0, retail - sub);
  const total = Math.max(0, sub - discount);
  const totalSaved = bundleSavings + discount;
  const codFee = payment === "cod" ? COD_ADVANCE : 0;
  const grandTotal = total + codFee;

  const addressValid =
    address.full_name.trim().length > 1 &&
    /^\d{10}$/.test(address.phone.trim()) &&
    /^\S+@\S+\.\S+$/.test(address.email.trim()) &&
    address.line1.trim().length > 2 &&
    address.city.trim().length > 1 &&
    address.state.trim().length > 1 &&
    /^\d{6}$/.test(address.pincode.trim());

  if (qty === 0) {
    return (
      <main className="min-h-screen bg-[color:var(--ivory)]">
        <Navbar />
        <div className="mx-auto max-w-md px-4 pt-32 text-center">
          <h1 className="font-serif italic text-3xl">Your cart is empty</h1>
          <p className="mt-2 text-sm text-foreground/60">Add a Starter Kit to begin your reset.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full px-6 py-3 text-xs tracking-widest uppercase text-primary-foreground"
            style={{ background: INK_SOFT }}
          >
            Shop Now
          </Link>
        </div>
      </main>
    );
  }

  async function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    try {
      const res = await validate({ data: { code, subtotal: sub, quantity: qty } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setDiscount(res.discount);
      setCouponApplied(res.coupon.code);
      toast.success(`Coupon ${res.coupon.code} applied · You save ${inr(res.discount)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Coupon failed";
      toast.error(msg);
    } finally {
      setCouponBusy(false);
    }
  }

  function removeCoupon() {
    setCoupon("");
    setDiscount(0);
    setCouponApplied(null);
  }

  async function placeOrder() {
    if (!addressValid) {
      toast.error("Please complete your address");
      return;
    }
    setSubmitting(true);
    try {
      const paymentBackend: "cod" | "online" = payment === "cod" ? "cod" : "online";
      const res = await submit({
        data: {
          items: items.map((i) => ({
            product_sku: i.sku,
            product_name: i.name,
            quantity: i.quantity,
            unit_price: i.price,
          })),
          address: {
            full_name: address.full_name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country,
          },
          coupon_code: couponApplied,
          payment_method: paymentBackend,
          email: address.email || user?.email || "",
        },
      });
      clear();
      toast.success("Order placed!");
      navigate({ to: "/order/$id", params: { id: res.orderId } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Order failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[color:var(--ivory)] pb-40 md:pb-12">
      <Navbar />

      <div className="mx-auto max-w-[1240px] px-4 md:px-8 pt-20 md:pt-28">
        {/* HEADER */}
        <CheckoutHeader />

        {/* Mobile summary collapsible */}
        <MobileSummaryBar
          open={summaryOpen}
          onToggle={() => setSummaryOpen((v) => !v)}
          total={grandTotal}
          qty={qty}
          totalSaved={totalSaved}
        />

        {/* Mobile expanded summary card — directly under the toggle */}
        {summaryOpen && (
          <div className="lg:hidden mt-3">
            <OrderSummaryCard
              items={items}
              sub={sub}
              retail={retail}
              bundleSavings={bundleSavings}
              discount={discount}
              couponApplied={couponApplied}
              total={grandTotal}
              codFee={codFee}
              totalSaved={totalSaved}
              onCheckout={placeOrder}
              submitting={submitting}
              addressValid={addressValid}
              hideCta
            />
          </div>
        )}

        <div className="mt-5 md:mt-8 grid lg:grid-cols-[1.5fr_1fr] gap-4 md:gap-6 lg:gap-10 items-start">
          {/* LEFT: form */}
          <div className="flex flex-col gap-4 md:gap-5">
            <BundlePicker qty={qty} onChange={setStarterKitQty} />
            <AddressCard address={address} onChange={setAddress} />
            <CouponCard
              coupon={coupon}
              setCoupon={setCoupon}
              applied={couponApplied}
              busy={couponBusy}
              discount={discount}
              onApply={applyCoupon}
              onRemove={removeCoupon}
            />
            <PaymentCard value={payment} onChange={setPayment} total={total} codFee={codFee} />
            <SocialProofCard />
          </div>

          {/* RIGHT: sticky summary (desktop) */}
          <aside className="hidden lg:block lg:sticky lg:top-28">
            <OrderSummaryCard
              items={items}
              sub={sub}
              retail={retail}
              bundleSavings={bundleSavings}
              discount={discount}
              couponApplied={couponApplied}
              total={grandTotal}
              codFee={codFee}
              totalSaved={totalSaved}
              onCheckout={placeOrder}
              submitting={submitting}
              addressValid={addressValid}
            />
          </aside>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <MobileStickyCta
        total={grandTotal}
        onCheckout={placeOrder}
        submitting={submitting}
        addressValid={addressValid}
      />
    </main>
  );
}

/* ─────────────── Header ─────────────── */

function CheckoutHeader() {
  const badges = [
    { Icon: BadgeCheck, label: "COD Available" },
    { Icon: Truck, label: "Free Shipping" },
    { Icon: Lock, label: "Secure Payments" },
    { Icon: ShieldCheck, label: "7-Day Promise" },
  ];
  return (
    <header className="text-center md:text-left">
      <div
        className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-semibold"
        style={{ color: "#1F5A40" }}
      >
        <span
          className="grid place-items-center h-5 w-5 rounded-full"
          style={{ background: "rgba(31,90,64,0.12)" }}
        >
          <Lock className="h-3 w-3" strokeWidth={2.6} />
        </span>
        Secure Checkout
      </div>
      <h1
        className="mt-2 font-serif italic font-light leading-tight"
        style={{ color: INK, fontSize: "clamp(28px, 4vw, 44px)" }}
      >
        VedaGlows 28-Day Skin Reset
      </h1>
      <p className="mt-1 text-sm text-foreground/60">
        Complete your order — encrypted end-to-end, no spam, no resharing.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-[11px] text-foreground/65">
        {badges.map(({ Icon, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" style={{ color: GOLD }} /> {label}
          </span>
        ))}
      </div>
    </header>
  );
}

/* ─────────────── Premium Card wrapper ─────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl md:rounded-3xl p-4 md:p-6 ${className}`}
      style={{
        background: "linear-gradient(180deg, #FFFEFB 0%, #FFFDF7 100%)",
        border: "1px solid rgba(20,58,42,0.08)",
        boxShadow: "0 16px 40px -24px rgba(20,58,42,0.18), 0 2px 6px -2px rgba(20,58,42,0.06)",
      }}
    >
      {children}
    </section>
  );
}

function CardTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1 mb-4">
      <h2
        className="font-serif italic text-[1.2rem] md:text-[1.35rem] leading-none"
        style={{ color: INK }}
      >
        {children}
      </h2>
      {hint && (
        <span className="text-[10px] md:text-[10.5px] tracking-[0.22em] uppercase text-foreground/45">
          {hint}
        </span>
      )}
    </div>
  );
}

/* ─────────────── Bundle Picker ─────────────── */

function BundlePicker({ qty, onChange }: { qty: number; onChange: (n: number) => void }) {
  const tiers = [
    {
      qty: 1,
      price: PRODUCTS.STARTER_KIT.price,
      label: "1 Kit",
      tag: null as string | null,
      perKit: PRODUCTS.STARTER_KIT.price,
    },
    {
      qty: 2,
      price: PRODUCTS.BUNDLE_2.price,
      label: "2 Kits",
      tag: "Best Value",
      perKit: Math.round(PRODUCTS.BUNDLE_2.price / 2),
    },
  ];
  const selected = Math.min(2, Math.max(1, qty));
  return (
    <Card>
      <CardTitle hint="Most choose 2 Kits">Choose your pack</CardTitle>
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {tiers.map((t) => {
          const active = selected === t.qty;
          const isBest = t.qty === 2;
          return (
            <button
              key={t.qty}
              onClick={() => onChange(t.qty)}
              className="relative text-left rounded-2xl p-3 md:p-4 transition-all duration-300"
              style={{
                background: active
                  ? `linear-gradient(160deg, ${INK_SOFT} 0%, ${INK} 100%)`
                  : "rgba(20,58,42,0.03)",
                border: active ? `1px solid ${GOLD}99` : "1px solid rgba(20,58,42,0.1)",
                color: active ? IVORY : INK,
                boxShadow: active ? "0 18px 36px -18px rgba(20,58,42,0.5)" : "none",
              }}
            >
              {t.tag && (
                <span
                  className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8.5px] tracking-[0.22em] uppercase font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{
                    background: isBest ? GOLD : "rgba(20,58,42,0.9)",
                    color: isBest ? INK : IVORY,
                  }}
                >
                  {t.tag}
                </span>
              )}
              <div className="flex items-center justify-between">
                <span
                  className="h-4 w-4 rounded-full grid place-items-center shrink-0"
                  style={{
                    background: active ? IVORY : "transparent",
                    border: `1.5px solid ${active ? IVORY : "rgba(20,58,42,0.3)"}`,
                  }}
                >
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: INK }} />
                  )}
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase opacity-75">{t.label}</span>
              </div>
              <div className="mt-3 font-serif text-2xl md:text-3xl leading-none">
                {inr(t.price)}
              </div>
              <div className="mt-1 text-[10.5px] opacity-65">{inr(t.perKit)}/kit</div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ─────────────── Address Card with floating labels ─────────────── */

function AddressCard({ address, onChange }: { address: Address; onChange: (a: Address) => void }) {
  const upd = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...address, [k]: e.target.value });

  const [pinLookup, setPinLookup] = useState<"idle" | "loading" | "ok" | "fail">("idle");

  // Auto-fetch city + state when pincode reaches 6 digits (India Post API)
  useEffect(() => {
    const pin = address.pincode.trim();
    if (!/^\d{6}$/.test(pin)) {
      setPinLookup("idle");
      return;
    }
    const ctrl = new AbortController();
    setPinLookup("loading");
    fetch(`https://api.postalpincode.in/pincode/${pin}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((res) => {
        const office = res?.[0]?.PostOffice?.[0];
        if (!office) {
          setPinLookup("fail");
          return;
        }
        onChange({
          ...address,
          city: address.city || office.District || office.Block || "",
          state: address.state || office.State || "",
        });
        setPinLookup("ok");
      })
      .catch(() => setPinLookup("fail"));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address.pincode]);

  return (
    <Card>
      <CardTitle hint="Step 1 of 2">Shipping Details</CardTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FloatingInput
          label="Full Name"
          value={address.full_name}
          onChange={upd("full_name")}
          colSpan={2}
          autoComplete="name"
        />
        <FloatingInput
          label="Phone Number"
          value={address.phone}
          onChange={upd("phone")}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
        />
        <FloatingInput
          label="Email"
          value={address.email}
          onChange={upd("email")}
          type="email"
          autoComplete="email"
        />
        <FloatingInput
          label="Address"
          value={address.line1}
          onChange={upd("line1")}
          colSpan={2}
          autoComplete="address-line1"
        />
        <FloatingInput
          label="Landmark (optional)"
          value={address.line2}
          onChange={upd("line2")}
          colSpan={2}
          autoComplete="address-line2"
        />
        <FloatingInput
          label="Pincode"
          value={address.pincode}
          onChange={upd("pincode")}
          inputMode="numeric"
          autoComplete="postal-code"
          hint={
            pinLookup === "loading"
              ? "Looking up city & state…"
              : pinLookup === "ok"
                ? "City & state auto-filled"
                : pinLookup === "fail"
                  ? "Couldn't find that pincode — enter manually"
                  : undefined
          }
        />
        <FloatingInput
          label="City"
          value={address.city}
          onChange={upd("city")}
          autoComplete="address-level2"
        />
        <FloatingInput
          label="State"
          value={address.state}
          onChange={upd("state")}
          autoComplete="address-level1"
        />
        <FloatingInput
          label="Country"
          value={address.country}
          onChange={upd("country")}
          autoComplete="country-name"
        />
      </div>
    </Card>
  );
}

function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  colSpan = 1,
  inputMode,
  autoComplete,
  hint,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  colSpan?: 1 | 2;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  hint?: string;
}) {
  const hasValue = value.length > 0;
  return (
    <label className={`relative block ${colSpan === 2 ? "sm:col-span-2" : ""}`}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder=" "
        className="peer w-full rounded-xl bg-white/70 px-4 pt-5 pb-2 text-[14px] text-foreground placeholder-transparent outline-none transition-all focus:bg-white"
        style={{
          border: "1px solid rgba(20,58,42,0.14)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
      />
      <span
        className={`pointer-events-none absolute left-4 transition-all duration-200 ${
          hasValue
            ? "top-1.5 text-[10px] tracking-[0.18em] uppercase"
            : "top-1/2 -translate-y-1/2 text-[13px]"
        } peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:tracking-[0.18em] peer-focus:uppercase`}
        style={{ color: hasValue ? "rgba(20,58,42,0.55)" : "rgba(20,58,42,0.45)" }}
      >
        {label}
      </span>
      {hint && <span className="mt-1 block text-[10.5px] text-foreground/55 px-1">{hint}</span>}
    </label>
  );
}

/* ─────────────── Coupon Card ─────────────── */

function CouponCard({
  coupon,
  setCoupon,
  applied,
  busy,
  discount,
  onApply,
  onRemove,
}: {
  coupon: string;
  setCoupon: (s: string) => void;
  applied: string | null;
  busy: boolean;
  discount: number;
  onApply: () => void;
  onRemove: () => void;
}) {
  return (
    <Card>
      <div
        className="flex items-center gap-2 text-[10px] tracking-[0.28em] uppercase font-semibold"
        style={{ color: GOLD }}
      >
        <Tag className="h-3.5 w-3.5" /> Have a coupon?
      </div>
      {applied ? (
        <div
          className="mt-3 flex items-center justify-between gap-3 rounded-xl px-4 py-3"
          style={{ background: "rgba(31,90,64,0.08)", border: "1px solid rgba(31,90,64,0.25)" }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="grid place-items-center h-7 w-7 rounded-full"
              style={{ background: "rgba(31,90,64,0.18)", color: "#1F5A40" }}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.8} />
            </span>
            <div>
              <div className="font-mono text-sm tracking-[0.18em]" style={{ color: INK }}>
                {applied}
              </div>
              <div className="text-[11px]" style={{ color: "#1F5A40" }}>
                Coupon applied · You save {inr(discount)}
              </div>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-[10px] tracking-[0.2em] uppercase text-foreground/55 hover:text-foreground"
          >
            Remove
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApply();
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            className="flex-1 rounded-xl bg-white/70 px-4 py-3 text-[13px] tracking-[0.18em] uppercase outline-none focus:bg-white"
            style={{ border: "1px solid rgba(20,58,42,0.14)" }}
          />
          <button
            type="submit"
            disabled={busy || !coupon.trim()}
            className="rounded-xl px-5 text-[11px] tracking-[0.26em] uppercase font-semibold disabled:opacity-50"
            style={{ background: INK, color: IVORY }}
          >
            {busy ? "…" : "Apply"}
          </button>
        </form>
      )}
    </Card>
  );
}

/* ─────────────── Payment Card ─────────────── */

function RazorpayBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold tracking-wide"
      style={{ background: "#0E2C5A", color: "#fff" }}
    >
      <span
        className="grid place-items-center h-3 w-3 rounded-sm font-bold"
        style={{ background: "#3395FF", color: "#0E2C5A", fontSize: 8, lineHeight: 1 }}
      >
        R
      </span>
      Razorpay
    </span>
  );
}

function PayMark({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold tracking-wide"
      style={{ background: "rgba(20,58,42,0.08)", color: "#143A2A" }}
    >
      {children}
    </span>
  );
}

function PaymentCard({
  value,
  onChange,
  total,
  codFee,
}: {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  total: number;
  codFee: number;
}) {
  const methods: {
    id: PaymentMethod;
    label: string;
    sub: string;
    tag?: string;
    Icon: typeof Lock;
  }[] = [
    {
      id: "cod",
      label: "Cash on Delivery",
      sub: `Pay ₹${COD_ADVANCE} advance now · ${inr(total)} on delivery`,
      tag: "Popular",
      Icon: Banknote,
    },
    {
      id: "razorpay",
      label: "Online Payment",
      sub: `Pay full amount (${inr(total)}) via Card, UPI, Netbanking · Powered by Razorpay`,
      tag: "Instant",
      Icon: Wallet,
    },
  ];
  const codBalance = total;
  void codFee;
  return (
    <Card>
      <CardTitle hint="256-bit Encrypted">Payment Method</CardTitle>
      <div className="grid gap-2.5">
        {methods.map((m) => {
          const active = value === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className="relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all"
              style={{
                background: active ? "rgba(20,58,42,0.05)" : "rgba(255,255,255,0.55)",
                border: active ? `1.5px solid ${INK}` : "1px solid rgba(20,58,42,0.1)",
                boxShadow: active ? "0 8px 22px -14px rgba(20,58,42,0.35)" : "none",
              }}
            >
              <span
                className="h-4 w-4 rounded-full grid place-items-center shrink-0"
                style={{ border: `1.5px solid ${active ? INK : "rgba(20,58,42,0.3)"}` }}
              >
                {active && <span className="h-2 w-2 rounded-full" style={{ background: INK }} />}
              </span>
              <m.Icon className="h-4 w-4 shrink-0" style={{ color: active ? INK : GOLD }} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium leading-tight" style={{ color: INK }}>
                  {m.label}
                </div>
                <div className="text-[10.5px] text-foreground/55 leading-snug mt-0.5">{m.sub}</div>
                {m.id === "razorpay" && (
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <RazorpayBadge />
                    <PayMark>VISA</PayMark>
                    <PayMark>MC</PayMark>
                    <PayMark>RuPay</PayMark>
                    <PayMark>UPI</PayMark>
                  </div>
                )}
              </div>
              {m.tag && (
                <span
                  className="text-[9px] tracking-[0.2em] uppercase font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: m.id === "cod" ? "rgba(201,168,106,0.18)" : "rgba(31,90,64,0.12)",
                    color: m.id === "cod" ? GOLD : "#1F5A40",
                  }}
                >
                  {m.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {value === "cod" && (
        <div
          className="mt-4 rounded-2xl p-4"
          style={{
            background:
              "linear-gradient(180deg, rgba(201,168,106,0.10) 0%, rgba(201,168,106,0.04) 100%)",
            border: `1px solid ${GOLD}55`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-serif italic text-[16px]" style={{ color: INK }}>
                Cash on Delivery
              </div>
              <div className="text-[11.5px] mt-0.5" style={{ color: INK_SOFT }}>
                Confirm your order with ₹{COD_ADVANCE} advance payment
              </div>
            </div>
            <div
              className="text-right rounded-xl px-3 py-2 shrink-0"
              style={{ background: "#FFFEFB", border: `1px solid ${GOLD}66` }}
            >
              <div className="text-[9px] tracking-[0.2em] uppercase text-foreground/60">
                Pay Now
              </div>
              <div className="font-serif text-[18px] leading-none" style={{ color: INK }}>
                ₹{COD_ADVANCE}
              </div>
            </div>
          </div>
          <div
            className="mt-3 rounded-xl divide-y text-[12.5px]"
            style={{ background: "#FFFEFB", border: "1px solid rgba(20,58,42,0.08)" }}
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-foreground/70">Advance Payment</span>
              <span style={{ color: INK }}>₹{COD_ADVANCE}</span>
            </div>
            <div
              className="flex items-center justify-between px-3 py-2.5"
              style={{ borderTop: "1px solid rgba(20,58,42,0.08)" }}
            >
              <span className="text-foreground/70">Balance (pay on delivery)</span>
              <span style={{ color: INK }}>{inr(codBalance)}</span>
            </div>
          </div>
          <p className="mt-2 text-center text-[10.5px] text-foreground/55">
            Secure payment powered by Razorpay
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10.5px] text-foreground/55">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-3 w-3" style={{ color: GOLD }} /> 256-bit Encrypted
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3" style={{ color: GOLD }} /> PCI-DSS Compliant
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck className="h-3 w-3" style={{ color: GOLD }} /> No card details stored
        </span>
      </div>
    </Card>
  );
}

/* ─────────────── Social Proof ─────────────── */

function SocialProofCard() {
  return (
    <div
      className="rounded-3xl p-5 md:p-6 flex items-center gap-4"
      style={{
        background: `linear-gradient(135deg, ${INK_SOFT} 0%, ${INK} 100%)`,
        color: IVORY,
        boxShadow: "0 18px 40px -22px rgba(20,58,42,0.5)",
      }}
    >
      <div
        className="hidden sm:flex h-12 w-12 rounded-full shrink-0 items-center justify-center"
        style={{ background: "rgba(244,236,220,0.08)", border: `1px solid ${GOLD}55` }}
      >
        <Sparkles className="h-5 w-5" style={{ color: GOLD_SOFT }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="inline-flex items-center gap-1" style={{ color: GOLD_SOFT }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" />
          ))}
          <span className="ml-1.5 text-[12px]" style={{ color: IVORY }}>
            4.8/5
          </span>
        </div>
        <p className="mt-1 font-serif italic text-[15px] leading-snug">
          7,200+ customers have completed this ritual.
        </p>
      </div>
    </div>
  );
}

/* ─────────────── Order Summary Card ─────────────── */

function OrderSummaryCard({
  items,
  sub,
  retail,
  bundleSavings,
  discount,
  couponApplied,
  total,
  codFee,
  totalSaved,
  onCheckout,
  submitting,
  addressValid,
  hideCta,
}: {
  items: ReturnType<typeof useCart.getState>["items"];
  sub: number;
  retail: number;
  bundleSavings: number;
  discount: number;
  couponApplied: string | null;
  total: number;
  codFee: number;
  totalSaved: number;
  onCheckout: () => void;
  submitting: boolean;
  addressValid: boolean;
  hideCta?: boolean;
}) {
  const qty = items.reduce((s, i) => s + i.quantity, 0);
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FFFEFB 0%, #F7F1E5 100%)",
        border: "1px solid rgba(20,58,42,0.1)",
        boxShadow: "0 24px 60px -28px rgba(20,58,42,0.32), 0 2px 8px -2px rgba(20,58,42,0.06)",
      }}
    >
      <div className="p-4 md:p-6">
        <div className="flex items-end justify-between gap-3">
          <h3 className="font-serif italic text-[1.35rem]" style={{ color: INK }}>
            Order Summary
          </h3>
          {totalSaved > 0 && (
            <span
              className="text-[9.5px] tracking-[0.22em] uppercase font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(31,90,64,0.1)", color: "#1F5A40" }}
            >
              You save {inr(totalSaved)}
            </span>
          )}
        </div>

        {/* Items */}
        <div className="mt-4 flex flex-col gap-3">
          {items.map((it) => (
            <div key={it.sku} className="flex gap-3 items-center">
              <div
                className="h-16 w-16 rounded-xl overflow-hidden shrink-0 relative"
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
                <span
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 grid place-items-center text-[10px] font-semibold rounded-full"
                  style={{ background: INK, color: IVORY }}
                >
                  {it.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-[14px] leading-tight" style={{ color: INK }}>
                  {it.name}
                </div>
                <div className="text-[11px] text-foreground/55 mt-0.5">
                  Daily Clean · Glow Repair · Deep Detox
                </div>
              </div>
              <div className="font-serif text-[15px]" style={{ color: INK }}>
                {inr(it.price * it.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="mt-5 pt-4 border-t border-foreground/10 flex flex-col gap-1.5 text-[13px]">
          <Row label={`Subtotal (${qty} ${qty === 1 ? "item" : "items"})`} value={inr(retail)} />
          {bundleSavings > 0 && (
            <Row label="Bundle discount" value={`− ${inr(bundleSavings)}`} positive />
          )}
          {discount > 0 && (
            <Row label={`Coupon (${couponApplied})`} value={`− ${inr(discount)}`} positive />
          )}
          <Row label="Shipping" value="FREE" positive />
          {codFee > 0 && <Row label="COD advance fee" value={`+ ${inr(codFee)}`} />}
        </div>

        {/* Total */}
        <div
          className="mt-4 rounded-2xl px-4 py-4 flex items-end justify-between"
          style={{
            background: `linear-gradient(135deg, ${INK_SOFT} 0%, ${INK} 100%)`,
            color: IVORY,
          }}
        >
          <div>
            <div className="text-[10px] tracking-[0.28em] uppercase opacity-70">Total</div>
            <div className="text-[10px] opacity-65 mt-0.5">Inclusive of all taxes</div>
          </div>
          <div className="font-serif text-[28px] md:text-[34px] leading-none">{inr(total)}</div>
        </div>

        {/* Trust row */}
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-[10.5px] text-foreground/65">
          {[
            { Icon: Truck, label: "Free Shipping" },
            { Icon: BadgeCheck, label: "COD Available" },
            { Icon: Lock, label: "Secure Checkout" },
            { Icon: ShieldCheck, label: "7-Day Promise" },
          ].map(({ Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <Icon className="h-3 w-3" style={{ color: GOLD }} />
              {label}
            </span>
          ))}
        </div>

        {/* CTA */}
        {!hideCta && (
          <button
            onClick={onCheckout}
            disabled={submitting || !addressValid}
            className="group mt-5 w-full inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-4 text-[12px] tracking-[0.28em] uppercase font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            style={{
              background: addressValid
                ? `linear-gradient(135deg, #1F5A40 0%, ${INK_SOFT} 55%, ${INK} 100%)`
                : "rgba(20,58,42,0.4)",
              color: IVORY,
              boxShadow: addressValid
                ? "0 22px 44px -16px rgba(20,58,42,0.55), 0 0 0 1px rgba(244,236,220,0.18) inset"
                : "none",
            }}
          >
            {submitting ? (
              "Placing Order…"
            ) : (
              <>
                Complete Order · {inr(total)}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        )}
        {!hideCta && !addressValid && (
          <p className="mt-2 text-center text-[11px] text-foreground/55">
            Complete your shipping details to continue
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-foreground/65">{label}</span>
      <span style={{ color: positive ? "#1F5A40" : INK, fontWeight: positive ? 600 : 500 }}>
        {value}
      </span>
    </div>
  );
}

/* ─────────────── Mobile summary bar (collapsible) ─────────────── */

function MobileSummaryBar({
  open,
  onToggle,
  total,
  qty,
  totalSaved,
}: {
  open: boolean;
  onToggle: () => void;
  total: number;
  qty: number;
  totalSaved: number;
}) {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden mt-5 w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5"
      style={{
        background: "rgba(20,58,42,0.05)",
        border: "1px solid rgba(20,58,42,0.1)",
      }}
    >
      <div className="flex items-center gap-2 text-left">
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        <div>
          <div className="text-[11px] text-foreground/60">
            {open ? "Hide" : "Show"} order summary
          </div>
          {totalSaved > 0 && (
            <div className="text-[10.5px]" style={{ color: "#1F5A40" }}>
              You save {inr(totalSaved)}
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] tracking-[0.22em] uppercase text-foreground/55">
          {qty} {qty === 1 ? "item" : "items"}
        </div>
        <div className="font-serif text-lg" style={{ color: INK }}>
          {inr(total)}
        </div>
      </div>
    </button>
  );
}

/* ─────────────── Mobile sticky CTA ─────────────── */

function MobileStickyCta({
  total,
  onCheckout,
  submitting,
  addressValid,
}: {
  total: number;
  onCheckout: () => void;
  submitting: boolean;
  addressValid: boolean;
}) {
  return (
    <div
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3"
      style={{
        background: "linear-gradient(180deg, rgba(247,241,229,0) 0%, #F7F1E5 60%)",
      }}
    >
      <button
        onClick={onCheckout}
        disabled={submitting || !addressValid}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full px-5 py-4 text-[12px] tracking-[0.28em] uppercase font-semibold disabled:opacity-50"
        style={{
          background: addressValid
            ? `linear-gradient(135deg, #1F5A40 0%, ${INK_SOFT} 55%, ${INK} 100%)`
            : "rgba(20,58,42,0.4)",
          color: IVORY,
          boxShadow: "0 20px 40px -14px rgba(20,58,42,0.55)",
        }}
      >
        {submitting ? (
          "Placing…"
        ) : (
          <>
            Complete Order · {inr(total)}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
