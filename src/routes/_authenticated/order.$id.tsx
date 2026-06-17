import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/Navbar";
import { getMyOrder } from "@/lib/orders.functions";
import { inr, formatDate } from "@/lib/format";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/order/$id")({
  head: () => ({ meta: [{ title: "Order Confirmed — VedaGlows" }] }),
  component: OrderPage,
});

function OrderPage() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getMyOrder);
  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder({ data: { id } }),
  });
  const order = data?.order;

  return (
    <main className="min-h-screen bg-[color:var(--ivory)] pb-20">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pt-28 md:pt-32">
        {isLoading || !order ? (
          <p className="text-center text-foreground/60 mt-10">Loading…</p>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 grid place-items-center">
                <Check className="h-8 w-8 text-green-700" />
              </div>
              <h1 className="mt-5 font-serif italic text-4xl">Order Confirmed</h1>
              <p className="mt-2 text-sm text-foreground/60">
                Thank you for choosing VedaGlows. We'll be in touch shortly.
              </p>
              <div className="mt-3 font-mono text-sm text-foreground">{order.order_number}</div>
            </div>

            <div className="mt-8 rounded-3xl bg-white p-6 border border-foreground/5 shadow-sm">
              <div className="text-xs uppercase tracking-widest text-foreground/50">
                Order Summary
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {order.order_items?.map((i: any) => (
                  <div key={i.id} className="flex justify-between">
                    <span>
                      {i.product_name} × {i.quantity}
                    </span>
                    <span>{inr(Number(i.line_total))}</span>
                  </div>
                ))}
                <div className="border-t border-foreground/10 pt-3 mt-3 space-y-1">
                  <div className="flex justify-between text-foreground/70 text-sm">
                    <span>Subtotal</span>
                    <span>{inr(Number(order.subtotal))}</span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-green-700 text-sm">
                      <span>Discount</span>
                      <span>− {inr(Number(order.discount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-foreground/70 text-sm">
                    <span>Shipping</span>
                    <span className="text-green-700">FREE</span>
                  </div>
                  <div className="flex justify-between font-serif text-xl pt-2">
                    <span>Total</span>
                    <span>{inr(Number(order.total))}</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-xl bg-[color:var(--ivory)] p-4 text-sm">
                <div className="font-medium">{order.customer_name}</div>
                <div className="text-foreground/60 text-xs mt-1">
                  {(() => {
                    const a = order.shipping_address as any;
                    return `${a?.line1 ?? ""}, ${a?.city ?? ""}, ${a?.state ?? ""} ${a?.pincode ?? ""}`;
                  })()}
                </div>
              </div>
              <div className="mt-4 flex justify-between text-xs text-foreground/60">
                <span>{formatDate(order.created_at)}</span>
                <span>Payment: {order.payment_method.toUpperCase()}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-center">
              <Link
                to="/account"
                className="rounded-full px-6 py-3 text-xs tracking-widest uppercase border border-foreground/20"
              >
                View Orders
              </Link>
              <Link
                to="/"
                className="rounded-full px-6 py-3 text-xs tracking-widest uppercase text-primary-foreground"
                style={{ background: "#143A2A" }}
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
