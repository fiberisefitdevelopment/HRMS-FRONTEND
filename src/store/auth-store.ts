import { create } from "zustand";
import type { User, AuthTokens } from "@/types/auth";

interface AuthStore {
  user: User | null;
  permissions: string[];
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  rememberMe: boolean;
  setSession: (payload: {
    user: User;
    permissions: string[];
    tokens?: AuthTokens | null;
  }) => void;
  setUser: (user: User | null) => void;
  setPermissions: (permissions: string[]) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setRememberMe: (rememberMe: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  permissions: [],
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  rememberMe: true,

  setSession: ({ user, permissions, tokens }) =>
    set({
      user,
      permissions,
      tokens: tokens ?? null,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    }),

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setPermissions: (permissions) => set({ permissions }),
  setTokens: (tokens) => set({ tokens }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setRememberMe: (rememberMe) => set({ rememberMe }),

  clearSession: () =>
    set({
      user: null,
      permissions: [],
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
    }),
}));
