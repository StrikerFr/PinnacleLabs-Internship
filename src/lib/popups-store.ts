import { create } from "zustand";
import { persist } from "zustand/middleware";

type PopupKey = "bundleUpgrade" | "exitIntent" | "couponReward";

interface PopupState {
  active: PopupKey | null;
  bundleResolver: ((upgrade: boolean) => void) | null;
  shown: Partial<Record<PopupKey | "lowStock", number>>; // timestamps
  appliedCoupon: string | null;
  open: (key: PopupKey) => boolean;
  close: () => void;
  setBundleResolver: (fn: ((upgrade: boolean) => void) | null) => void;
  markShown: (key: PopupKey | "lowStock") => void;
  hasShown: (key: PopupKey | "lowStock", cooldownMs?: number) => boolean;
  setAppliedCoupon: (code: string | null) => void;
}

const SESSION_COOLDOWN_MS = 1000 * 60 * 60 * 24; // 1 day default per popup

export const usePopups = create<PopupState>()(
  persist(
    (set, get) => ({
      active: null,
      bundleResolver: null,
      shown: {},
      appliedCoupon: null,
      open: (key) => {
        if (get().active) return false;
        set({ active: key });
        return true;
      },
      close: () => set({ active: null, bundleResolver: null }),
      setBundleResolver: (fn) => set({ bundleResolver: fn }),
      markShown: (key) => set({ shown: { ...get().shown, [key]: Date.now() } }),
      hasShown: (key, cooldownMs = SESSION_COOLDOWN_MS) => {
        const t = get().shown[key];
        if (!t) return false;
        return Date.now() - t < cooldownMs;
      },
      setAppliedCoupon: (code) => set({ appliedCoupon: code }),
    }),
    {
      name: "vedaglow-popups",
      partialize: (s) => ({ shown: s.shown, appliedCoupon: s.appliedCoupon }),
    },
  ),
);
