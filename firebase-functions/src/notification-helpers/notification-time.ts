import type { Routine } from "../types";

export const calculateNotificationTime = (
  routine: Routine,
): { hour: number; minute: number } => {
  const [routineHour, routineMinute] = routine.startTime.split(":").map(Number);
  const notificationMinutes = routine.notificationMinutes || 0;
  const totalMinutes = routineHour * 60 + routineMinute + notificationMinutes;
  const notificationHour = Math.floor(totalMinutes / 60) % 24;
  const notificationMinute = totalMinutes % 60;

  return { hour: notificationHour, minute: notificationMinute };
};
