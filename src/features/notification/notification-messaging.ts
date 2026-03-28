import type { NotificationSchedule } from "./notification-types";

const postMessageToActiveServiceWorker = async (
  type: string,
  timeoutMs: number,
  payload?: Record<string, unknown>,
): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    if (!registration?.active) return false;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(Boolean(event.data?.success));
      };

      registration.active?.postMessage({ type, ...payload }, [
        messageChannel.port2,
      ]);

      setTimeout(() => {
        resolve(false);
      }, timeoutMs);
    });
  } catch {
    return false;
  }
};

export const scheduleNotifications = async (
  schedules: NotificationSchedule[],
): Promise<boolean> => {
  return postMessageToActiveServiceWorker("SCHEDULE_NOTIFICATIONS", 10000, {
    schedules,
  });
};

export const clearNotificationSchedules = async (): Promise<boolean> => {
  return postMessageToActiveServiceWorker("CLEAR_SCHEDULES", 5000);
};
