"use client";

import { useEffect } from "react";
import { useNotificationsQuery } from "@/hooks/queries/use-notification-queries";
import { useNotificationStore } from "@/store/notification-store";
import type { AppNotification } from "@/types/notification";
import { getNotificationHref } from "@/lib/notifications/href";

function mapToAppNotification(
  notification: {
    id: string;
    title: string;
    message: string;
    type: AppNotification["type"];
    isRead: boolean;
    createdAt: string;
    actionUrl?: string | null;
  }
): AppNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type === "action_required" ? "warning" : notification.type,
    read: notification.isRead,
    createdAt: notification.createdAt,
    href: getNotificationHref(notification.actionUrl),
  };
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data } = useNotificationsQuery({ limit: 20 });
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const setLoading = useNotificationStore((s) => s.setLoading);

  useEffect(() => {
    setLoading(true);
  }, [setLoading]);

  useEffect(() => {
    if (data?.data) {
      setNotifications(data.data.map(mapToAppNotification));
    }
  }, [data, setNotifications]);

  return <>{children}</>;
}
