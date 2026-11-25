import { create } from "zustand";
import type { Role } from "@/interfaces";

const STORAGE_KEY = "oms.role";
const DEFAULT_ROLE: Role = "MANAGER";

interface AuthState {
  role: Role;
  /** false until the saved role has been read from localStorage - data hooks wait for it. */
  hydrated: boolean;
  setRole: (role: Role) => void;
  hydrate: () => void;
}

function isRole(value: string | null): value is Role {
  return value === "SALES" || value === "WAREHOUSE" || value === "MANAGER";
}

/**
 * Current role. MVP stand-in for authentication: the UAT user picks a role in the header and every
 * API call sends it as X-User-Role. Replace with a real login (JWT) later - callers only read `role`.
 */
export const useAuthStore = create<AuthState>()((set) => ({
  role: DEFAULT_ROLE,
  hydrated: false,
  setRole: (role) => {
    try {
      localStorage.setItem(STORAGE_KEY, role);
    } catch {
      // storage unavailable (private mode) - role still applies for this tab
    }
    set({ role });
  },
  hydrate: () => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ role: isRole(saved) ? saved : DEFAULT_ROLE, hydrated: true });
  },
}));
