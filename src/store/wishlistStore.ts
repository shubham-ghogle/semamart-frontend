import { create } from "zustand";
import { Product } from "../Types/types";
import { createJSONStorage, persist } from "zustand/middleware";

interface WishlistStore {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set) => {
      return {
        wishlist: [],
        addToWishlist: (product) => {
          set((state) => ({ wishlist: [...state.wishlist, product] }));
        },
        removeFromWishlist: (id) => {
          set((state) => ({
            wishlist: state.wishlist.filter((pro) => pro._id !== id),
          }));
        },
      };
    },
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
