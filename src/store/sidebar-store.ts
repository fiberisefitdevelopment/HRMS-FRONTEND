import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/config/app";

interface SidebarStore {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  pinnedItems: string[];
  favoriteItems: string[];
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  togglePin: (itemId: string) => void;
  toggleFavorite: (itemId: string) => void;
  isPinned: (itemId: string) => boolean;
  isFavorite: (itemId: string) => boolean;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      isMobileOpen: false,
      pinnedItems: ["dashboard"],
      favoriteItems: [],

      toggleCollapsed: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      setCollapsed: (isCollapsed) => set({ isCollapsed }),
      setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),

      togglePin: (itemId) =>
        set((s) => ({
          pinnedItems: s.pinnedItems.includes(itemId)
            ? s.pinnedItems.filter((id) => id !== itemId)
            : [...s.pinnedItems, itemId],
        })),

      toggleFavorite: (itemId) =>
        set((s) => ({
          favoriteItems: s.favoriteItems.includes(itemId)
            ? s.favoriteItems.filter((id) => id !== itemId)
            : [...s.favoriteItems, itemId],
        })),

      isPinned: (itemId) => get().pinnedItems.includes(itemId),
      isFavorite: (itemId) => get().favoriteItems.includes(itemId),
    }),
    {
      name: STORAGE_KEYS.sidebarCollapsed,
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        pinnedItems: state.pinnedItems,
        favoriteItems: state.favoriteItems,
      }),
    }
  )
);
