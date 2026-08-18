import { getCacheValue, setCacheValue } from "./notificationFlagsCache";
import { logToClient } from "./logToClient";
import { diffFromJstScheduleMs, toJstDateKey, toJstDay } from "./jstDate";

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
  // 本体の記録と同じ JST 基準にする。UTC や端末ローカルのままだと、
  // 日本時間の 0〜9 時に通知の日付と曜日が前日のものになる。
  const today = toJstDateKey(now);
  const currentDayOfWeek = toJstDay(now);
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

    const timeDiff = diffFromJstScheduleMs(
      now,
      schedule.time,
      schedule.minutesAfter || 0,
    );

    logToClient(
      `[Custom SW] Check: ${schedule.title} scheduled:${schedule.time} after:${schedule.minutesAfter}min diff:${Math.round(timeDiff / 1000)}s`,
    );

    if (timeDiff >= 90000) {
      continue;
    }

    logToClient(`[Custom SW] Sending notification: ${schedule.title}`);

    try {
      await self.registration.showNotification(schedule.title, {
        body: schedule.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
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
