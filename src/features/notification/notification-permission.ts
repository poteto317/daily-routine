type NotificationPermissionApi = {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
};

export const resolveNotificationPermission = async (
  notificationApi: NotificationPermissionApi,
): Promise<NotificationPermission> => {
  if (notificationApi.permission !== "default") {
    return notificationApi.permission;
  }

  return notificationApi.requestPermission();
};

export const requestNotificationPermission =
  async (): Promise<NotificationPermission> => {
    if (typeof window === "undefined") return "denied";
    if (!("Notification" in window)) return "denied";

    return resolveNotificationPermission(Notification);
  };

export const hasNotificationPermission = (): boolean => {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
};
