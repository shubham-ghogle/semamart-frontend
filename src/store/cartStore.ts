import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "../Types/types";


export type CartItem = { product: Product; qty: number }

interface CartStore {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  changeQyt: (itemId: string, amount: 1 | -1) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => {
      return {
        cart: [],

        addToCart: (item) => {
          set((state) => {
            //if item is already in cart we increase its quantity
            const existingItemIndex = state.cart.findIndex(
              (el) => el.product._id === item.product._id,
            );

            if (existingItemIndex !== -1) {
              const updatedCart = [...state.cart];
              updatedCart[existingItemIndex] = {
                ...updatedCart[existingItemIndex],
                qty: updatedCart[existingItemIndex].qty + item.qty,
              };
              return { cart: updatedCart };
            }

            return {
              cart: [...state.cart, item],
            };
          });
        },

        removeFromCart: (itemId) => {
          set((state) => ({
            cart: state.cart.filter((item) => item.product._id !== itemId),
          }));
        },

        changeQyt: (itemId, amount) => {
          set((state) => {
            const updatedCart = state.cart.map((item) => {
              if (item.product._id === itemId) {
                const newQty = item.qty + amount;

                if (newQty > 0) {
                  return { ...item, qty: item.qty + amount };
                } else {
                  return null;
                }
              }

              return item;
            });
            const cleanCart = updatedCart.filter((el) => el !== null);
            return { cart: cleanCart };
          });
        },
        //////////////////////////////
      };
    },
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
