// wishlistStore.ts
import { create } from "zustand";
import { Product, Variant } from "../Types/types";
import { createJSONStorage, persist } from "zustand/middleware";
import { useUserStore } from "./userStore";
import { API_URL } from "@/data";


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

      addToWishlist: async (product, variant) => {
        const user = useUserStore.getState().user;

        if (!user?._id) {
          console.error("User not logged in");
          return;
        }
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
        try {
        await fetch(API_URL+"wishlist/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user?._id,
        product_id: product._id,
        variant_id: variantId, // will be null if not present
      }),
    });
  } catch (error) {
    console.error("Failed to add to wishlist API:", error);
  }
      },

   removeFromWishlist: async (productId, variantId) => {
  const user = useUserStore.getState().user;

  if (!user?._id) {
    console.error("User not logged in");
    return;
  }

  try {
    // Call API with userId
    await fetch(
      API_URL+`wishlist/${user._id}/${productId}/${variantId ?? "null"}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Update local store
    set((state) => ({
      wishlist: state.wishlist.filter((w) => {
        if (!variantId) return w.productId !== productId;
        return !(w.productId === productId && (w.variantId ?? null) === (variantId ?? null));
      }),
    }));
  } catch (error) {
    console.error("Remove wishlist error:", error);
  }
},


    clearWishlist: async () => {
  const user = useUserStore.getState().user;

  if (!user?._id) {
    console.error("User not logged in");
    return;
  }

  try {
    const response = await fetch(API_URL+`wishlist/clear/${user._id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to clear wishlist");
    }

    // Clear local Zustand store
    set({ wishlist: [] });

  } catch (error) {
    console.error("Clear wishlist failed:", error);
    throw error;
  }
},



    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
