import { getRoutines } from "@/lib/storage";
import {
  createNotificationSchedules,
  hasNotificationPermission,
  scheduleNotifications,
} from "@/features/notification";

let registerPromise: Promise<void> | null = null;

export const resetServiceWorkerRegisterPromiseForTest = () => {
  registerPromise = null;
};

export const ensureMessagingServiceWorkerRegistered = async () => {
  const existingRegistration =
    await navigator.serviceWorker.getRegistration("/");
  if (existingRegistration) return;

  await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/",
  });
};

export const registerMessagingServiceWorkerOnce = async () => {
  if (!registerPromise) {
    registerPromise = ensureMessagingServiceWorkerRegistered();
  }

  try {
    await registerPromise;
  } catch (error) {
    registerPromise = null;
    throw error;
  }
};

export const scheduleRoutineNotificationsIfPermitted = async () => {
  if (!hasNotificationPermission()) {
    return;
  }

  const schedules = createNotificationSchedules(getRoutines());
  if (schedules.length > 0) {
    await scheduleNotifications(schedules);
  }
};
