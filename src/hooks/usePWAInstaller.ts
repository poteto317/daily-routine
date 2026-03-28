"use client";

import { useMessagingServiceWorkerRegistration } from "./useMessagingServiceWorkerRegistration";
import { useRoutineNotificationScheduling } from "./useRoutineNotificationScheduling";

export const usePWAInstaller = () => {
  const scheduleNotifications = useRoutineNotificationScheduling();
  useMessagingServiceWorkerRegistration(scheduleNotifications);
};
