export const requestNotificationPermission =
  async (): Promise<NotificationPermission> => {
    if (typeof window === "undefined") return "denied";
    if (!("Notification" in window)) return "denied";

    if (Notification.permission === "default")
      return Notification.requestPermission();

    return Notification.permission;
  };

export const hasNotificationPermission = (): boolean => {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
};
