"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications/notifications.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import type { NotificationListParams } from "@/types/notification";

export function useNotificationsQuery(params?: NotificationListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.notifications.all(params),
    queryFn: () => notificationsService.list(params),
    enabled: isAuthenticated,
    placeholderData: (prev) => prev,
  });
}

export function useUnreadNotificationsCountQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.notifications.unread,
    queryFn: () => notificationsService.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
}
