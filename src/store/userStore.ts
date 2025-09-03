import { create } from "zustand";
import { User } from "../Types/types";
import { createJSONStorage, persist } from "zustand/middleware";

type UserStore = {
  user: User | null;
  addUser: (user: User) => void;
  removeUser: () => void;
  updateUser: (updatedFields: Partial<User>) => void;  // <-- new method
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      addUser: (user) => {
        set(() => ({ user }));
      },
      removeUser: () => {
        set({ user: null });
        localStorage.removeItem("user-storage");
      },
      updateUser: (updatedFields) => {
        const currentUser = get().user;
        if (!currentUser) return; // no user to update
        set({
          user: {
            ...currentUser,
            ...updatedFields,
          },
        });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
