// wishlistStore.ts
import { create } from "zustand";
import { Product, Variant } from "../Types/types";
import { createJSONStorage, persist } from "zustand/middleware";

export type WishlistItem = {
  productId: string;
  variantId: string | null;
  product: Product;
  variant?: Variant | null;
  price: number;
  taxClass?: number;
  shopId?: string;
  addedAt?: string;
};

interface WishlistStore {
  wishlist: WishlistItem[];
  addToWishlist: (product: Product, variant: Variant) => void;
  removeFromWishlist: (productId: string, variantId?: string | null) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlist: [],

      addToWishlist: (product, variant) => {
        const variantId = variant?._id ?? null;
        const price =
          variant?.discountPrice ??
          variant?.originalPrice ??
          (product as any).discountPrice ??
          (product as any).originalPrice ??
          0;

        const shopId =
          typeof (product as any).shopId === "string"
            ? (product as any).shopId
            : (product as any).shopId?._id ?? "";

        const newItem: WishlistItem = {
          productId: product._id,
          variantId,
          product,
          variant,
          price,
          taxClass: (product as any).taxClass ?? 0,
          shopId,
          addedAt: new Date().toISOString(),
        };

        // prevent duplicates of same product + variant
        const exists = get().wishlist.some(
          (w) =>
            w.productId === newItem.productId &&
            (w.variantId ?? null) === (newItem.variantId ?? null)
        );
        if (exists) return;

        set((state) => ({ wishlist: [...state.wishlist, newItem] }));
      },

      removeFromWishlist: (productId, variantId) => {
        set((state) => ({
          wishlist: state.wishlist.filter((w) => {
            if (variantId === undefined) return w.productId !== productId;
            return !(w.productId === productId && (w.variantId ?? null) === (variantId ?? null));
          }),
        }));
      },

      clearWishlist: () => set(() => ({ wishlist: [] })),
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
