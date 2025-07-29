import { create } from "zustand";
import { Product } from "../Types/types";
import { createJSONStorage, persist } from "zustand/middleware";

interface WishlistStore {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set) => ({
      wishlist: [],
      addToWishlist: (product) => {
        set((state) => ({ wishlist: [...state.wishlist, product] }));
      },
      removeFromWishlist: (id) => {
        set((state) => ({
          wishlist: state.wishlist.filter((pro) => pro._id !== id),
        }));
      },
      clearWishlist: () => {
        set(() => ({ wishlist: [] }));
      },
    }),
    {
      name: "wishlist-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
