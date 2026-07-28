export type NotificationType = "info" | "success" | "warning" | "error" | "action_required";

export interface Notification {
  id: string;
  companyId?: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  actionUrl?: string | null;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

/** @deprecated Use Notification with isRead */
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  href?: string;
  avatar?: string;
}

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
}
