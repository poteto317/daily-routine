import { getCacheValue, setCacheValue } from "./notificationFlagsCache";
import { logToClient } from "./logToClient";

const getRoutineIdFromScheduleId = (id) =>
  id.replace(/-\d+$/, "").replace(/-holiday$/, "");

const shouldSkipSchedule = (schedule, currentDayOfWeek, isWeekend) => {
  if (
    schedule.dayOfWeek !== undefined &&
    schedule.dayOfWeek !== currentDayOfWeek
  ) {
    return true;
  }

  if (schedule.isHoliday && !isWeekend) {
    return true;
  }

  return false;
};

export const checkAndSendNotifications = async (schedules) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentDayOfWeek = now.getDay();
  const isWeekend = currentDayOfWeek === 0 || currentDayOfWeek === 6;

  logToClient(
    `[Custom SW] Checking notifications: ${now.toLocaleTimeString("ja-JP")} dayOfWeek:${currentDayOfWeek} schedules:${schedules.size}`,
  );

  for (const [id, schedule] of schedules) {
    if (shouldSkipSchedule(schedule, currentDayOfWeek, isWeekend)) {
      continue;
    }

    const routineId = getRoutineIdFromScheduleId(id);
    const notifiedKey = `notified_${routineId}_${today}`;
    const alreadyNotified = await getCacheValue(notifiedKey);

    if (alreadyNotified) {
      continue;
    }

    const [scheduleHour, scheduleMinute] = schedule.time.split(":").map(Number);
    const notificationTime = new Date(now);
    notificationTime.setHours(
      scheduleHour,
      scheduleMinute + (schedule.minutesAfter || 0),
      0,
      0,
    );

    const timeDiff = Math.abs(now.getTime() - notificationTime.getTime());

    logToClient(
      `[Custom SW] Check: ${schedule.title} scheduled:${schedule.time} notify:${notificationTime.toLocaleTimeString("ja-JP")} after:${schedule.minutesAfter}min diff:${Math.round(timeDiff / 1000)}s`,
    );

    if (timeDiff >= 90000) {
      continue;
    }

    logToClient(`[Custom SW] Sending notification: ${schedule.title}`);

    try {
      await self.registration.showNotification(schedule.title, {
        body: schedule.body,
        icon: "/icon.svg",
        badge: "/icon.svg",
        tag: routineId,
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
      });

      await setCacheValue(notifiedKey, "true");
    } catch {
      // Failed to send notification
    }
  }
};
