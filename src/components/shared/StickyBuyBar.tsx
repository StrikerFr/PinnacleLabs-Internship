import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useCartDrawer } from "@/lib/cart-drawer-store";
import { inr } from "@/lib/format";
import { PRODUCTS } from "@/lib/products";

export function StickyBuyBar() {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const totalQuantity = useCart((s) => s.totalQuantity());
  const addStarterKit = useCart((s) => s.addStarterKit);
  const openDrawer = useCartDrawer((s) => s.open);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [footerVisible, setFooterVisible] = useState(false);
  useEffect(() => {
    const footer = document.getElementById("site-footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0,
    });
    io.observe(footer);
    return () => io.disconnect();
  }, [pathname]);

  if (/^\/(cart|checkout|admin|auth|account|order)/.test(pathname)) return null;

  const hasItems = mounted && totalQuantity > 0;

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)] transition-all duration-300"
      style={{
        opacity: footerVisible ? 0 : 1,
        transform: footerVisible ? "translateY(120%)" : "translateY(0)",
        pointerEvents: footerVisible ? "none" : "auto",
      }}
      aria-hidden={footerVisible}
    >
      <div
        className="mx-3 mb-3 rounded-full flex items-center justify-between gap-3 px-4 py-3"
        style={{
          background: "rgba(20,58,42,0.96)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 40px -10px rgba(20,58,42,0.4)",
        }}
      >
        <div className="text-[#F4ECDC] leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] opacity-70">Starter Kit</div>
          <div className="font-serif text-lg">{inr(PRODUCTS.STARTER_KIT.price)}</div>
        </div>
        <button
          onClick={() => {
            if (!hasItems) addStarterKit(1);
            openDrawer(!hasItems);
          }}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] tracking-[0.22em] uppercase font-semibold"
          style={{ background: "#E8C98A", color: "#0E2F25" }}
        >
          <ShoppingBag className="h-4 w-4" />
          {hasItems ? "View Cart" : "Add To Cart"}
        </button>
      </div>
    </div>
  );
}
