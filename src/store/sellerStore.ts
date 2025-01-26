import { create } from "zustand";
import { Seller } from "../Types/types";
import { createJSONStorage, persist } from "zustand/middleware";

type SellerStore = {
  seller: Seller | null;
  addSeller: (seller: Seller) => void;
  removeSeller: () => void;
};

export const useSellerStore = create<SellerStore>()(
  persist(
    (set) => {
      return {
        seller: null,
        addSeller: (seller) => set(() => ({ seller: seller })),
        removeSeller: () => {
          set({ seller: null });
          localStorage.removeItem("seller-storage");
        },
      };
    },
    {
      name: "seller-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
