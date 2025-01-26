import { create } from "zustand";
import { User } from "../Types/types";
import { createJSONStorage, persist } from "zustand/middleware";

type UserStore = {
  user: User | null;
  addUser: (user: User) => void;
  removeUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => {
      return {
        user: null,
        addUser: (user) => {
          set(() => ({ user: user }));
        },
        removeUser: () => {
          set({ user: null });
          localStorage.removeItem("user-storage");
        },
      };
    },
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
