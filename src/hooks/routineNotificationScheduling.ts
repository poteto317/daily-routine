import { getRoutines } from "@/lib/storage";
import {
  createNotificationSchedules,
  hasNotificationPermission,
  scheduleNotifications,
} from "@/features/notification";

/**
 * 保存済みのルーティンから通知の予定を作り、Service Worker へ登録する。
 *
 * 予定が 0 件のときは送らない。空配列を送ると Service Worker 側で登録済みの
 * 予定を消してしまう。
 */
export const scheduleRoutineNotificationsIfPermitted = async () => {
  if (!hasNotificationPermission()) {
    return;
  }

  const schedules = createNotificationSchedules(getRoutines());
  if (schedules.length > 0) {
    await scheduleNotifications(schedules);
  }
};
