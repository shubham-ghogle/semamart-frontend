import { create } from "zustand";
import { Seller } from "../Types/types";
import { createJSONStorage, persist } from "zustand/middleware";

type SellerStore = {
  seller: Seller | null;
  addSeller: (seller: Seller) => void;
  updateSeller: (updatedFields: Partial<Seller>) => void;
  removeSeller: () => void;
};

export const useSellerStore = create<SellerStore>()(
  persist(
    (set, get) => ({
      seller: null,
      addSeller: (seller) => set({ seller }),
      
      // New updateSeller function
      updateSeller: (updatedFields: Partial<Seller>) => {
        const currentSeller = get().seller;
        if (!currentSeller) return; // no seller to update
        set({ seller: { ...currentSeller, ...updatedFields } });
      },

      removeSeller: () => {
        set({ seller: null });
        localStorage.removeItem("seller-storage");
      },
    }),
    {
      name: "seller-storage",
      storage: createJSONStorage(() => localStorage),
    },
  )
);
