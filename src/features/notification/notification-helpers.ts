/**
 * 通知スケジュール作成の共通ロジック
 * useRoutines と PWAInstaller の両方で使用される
 */
import { type Routine, HOLIDAY_DAY_VALUE } from "@/types/routine";
import type { NotificationSchedule } from "./notification-types";
import { NOTIFICATION_SCHEDULE_TITLE, getNotificationScheduleBody } from "./texts";

/**
 * ルーティン配列から通知スケジュールを生成する
 * 各ルーティンの曜日と祝日設定に基づいてスケジュールを作成する
 * @param {Routine[]} routines - 通知スケジュールを生成するルーティン配列
 * @returns {NotificationSchedule[]} 生成された通知スケジュール配列
 * @example
 * const schedules = createNotificationSchedules(routines);
 * await scheduleNotifications(schedules);
 */
export const createNotificationSchedules = (
  routines: Routine[],
): NotificationSchedule[] => {
  const schedules: NotificationSchedule[] = [];

  routines.forEach((routine) => {
    if (!routine.notificationMinutes) return;

    // 各曜日のスケジュールを作成
    routine.daysOfWeek.forEach((dayOfWeek) => {
      if (dayOfWeek === HOLIDAY_DAY_VALUE) {
        // 祝日（7）の場合はisHolidayフラグ付きのスケジュールを作成
        schedules.push({
          id: `${routine.id}-holiday`,
          title: NOTIFICATION_SCHEDULE_TITLE,
          body: getNotificationScheduleBody(routine.title),
          time: routine.startTime,
          minutesAfter: routine.notificationMinutes || 0,
          isHoliday: true,
        });
      } else {
        // 通常曜日（0-6）のスケジュール
        schedules.push({
          id: `${routine.id}-${dayOfWeek}`,
          title: NOTIFICATION_SCHEDULE_TITLE,
          body: getNotificationScheduleBody(routine.title),
          time: routine.startTime,
          minutesAfter: routine.notificationMinutes || 0,
          dayOfWeek,
        });
      }
    });
  });

  return schedules;
};
