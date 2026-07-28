import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Notification, NotificationListParams } from "@/types/notification";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";

type ApiNotification = Notification & { _id?: string };

function normalizeNotification(notification: ApiNotification): Notification {
  return {
    ...notification,
    id: notification.id ?? notification._id ?? "",
  };
}

export const notificationsService = {
  async list(params?: NotificationListParams) {
    const { data } = await apiClient.get<PaginatedResponse<ApiNotification>>("/notifications", {
      params: toListParams(params ?? {}),
    });
    return {
      data: data.data.map(normalizeNotification),
      meta: normalizeMeta(data.meta),
    };
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<ApiResponse<{ count: number }>>(
      "/notifications/unread-count"
    );
    return data.data.count;
  },

  async markAsRead(id: string): Promise<Notification> {
    const { data } = await apiClient.put<ApiResponse<ApiNotification>>(
      `/notifications/${id}/read`
    );
    return normalizeNotification(data.data);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put("/notifications/read-all");
  },
};
