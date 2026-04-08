// src/store/userStore.ts
import { create } from "zustand";
import { User } from "../Types/types";
import { createJSONStorage, persist } from "zustand/middleware";
import { API_URL } from "@/data";

type UserStore = {
  user: User | null;
  addUser: (user: User) => void;
  removeUser: () => void;
  updateUser: (updatedFields: Partial<User>) => Promise<User | null>; // now async + returns server user
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      addUser: (user) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : user,
        }));
      },
      removeUser: () => {
        // Clear persisted store properly
        set({ user: null });
        try {
          localStorage.removeItem("user-storage"); // keep for backwards compatibility
        } catch (e) {
          // ignore
        }
        // 🔥 Clear cookies (current domain)
        try {
          document.cookie.split(";").forEach((cookie) => {
            document.cookie = cookie
              .replace(/^ +/, "")
              .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
          });
        } catch (e) {
          // ignore
        }
      },

      updateUser: async (updatedFields) => {
        const currentUser = get().user;
        if (!currentUser) return null; // no user to update

        try {
          // Call backend to persist partial update
          // NOTE: endpoint below is what I recommend adding to backend: PATCH /api/v2/user/update-profile
          // If your API base is different, update the URL accordingly.
          const res = await fetch(API_URL+"user/update-profile", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            // send only fields frontend wants to update
            body: JSON.stringify({
              _id: currentUser._id,
              ...updatedFields,
            }),
            credentials: "include", // include cookies (your auth uses token cookie)
          });

          if (!res.ok) {
            // try to parse JSON message
            let errMsg = "Failed to update user";
            try {
              const errBody = await res.json();
              errMsg = errBody.message || errMsg;
            } catch (e) {}
            throw new Error(errMsg);
          }

          const data = await res.json();

          // Expect server to return updated user object under `user` or as the body.
          // Normalize: if server uses { success, user } or returns user directly.
          const serverUser = data.user || data;

          // Update local store with server response
          set({
            user: {
              ...currentUser,
              ...serverUser,
            },
          });

          return serverUser;
        } catch (error: any) {
          console.error("updateUser failed:", error);
          throw error;
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
