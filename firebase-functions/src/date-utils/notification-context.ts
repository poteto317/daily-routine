import { getDayOfWeek } from "./day-of-week";
import { isJapaneseHoliday } from "./holiday";
import type { NotificationContext } from "./types";

export type { NotificationContext };

/**
 * 現在時刻をもとに通知判定に必要なコンテキストを生成する
 */
export const getCurrentNotificationContext = (): NotificationContext => {
  const now = new Date();
  return {
    currentHour: now.getHours(),
    currentMinute: now.getMinutes(),
    currentDayOfWeek: getDayOfWeek(),
    isHoliday: isJapaneseHoliday(now),
    todayStr: now.toISOString().split("T")[0],
  };
};
