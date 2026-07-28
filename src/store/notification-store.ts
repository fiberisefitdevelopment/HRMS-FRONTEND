import { create } from "zustand";
import type { AppNotification } from "@/types/notification";

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  setNotifications: (notifications: AppNotification[]) => void;
  setLoading: (loading: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clear: () => set({ notifications: [], unreadCount: 0, isLoading: false }),
}));
