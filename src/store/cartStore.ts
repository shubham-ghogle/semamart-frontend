import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "../Types/types";

interface Qty {
  qty: number;
}

type CartItem = Product & Qty;

interface CartStore {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => {
      return {
        cart: [],

        addToCart: (item) => {
          set((state) => ({
            cart: [...state.cart, item],
          }));
        },

        removeFromCart: (itemId) => {
          set((state) => ({
            cart: state.cart.filter((item) => item._id !== itemId),
          }));
        },
      };
    },
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
