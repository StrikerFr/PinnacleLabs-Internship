import { create } from "zustand";

interface CartDrawerState {
  isOpen: boolean;
  justAdded: boolean;
  open: (justAdded?: boolean) => void;
  close: () => void;
}

export const useCartDrawer = create<CartDrawerState>((set) => ({
  isOpen: false,
  justAdded: false,
  open: (justAdded = false) => set({ isOpen: true, justAdded }),
  close: () => set({ isOpen: false, justAdded: false }),
}));
