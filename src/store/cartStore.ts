import { create } from 'zustand';
import type { Cart, CartItem } from '../types';

interface CartStore {
  cart: Cart | null;
  itemCount: number;

  setCart: (cart: Cart) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: null,
  itemCount: 0,

  setCart: (cart) => set({ cart, itemCount: cart.itemCount }),

  clearCart: () => set({ cart: null, itemCount: 0 }),
}));
