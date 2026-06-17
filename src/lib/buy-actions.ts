import { useNavigate } from "@tanstack/react-router";
import { useCart } from "./cart-store";
import { useCartDrawer } from "./cart-drawer-store";

export function useAddStarterKit() {
  return () => {
    const qty = useCart.getState().totalQuantity();
    if (qty === 0) useCart.getState().addStarterKit(1);
    else useCart.getState().addStarterKit(1);
    useCartDrawer.getState().open(true);
  };
}

export function useBuyNow() {
  const navigate = useNavigate();
  return () => {
    const qty = useCart.getState().totalQuantity();
    if (qty === 0) useCart.getState().addStarterKit(1);
    navigate({ to: "/checkout" });
  };
}
