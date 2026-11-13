import type { Firestore, DocumentData } from "../adminSdk";
import { type NotificationContext } from "../date-utils";
import { isNotificationTimeNow } from "./notification-time";
import { sendRoutineNotification } from "./notification-delivery";
import { shouldNotifyRoutine } from "./notification-filter";
import { extractUserNotificationData } from "./user-data-extractor";

type ProcessUserNotificationsParams = NotificationContext & {
  userData: DocumentData;
  db: Firestore;
};

/**
 * 1 ユーザー分のルーティンを走査し、今日・今の時刻に該当するものへ通知を送る
 */
export const processUserNotifications = async ({
  userData,
  db,
  currentHour,
  currentMinute,
  currentDayOfWeek,
  isHoliday,
  todayStr,
}: ProcessUserNotificationsParams): Promise<void> => {
  const userNotificationData = extractUserNotificationData(userData);
  if (!userNotificationData) return;

  const { fcmToken, routines } = userNotificationData;

  for (const routine of routines) {
    if (!shouldNotifyRoutine(routine, currentDayOfWeek, isHoliday)) continue;
    if (!isNotificationTimeNow(routine, currentHour, currentMinute)) continue;

    await sendRoutineNotification(fcmToken, routine, db, todayStr);
  }
};
