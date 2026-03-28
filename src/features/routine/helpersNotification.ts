import { Routine } from "@/types/routine";
import { getTodayString } from "@/lib/storage/core";
import {
  ROUTINE_NOTIFICATION_MESSAGES,
  getRoutineNotificationBody,
} from "./helpers";

export const getRoutinesNeedingNotification = (
  routines: Routine[],
  currentDate: Date = new Date(),
): Routine[] => {
  return routines.filter((routine) => {
    if (routine.isCompleted) return false;
    if (!routine.notificationMinutes || routine.notificationMinutes <= 0)
      return false;

    const [hours, minutes] = routine.startTime.split(":").map(Number);
    const target = new Date(currentDate);
    target.setHours(hours, minutes + routine.notificationMinutes, 0, 0);
    return currentDate >= target;
  });
};

export const sendBrowserNotification = (
  routine: Routine,
  dateKey: string = getTodayString(),
): boolean => {
  if (typeof window === "undefined") return false;
  if (!("Notification" in window)) return false;

  try {
    if (Notification.permission !== "granted") return false;

    const notificationKey = `notified-${routine.id}-${dateKey}`;
    if (sessionStorage.getItem(notificationKey)) return false;

    new Notification(ROUTINE_NOTIFICATION_MESSAGES.title, {
      body: getRoutineNotificationBody(routine.title),
      tag: routine.id,
    });

    sessionStorage.setItem(notificationKey, "true");
    return true;
  } catch {
    return false;
  }
};
