import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product, Variant } from "../Types/types";

export type CartItem = {
  productId: string | Product;
  variantId: string | Variant | null;
  qty: number;
  shopId: string;
  isReviewed?: boolean;
  // Optional full objects for UI
  product?: Product;
  variant?: Variant;
};

interface CartStore {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId: string | null) => void;
  changeQyt: (productId: string, variantId: string | null, amount: 1 | -1) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],

      // ✅ Safer addToCart (supports productId/variantId as string or object)
      addToCart: (item: CartItem) => {
        set((state) => {
          const existingItemIndex = state.cart.findIndex((el) => {
            const elProdId =
              typeof el.productId === "string" ? el.productId : el.productId?._id;
            const elVarId =
              typeof el.variantId === "string" ? el.variantId : el.variantId?._id;

            const itemProdId =
              typeof item.productId === "string" ? item.productId : item.productId?._id;
            const itemVarId =
              typeof item.variantId === "string" ? item.variantId : item.variantId?._id;

            return elProdId === itemProdId && elVarId === itemVarId;
          });

          if (existingItemIndex !== -1) {
            const updatedCart = [...state.cart];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              qty: updatedCart[existingItemIndex].qty + item.qty,
            };
            return { cart: updatedCart };
          }

          return { cart: [...state.cart, item] };
        });
      },

      // ✅ removeFromCart safe
      removeFromCart: (productId: string, variantId: string | null) => {
        set((state) => ({
          cart: state.cart.filter((item) => {
            const elProdId =
              typeof item.productId === "string" ? item.productId : item.productId?._id;
            const elVarId =
              typeof item.variantId === "string" ? item.variantId : item.variantId?._id;

            return !(elProdId === productId && elVarId === variantId);
          }),
        }));
      },

      // ✅ changeQyt safe
      changeQyt: (productId: string, variantId: string | null, amount: 1 | -1) => {
        set((state) => {
          const updatedCart = state.cart.map((item) => {
            const elProdId =
              typeof item.productId === "string" ? item.productId : item.productId?._id;
            const elVarId =
              typeof item.variantId === "string" ? item.variantId : item.variantId?._id;

            if (elProdId === productId && elVarId === variantId) {
              const newQty = item.qty + amount;
              if (newQty > 0) {
                return { ...item, qty: newQty };
              } else {
                return null; // remove item
              }
            }
            return item;
          });

          return { cart: updatedCart.filter((el): el is CartItem => el !== null) };
        });
      },

      clearCart: () => set(() => ({ cart: [] })),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
