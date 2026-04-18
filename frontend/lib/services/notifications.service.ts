import { apiRequest } from "../http/client";
import type { InAppNotification } from "../types";

export const notificationsService = {
  getNotifications: (token: string) =>
    apiRequest<{ notifications: InAppNotification[]; unreadCount: number }>("/notifications", undefined, token),
  markNotificationRead: (token: string, notificationId: string) =>
    apiRequest<{ notification: InAppNotification; unreadCount: number }>(
      `/notifications/${notificationId}/read`,
      { method: "PATCH" },
      token
    ),
  markAllNotificationsRead: (token: string) =>
    apiRequest<{ unreadCount: number }>("/notifications/read-all", { method: "PATCH" }, token)
};
