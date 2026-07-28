import { create } from "zustand";
import type { User } from "@/types/auth";

interface UserStore {
  profile: User | null;
  preferences: UserPreferences;
  setProfile: (profile: User | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const defaultPreferences: UserPreferences = {
  language: "en",
  timezone: "Asia/Kolkata",
  dateFormat: "dd/MM/yyyy",
  emailNotifications: true,
  pushNotifications: true,
};

export const useUserStore = create<UserStore>()((set) => ({
  profile: null,
  preferences: defaultPreferences,
  setProfile: (profile) => set({ profile }),
  updatePreferences: (preferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...preferences },
    })),
}));
