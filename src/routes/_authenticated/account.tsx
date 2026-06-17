import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/shared/Navbar";
import { listMyOrders } from "@/lib/orders.functions";
import { inr, formatDate } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/lib/cart-store";
import {
  LogOut,
  Package,
  ShoppingBag,
  Sparkles,
  Coins,
  Truck,
  MapPin,
  Bell,
  User,
  ShieldCheck,
  Gift,
  Heart,
  Ticket,
  ChevronRight,
  CheckCircle2,
  Clock,
  Copy,
  Plus,
  Edit3,
  Trash2,
  ArrowRight,
  Star,
  Activity,
  Home,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "My Account — VedaGlows" }] }),
  component: AccountPage,
});

type TabId = "overview" | "orders" | "addresses" | "rewards" | "settings";

const STATUS_META: Record<
  string,
  { label: string; bg: string; fg: string; dot: string; icon: any }
> = {
  pending: { label: "Pending", bg: "#FFF4DD", fg: "#8A5A00", dot: "#D4A23A", icon: Clock },
  confirmed: {
    label: "Confirmed",
    bg: "#E6F0FF",
    fg: "#1E3A8A",
    dot: "#3B6FE0",
    icon: CheckCircle2,
  },
  processing: { label: "Processing", bg: "#EEE7FF", fg: "#4B2A8A", dot: "#7A5AE0", icon: Package },
  shipped: { label: "Shipped", bg: "#E1F2EA", fg: "#0F4A2C", dot: "#3F8E5E", icon: Truck },
  delivered: {
    label: "Delivered",
    bg: "#143A2A",
    fg: "#F4ECDC",
    dot: "#C9A24C",
    icon: CheckCircle2,
  },
  cancelled: { label: "Cancelled", bg: "#FBE6E6", fg: "#8A1F1F", dot: "#C03B3B", icon: Clock },
};

function AccountPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name?: string | null; phone?: string | null }>({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<TabId>("overview");
  const fetchOrders = useServerFn(listMyOrders);
  const { data } = useQuery({ queryKey: ["my-orders"], queryFn: () => fetchOrders() });
  const cart = useCart();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (data) setProfile({ full_name: data.full_name, phone: data.phone });
      });
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profile.full_name, phone: profile.phone })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  }

  async function signOut() {
    cart.clear();
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const orders = data?.orders ?? [];
  const stats = useMemo(() => {
    const nonCancelled = orders.filter((o: any) => o.status !== "cancelled");
    const spent = nonCancelled.reduce((s: number, o: any) => s + Number(o.total), 0);
    const saved = nonCancelled.reduce((s: number, o: any) => s + Number(o.discount ?? 0), 0);
    const items = nonCancelled.reduce(
      (s: number, o: any) =>
        s + (o.order_items?.reduce((q: number, i: any) => q + i.quantity, 0) ?? 0),
      0,
    );
    const points = Math.floor(spent / 10);
    return { orderCount: orders.length, spent, saved, items, points };
  }, [orders]);

  const firstName = profile.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Friend";
  const initials = (profile.full_name ?? user?.email ?? "?")
    .split(/[ @]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  // Tier: Silver < 500, Gold 500–1999, Platinum 2000+
  const tierGoldAt = 500;
  const tierPlatinumAt = 2000;
  const tier =
    stats.spent >= tierPlatinumAt ? "Platinum" : stats.spent >= tierGoldAt ? "Gold" : "Silver";
  const nextTierAt =
    tier === "Silver" ? tierGoldAt : tier === "Gold" ? tierPlatinumAt : tierPlatinumAt;
  const tierProgress = Math.min(100, (stats.spent / nextTierAt) * 100);
  const toNextTier = Math.max(0, nextTierAt - stats.spent);

  const referralCode = `VEDA-${(user?.id ?? "0000").slice(0, 6).toUpperCase()}`;

  // Recent activity
  const activity: { icon: any; label: string; ts: string }[] = [];
  orders.slice(0, 3).forEach((o: any) => {
    activity.push({
      icon: Package,
      label: `Order ${o.order_number} • ${STATUS_META[o.status]?.label ?? o.status}`,
      ts: o.created_at,
    });
    if (o.coupon_code)
      activity.push({ icon: Ticket, label: `Coupon ${o.coupon_code} applied`, ts: o.created_at });
  });
  activity.push({
    icon: User,
    label: "Account created",
    ts: user?.created_at ?? new Date().toISOString(),
  });

  // Saved addresses: latest from orders + local additions
  const orderAddresses = orders
    .map((o: any) => o.shipping_address)
    .filter((a: any) => a && a.line1)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F5F2EA] via-[#F5F2EA] to-[#EDE6D5] pb-32 md:pb-12">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pt-24 md:pt-28">
        {/* Welcome hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#143A2A] via-[#1a4632] to-[#0F2A1F] p-6 md:p-8 text-[#F4ECDC] shadow-xl">
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#D4B978]/15 blur-2xl" />
          <div className="absolute -left-12 -bottom-12 h-56 w-56 rounded-full bg-[#3F8E5E]/15 blur-3xl" />
          <div className="relative flex flex-wrap items-center gap-5 justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-[#D4B978] to-[#9A7B36] grid place-items-center text-[#143A2A] font-serif text-2xl md:text-3xl font-bold shadow-lg ring-4 ring-white/10 shrink-0">
                {initials || "V"}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#D4B978] mb-1 flex items-center gap-2">
                  <Sparkles className="h-3 w-3" /> {tier} Member
                </div>
                <h1 className="font-serif text-3xl md:text-4xl leading-tight">
                  Welcome back, <span className="italic">{firstName}</span>{" "}
                  <span className="not-italic">👋</span>
                </h1>
                <p className="text-sm text-[#F4ECDC]/70 mt-1 max-w-md">
                  Manage your orders, track deliveries, and continue your skin reset journey.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur hover:bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.18em] font-semibold"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Shop now
              </Link>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 px-3.5 py-2 text-xs uppercase tracking-[0.18em] font-semibold"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={<Package className="h-4 w-4" />}
            label="Orders Placed"
            value={String(stats.orderCount)}
            accent="#143A2A"
          />
          <StatCard
            icon={<Coins className="h-4 w-4" />}
            label="Total Saved"
            value={inr(stats.saved)}
            accent="#3F8E5E"
          />
          <StatCard
            icon={<Star className="h-4 w-4" />}
            label="Loyalty Points"
            value={stats.points.toString()}
            accent="#C9A24C"
          />
          <StatCard
            icon={<ShoppingBag className="h-4 w-4" />}
            label="Items Purchased"
            value={String(stats.items)}
            accent="#8A6A1F"
          />
        </div>

        {/* Tabs */}
        <div className="mt-6 sticky top-16 z-20 -mx-4 px-4 py-2 bg-[#F5F2EA]/85 backdrop-blur md:relative md:top-auto md:mx-0 md:px-0 md:py-0 md:bg-transparent md:backdrop-blur-0">
          <div className="flex items-center gap-1 overflow-x-auto bg-white border border-foreground/8 rounded-full p-1 shadow-sm w-fit max-w-full">
            {(
              [
                ["overview", "Overview", Activity],
                ["orders", "Orders", Package],
                ["addresses", "Addresses", MapPin],
                ["rewards", "Rewards", Gift],
                ["settings", "Settings", User],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id as TabId)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  tab === id
                    ? "bg-[#143A2A] text-[#F4ECDC]"
                    : "text-foreground/65 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          {tab === "overview" && (
            <OverviewTab
              orders={orders}
              activity={activity}
              onShop={() => navigate({ to: "/" })}
              onTab={setTab}
            />
          )}
          {tab === "orders" && <OrdersTab orders={orders} onShop={() => navigate({ to: "/" })} />}
          {tab === "addresses" && <AddressesTab addresses={orderAddresses} />}
          {tab === "rewards" && (
            <RewardsTab
              points={stats.points}
              saved={stats.saved}
              tier={tier}
              nextTierAt={nextTierAt}
              toNextTier={toNextTier}
              progress={tierProgress}
              referralCode={referralCode}
            />
          )}
          {tab === "settings" && (
            <SettingsTab
              email={user?.email ?? ""}
              profile={profile}
              setProfile={setProfile}
              saving={saving}
              onSave={saveProfile}
            />
          )}
        </div>
      </div>

      {/* Mobile sticky bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-foreground/8 shadow-[0_-4px_24px_rgba(20,58,42,0.08)]">
        <div className="grid grid-cols-5 max-w-md mx-auto">
          <BottomItem to="/" icon={<Home className="h-4 w-4" />} label="Home" />
          <BottomItem to="/" icon={<ShoppingBag className="h-4 w-4" />} label="Shop" />
          <BottomItem to="/" icon={<ShoppingCart className="h-4 w-4" />} label="Cart" />
          <BottomItem
            to="/account"
            icon={<Package className="h-4 w-4" />}
            label="Orders"
            onClick={() => setTab("orders")}
          />
          <BottomItem
            to="/account"
            icon={<User className="h-4 w-4" />}
            label="Account"
            active
            onClick={() => setTab("overview")}
          />
        </div>
      </nav>
    </main>
  );
}

/* ─── Stat ───────────────────────────────────────── */
function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-foreground/8 p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div
        className="absolute inset-x-0 bottom-0 h-1"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}80)` }}
      />
      <div className="flex items-center justify-between mb-2">
        <div
          className="h-8 w-8 rounded-lg grid place-items-center"
          style={{ background: `${accent}15`, color: accent }}
        >
          {icon}
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-foreground/55 font-semibold">
        {label}
      </div>
      <div className="font-serif text-2xl md:text-3xl text-[#143A2A] mt-1 tabular-nums">
        {value}
      </div>
    </div>
  );
}

/* ─── Overview Tab ───────────────────────────────── */
function OverviewTab({
  orders,
  activity,
  onShop,
  onTab,
}: {
  orders: any[];
  activity: any[];
  onShop: () => void;
  onTab: (t: TabId) => void;
}) {
  const recent = orders.slice(0, 3);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <SectionCard
          title="Recent Orders"
          right={
            <button
              onClick={() => onTab("orders")}
              className="text-xs font-semibold text-[#143A2A] inline-flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          }
        >
          {recent.length === 0 ? (
            <EmptyOrders onShop={onShop} />
          ) : (
            <div className="space-y-3">
              {recent.map((o: any) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Activity">
          <ol className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-px before:bg-foreground/10">
            {activity.slice(0, 5).map((a, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[18px] top-1 h-3 w-3 rounded-full bg-[#143A2A] ring-4 ring-[#F5F2EA]" />
                <div className="flex items-center gap-2 text-sm">
                  <a.icon className="h-3.5 w-3.5 text-[#143A2A]/70" />
                  <span className="font-medium">{a.label}</span>
                </div>
                <div className="text-[11px] text-foreground/50 mt-0.5">{formatDate(a.ts)}</div>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>

      <div className="space-y-5">
        <SectionCard title="Quick Actions" pad="p-3">
          <div className="grid grid-cols-2 gap-2">
            <QuickAction
              icon={<ShoppingBag className="h-4 w-4" />}
              label="Shop Again"
              onClick={onShop}
            />
            <QuickAction
              icon={<Truck className="h-4 w-4" />}
              label="Track Orders"
              onClick={() => onTab("orders")}
            />
            <QuickAction
              icon={<Ticket className="h-4 w-4" />}
              label="Coupons"
              onClick={() => onTab("rewards")}
            />
            <QuickAction icon={<Heart className="h-4 w-4" />} label="Wishlist" onClick={onShop} />
            <QuickAction
              icon={<MapPin className="h-4 w-4" />}
              label="Addresses"
              onClick={() => onTab("addresses")}
            />
            <QuickAction
              icon={<User className="h-4 w-4" />}
              label="Edit Profile"
              onClick={() => onTab("settings")}
            />
          </div>
        </SectionCard>

        <div className="rounded-2xl bg-gradient-to-br from-[#D4B978] to-[#9A7B36] p-5 text-[#143A2A] shadow-lg">
          <Gift className="h-5 w-5 mb-2" />
          <div className="font-serif text-xl leading-tight">Refer a friend</div>
          <p className="text-xs text-[#143A2A]/75 mt-1 mb-3">
            Give ₹100, get ₹100 toward your next order.
          </p>
          <button
            onClick={() => onTab("rewards")}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#143A2A] text-[#F4ECDC] py-2 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#0F2A1F]"
          >
            Get your code <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Orders Tab ─────────────────────────────────── */
function OrdersTab({ orders, onShop }: { orders: any[]; onShop: () => void }) {
  return (
    <SectionCard title="Order History">
      {orders.length === 0 ? (
        <EmptyOrders onShop={onShop} />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function OrderCard({ order }: { order: any }) {
  const meta = STATUS_META[order.status] ?? STATUS_META.pending;
  const Icon = meta.icon;
  const firstItem = order.order_items?.[0];
  const itemCount = order.order_items?.reduce((s: number, i: any) => s + i.quantity, 0) ?? 0;
  return (
    <div className="group rounded-2xl border border-foreground/8 bg-white p-4 md:p-5 hover:border-[#143A2A]/20 hover:shadow-md transition-all">
      <div className="flex flex-wrap items-start gap-4">
        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-[#F5F2EA] to-[#E8DFC9] grid place-items-center shrink-0 ring-1 ring-foreground/5">
          <Package className="h-6 w-6 text-[#143A2A]/60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-serif text-lg leading-none text-[#143A2A]">
              {firstItem?.product_name ?? "Order"}
            </span>
            {itemCount > 1 && (
              <span className="text-[10px] text-foreground/55">+{itemCount - 1} more</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-mono text-foreground/60">{order.order_number}</span>
            <span className="text-foreground/30">•</span>
            <span className="text-foreground/60">{formatDate(order.created_at)}</span>
          </div>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: meta.bg, color: meta.fg }}
            >
              <Icon className="h-3 w-3" /> {meta.label}
            </span>
            {order.coupon_code && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-[#D4B978]/15 text-[#8A6A1F] px-2 py-0.5 rounded-md">
                <Ticket className="h-2.5 w-2.5" /> {order.coupon_code}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-serif text-2xl text-[#143A2A] tabular-nums">
            {inr(Number(order.total))}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-foreground/50 font-semibold">
            Total
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-foreground/5">
        <Link
          to="/order/$id"
          params={{ id: order.id }}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#143A2A] text-[#F4ECDC] px-4 py-2 text-[11px] uppercase tracking-[0.16em] font-semibold hover:bg-[#0F2A1F]"
        >
          View Details <ChevronRight className="h-3 w-3" />
        </Link>
        {["shipped", "processing", "confirmed"].includes(order.status) && (
          <button className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-4 py-2 text-[11px] uppercase tracking-[0.16em] font-semibold text-foreground/75 hover:bg-foreground/5">
            <Truck className="h-3 w-3" /> Track Order
          </button>
        )}
        <button className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 px-4 py-2 text-[11px] uppercase tracking-[0.16em] font-semibold text-foreground/75 hover:bg-foreground/5">
          <ShoppingBag className="h-3 w-3" /> Buy Again
        </button>
      </div>
    </div>
  );
}

function EmptyOrders({ onShop }: { onShop: () => void }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#F5F2EA] to-[#EDE6D5] p-8 md:p-10 text-center border border-dashed border-foreground/15">
      <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-[#143A2A] to-[#1f4a36] grid place-items-center text-[#D4B978] shadow-lg mb-4">
        <Sparkles className="h-8 w-8" />
      </div>
      <h3 className="font-serif italic text-2xl md:text-3xl text-[#143A2A]">
        Start Your Skin Reset Journey
      </h3>
      <p className="text-sm text-foreground/65 mt-2 max-w-sm mx-auto">
        Your VedaGlows Starter Kit unlocks a 30-day reset for clearer, calmer skin.
      </p>
      <button
        onClick={onShop}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#143A2A] text-[#F4ECDC] px-6 py-3 text-xs uppercase tracking-[0.22em] font-semibold hover:bg-[#0F2A1F] shadow-lg"
      >
        <ShoppingBag className="h-3.5 w-3.5" /> Shop Now
      </button>
    </div>
  );
}

/* ─── Addresses Tab ──────────────────────────────── */
function AddressesTab({ addresses }: { addresses: any[] }) {
  return (
    <SectionCard
      title="Saved Addresses"
      right={
        <button className="inline-flex items-center gap-1.5 rounded-full bg-[#143A2A] text-[#F4ECDC] px-3.5 py-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold hover:bg-[#0F2A1F]">
          <Plus className="h-3 w-3" /> Add Address
        </button>
      }
    >
      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-foreground/15 p-8 text-center">
          <MapPin className="h-7 w-7 mx-auto text-foreground/40 mb-2" />
          <p className="text-sm text-foreground/60">
            No saved addresses yet. Add one to check out faster.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {addresses.map((a, i) => (
            <div
              key={i}
              className="relative rounded-2xl border border-foreground/8 bg-white p-4 hover:border-[#143A2A]/20 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-[#143A2A]/8 text-[#143A2A] grid place-items-center shrink-0">
                  <Home className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{a.full_name}</span>
                    {i === 0 && (
                      <span className="text-[9px] uppercase tracking-widest bg-[#D4B978]/20 text-[#8A6A1F] px-1.5 py-0.5 rounded font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/65 leading-relaxed">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}
                    <br />
                    {a.city}, {a.state} {a.pincode}
                  </p>
                  <p className="text-xs text-foreground/50 mt-1">{a.phone}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-1 pt-3 border-t border-foreground/5">
                <button className="text-[10px] uppercase tracking-widest font-semibold text-foreground/65 hover:text-foreground inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-foreground/5">
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
                <button className="text-[10px] uppercase tracking-widest font-semibold text-foreground/65 hover:text-red-700 inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-foreground/5">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
                {i !== 0 && (
                  <button className="ml-auto text-[10px] uppercase tracking-widest font-semibold text-[#143A2A] inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-foreground/5">
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ─── Rewards Tab ────────────────────────────────── */
function RewardsTab({
  points,
  saved,
  tier,
  nextTierAt,
  toNextTier,
  progress,
  referralCode,
}: {
  points: number;
  saved: number;
  tier: string;
  nextTierAt: number;
  toNextTier: number;
  progress: number;
  referralCode: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-[#143A2A] via-[#1a4632] to-[#0F2A1F] p-6 md:p-7 text-[#F4ECDC] shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#D4B978]/15 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#D4B978] mb-2">
            <Sparkles className="h-3 w-3" /> VedaGlows Rewards
          </div>
          <div className="font-serif text-4xl md:text-5xl tabular-nums">
            {points.toLocaleString()}
          </div>
          <div className="text-sm text-[#F4ECDC]/70 mt-1">
            Available points • Lifetime saved {inr(saved)}
          </div>

          <div className="mt-6 bg-white/8 rounded-2xl p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs">
                <span className="text-[#D4B978] font-semibold">{tier}</span>
                <span className="text-[#F4ECDC]/60">
                  {" "}
                  → Next: {tier === "Silver" ? "Gold" : tier === "Gold" ? "Platinum" : "Platinum"}
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#F4ECDC]/60 font-semibold tabular-nums">
                {Math.round(progress)}%
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D4B978] to-[#f0d78c] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[#F4ECDC]/70 mt-2">
              {toNextTier > 0 ? (
                <>
                  Spend <span className="font-semibold text-[#D4B978]">{inr(toNextTier)}</span> more
                  to unlock {tier === "Silver" ? "Gold" : "Platinum"} Status
                </>
              ) : (
                <>You've reached the top tier — enjoy exclusive perks!</>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-foreground/8 p-6 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#8A6A1F] font-semibold">
          <Gift className="h-3 w-3" /> Refer & Earn
        </div>
        <h3 className="font-serif text-2xl mt-1 text-[#143A2A]">Give ₹100, get ₹100</h3>
        <p className="text-xs text-foreground/60 mt-1">
          Your friends get a discount, you earn rewards on every signup.
        </p>

        <div className="mt-4 rounded-xl border-2 border-dashed border-[#143A2A]/20 bg-[#F5F2EA] p-3 flex items-center gap-2">
          <code className="flex-1 font-mono text-sm font-bold text-[#143A2A] tracking-wider truncate">
            {referralCode}
          </code>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(referralCode);
              toast.success("Code copied");
            }}
            className="h-8 w-8 grid place-items-center rounded-lg bg-[#143A2A] text-[#F4ECDC] hover:bg-[#0F2A1F]"
            aria-label="Copy referral code"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>

        <button className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#143A2A] text-[#F4ECDC] py-2.5 text-xs uppercase tracking-[0.18em] font-semibold hover:bg-[#0F2A1F]">
          <Gift className="h-3.5 w-3.5" /> Share with friends
        </button>
      </div>

      <div className="lg:col-span-3 grid sm:grid-cols-3 gap-3">
        <PerkCard
          tier="Silver"
          desc="Free shipping over ₹699"
          active={tier === "Silver" || tier === "Gold" || tier === "Platinum"}
        />
        <PerkCard
          tier="Gold"
          desc="Early access + birthday gift"
          active={tier === "Gold" || tier === "Platinum"}
          highlight={tier === "Gold"}
        />
        <PerkCard
          tier="Platinum"
          desc="2× points + personal stylist"
          active={tier === "Platinum"}
          highlight={tier === "Platinum"}
        />
      </div>
    </div>
  );
}

function PerkCard({
  tier,
  desc,
  active,
  highlight,
}: {
  tier: string;
  desc: string;
  active: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        highlight
          ? "bg-gradient-to-br from-[#D4B978]/20 to-[#D4B978]/5 border-[#D4B978]/40"
          : active
            ? "bg-white border-foreground/10"
            : "bg-white/50 border-foreground/8 opacity-60"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#143A2A]">
          {tier}
        </span>
        {active && <ShieldCheck className="h-4 w-4 text-[#3F8E5E]" />}
      </div>
      <p className="text-sm text-foreground/75 leading-snug">{desc}</p>
    </div>
  );
}

/* ─── Settings Tab ───────────────────────────────── */
function SettingsTab({
  email,
  profile,
  setProfile,
  saving,
  onSave,
}: {
  email: string;
  profile: any;
  setProfile: (p: any) => void;
  saving: boolean;
  onSave: () => void;
}) {
  const inputCls =
    "w-full rounded-xl border border-foreground/10 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#143A2A]/40 focus:ring-2 focus:ring-[#143A2A]/10 transition";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <SectionCard
        className="lg:col-span-2"
        title="Profile Information"
        desc="Update your name, contact details, and password."
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <Labelled label="Full name">
            <input
              className={inputCls}
              value={profile.full_name ?? ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </Labelled>
          <Labelled label="Phone">
            <input
              className={inputCls}
              value={profile.phone ?? ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </Labelled>
          <Labelled label="Email">
            <input disabled className={`${inputCls} bg-foreground/5`} value={email} />
          </Labelled>
          <Labelled label="Password">
            <button className="w-full rounded-xl border border-foreground/10 bg-white px-4 py-2.5 text-sm text-left text-foreground/70 hover:border-foreground/25">
              Change password →
            </button>
          </Labelled>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="mt-5 rounded-full px-6 py-2.5 text-xs uppercase tracking-[0.22em] font-semibold text-[#F4ECDC] bg-[#143A2A] hover:bg-[#0F2A1F] disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </SectionCard>

      <SectionCard title="Notifications" desc="Choose how you'd like us to reach you.">
        <PrefRow
          icon={<Bell className="h-3.5 w-3.5" />}
          label="Order updates"
          desc="Status, shipping, delivery"
          defaultOn
        />
        <PrefRow
          icon={<Ticket className="h-3.5 w-3.5" />}
          label="Offers & coupons"
          desc="New drops and sales"
          defaultOn
        />
        <PrefRow
          icon={<Sparkles className="h-3.5 w-3.5" />}
          label="Tips & rituals"
          desc="Skin reset routines"
        />
      </SectionCard>
    </div>
  );
}

function PrefRow({
  icon,
  label,
  desc,
  defaultOn,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-foreground/5 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-[#143A2A]/8 text-[#143A2A] grid place-items-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-foreground/55">{desc}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${on ? "bg-[#143A2A]" : "bg-foreground/15"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  );
}

/* ─── Generic helpers ────────────────────────────── */
function SectionCard({
  title,
  desc,
  right,
  children,
  className = "",
  pad = "p-5 md:p-6",
}: {
  title: string;
  desc?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  pad?: string;
}) {
  return (
    <section
      className={`rounded-3xl bg-white border border-foreground/8 shadow-sm ${pad} ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-serif text-xl text-[#143A2A] leading-tight">{title}</h2>
          {desc && <p className="text-xs text-foreground/55 mt-1">{desc}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.18em] text-foreground/50 mb-1.5 font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl p-3 border border-foreground/8 bg-white hover:bg-[#F5F2EA] hover:border-[#143A2A]/15 transition-all text-left flex items-center gap-2.5"
    >
      <div className="h-9 w-9 rounded-lg bg-[#143A2A]/8 text-[#143A2A] grid place-items-center group-hover:bg-[#143A2A] group-hover:text-[#F4ECDC] transition-colors shrink-0">
        {icon}
      </div>
      <span className="text-xs font-semibold text-foreground/80 leading-tight">{label}</span>
    </button>
  );
}

function BottomItem({
  to,
  icon,
  label,
  active,
  onClick,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to as any}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wider ${
        active ? "text-[#143A2A]" : "text-foreground/55"
      }`}
    >
      <span className={active ? "text-[#143A2A]" : "text-foreground/55"}>{icon}</span>
      {label}
    </Link>
  );
}
