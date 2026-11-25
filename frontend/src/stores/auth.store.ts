import { create } from "zustand";
import { CURRENT_USER_MOCK } from "@/constants/mock-data";
import type { User } from "@/interfaces";

interface AuthState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

/** Signed-in user. Seeded with mock data until authentication is wired up. */
export const useAuthStore = create<AuthState>()((set) => ({
  currentUser: CURRENT_USER_MOCK,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
