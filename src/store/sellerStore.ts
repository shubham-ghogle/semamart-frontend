// src/store/sellerStore.ts
import { create } from "zustand";
import { Seller } from "../Types/types";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * SellerStore
 *
 * - seller: currently logged-in seller object or null
 * - addSeller: set seller (used on login/activation)
 * - updateSeller: send partial update to backend, update local store with returned seller
 * - removeSeller: clear seller from store + localStorage
 * - changePassword: request backend to change seller password
 * - reloadSeller: fetch latest seller from backend and update store
 */
type SellerStore = {
  seller: Seller | null;
  addSeller: (seller: Seller) => void;
  updateSeller: (updatedFields: Partial<Seller>) => Promise<Seller | null>;
  removeSeller: () => void;
  changePassword: (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<boolean>;
  reloadSeller: () => Promise<Seller | null>;
};

export const useSellerStore = create<SellerStore>()(
  persist(
    (set, get) => ({
      seller: null,

      addSeller: (seller) => {
        try {
          console.debug("[sellerStore] addSeller called with:", seller);

          // Basic guard
          if (!seller || typeof seller !== "object") {
            console.warn("[sellerStore] addSeller received invalid seller:", seller);
            set({ seller: null });
            return;
          }

          set({ seller });

          // Fallback: attempt to write explicitly to localStorage so we can inspect it
          try {
            const payload = { state: { seller } };
            localStorage.setItem("seller-storage", JSON.stringify(payload));
            console.debug("[sellerStore] fallback localStorage write succeeded");
          } catch (e) {
            console.warn("[sellerStore] fallback localStorage write failed:", e);
          }
        } catch (err) {
          console.error("[sellerStore] addSeller unexpected error:", err);
        }
      },

      /**
       * updateSeller
       * Sends the partial update to backend and updates store with returned seller object.
       * Returns the updated seller on success, or throws an Error.
       */
      updateSeller: async (updatedFields: Partial<Seller>) => {
        try {
          console.debug("[sellerStore] updateSeller called with:", updatedFields);

          const res = await fetch("/api/v2/shop/update-seller-info", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(updatedFields),
          });

          const body = await res.json().catch(() => null);

          if (!res.ok) {
            const msg = body?.message || "Failed to update seller";
            throw new Error(msg);
          }

          // Backend should return updated seller under body.shop or body.seller or body
          const updatedSeller: Seller | undefined =
            body?.shop ?? body?.seller ?? body ?? null;

          if (!updatedSeller) {
            // If backend did not return full seller, fallback to merge locally
            const current = get().seller;
            if (!current) return null;
            const merged = { ...current, ...updatedFields };
            set({ seller: merged as Seller });

            // fallback localStorage write for debugging
            try {
              localStorage.setItem("seller-storage", JSON.stringify({ state: { seller: merged } }));
            } catch (e) {
              console.warn("[sellerStore] localStorage write after merge failed:", e);
            }

            return merged as Seller;
          }

          set({ seller: updatedSeller });

          try {
            localStorage.setItem("seller-storage", JSON.stringify({ state: { seller: updatedSeller } }));
          } catch (e) {
            console.warn("[sellerStore] localStorage write after updateSeller failed:", e);
          }

          return updatedSeller as Seller;
        } catch (err: any) {
          console.error("sellerStore.updateSeller error:", err);
          throw err;
        }
      },

      /**
       * removeSeller - clears seller from state and localStorage
       */
      removeSeller: () => {
        try {
          console.debug("[sellerStore] removeSeller called");
          set({ seller: null });
          try {
            localStorage.removeItem("seller-storage");
            console.debug("[sellerStore] localStorage seller-storage removed");
          } catch (e) {
            console.warn("[sellerStore] removeSeller localStorage remove failed:", e);
          }
        } catch (err) {
          console.error("[sellerStore] removeSeller error:", err);
        }
      },

      /**
       * changePassword - call backend to change seller password
       * Returns true on success, throws on failure
       */
      changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
        try {
          const res = await fetch("/api/v2/shop/update-seller-password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              currentPassword,
              newPassword,
              confirmPassword,
            }),
          });

          const body = await res.json().catch(() => null);

          if (!res.ok) {
            const msg = body?.message || "Failed to change password";
            throw new Error(msg);
          }

          return true;
        } catch (err: any) {
          console.error("sellerStore.changePassword error:", err);
          throw err;
        }
      },

      /**
       * reloadSeller - fetch current seller from backend and update store
       * Useful after login or when you need fresh data
       */
      reloadSeller: async () => {
        try {
          console.debug("[sellerStore] reloadSeller called");
          const res = await fetch("/api/v2/shop/getSeller", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const body = await res.json().catch(() => null);

          if (!res.ok) {
            const msg = body?.message || "Failed to load seller";
            throw new Error(msg);
          }

          // Expect body.seller or body.shop or body
          const fetched: Seller | undefined = body?.seller ?? body?.shop ?? body ?? null;
          if (!fetched) return null;

          set({ seller: fetched as Seller });

          try {
            localStorage.setItem("seller-storage", JSON.stringify({ state: { seller: fetched } }));
          } catch (e) {
            console.warn("[sellerStore] localStorage write after reloadSeller failed:", e);
          }

          return fetched as Seller;
        } catch (err: any) {
          console.error("sellerStore.reloadSeller error:", err);
          throw err;
        }
      },
    }),
    {
      name: "seller-storage",
      storage: createJSONStorage(() => localStorage),
      // debug hook: run after rehydration (if available)
      onRehydrateStorage: () => (state) => {
        console.debug("[sellerStore] rehydrated from storage:", state);
      },
    }
  )
);

export default useSellerStore;
