import type * as admin from "firebase-admin";
import type { NotificationContext } from "../date-utils";
import { calculateNotificationTime } from "./notification-time";
import { sendRoutineNotification } from "./notification-delivery";
import { shouldNotifyRoutine } from "./notification-filter";
import { extractUserNotificationData } from "./user-data-extractor";

type ProcessUserNotificationsParams = NotificationContext & {
  userData: admin.firestore.DocumentData;
  db: admin.firestore.Firestore;
};

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

    const notificationTime = calculateNotificationTime(routine);

    if (
      currentHour !== notificationTime.hour ||
      currentMinute !== notificationTime.minute
    ) {
      continue;
    }

    await sendRoutineNotification(fcmToken, routine, db, todayStr);
  }
};
