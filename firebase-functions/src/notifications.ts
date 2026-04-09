import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import type * as admin from "firebase-admin";
import { getCurrentNotificationContext } from "./date-utils";
import { processAllUsersNotifications } from "./notification-helpers";

/**
 * 毎分実行：ルーティンの時刻をチェックして通知を送信
 */
export const checkNotifications = (db: admin.firestore.Firestore) =>
  onSchedule(
    {
      schedule: "every 1 minutes",
      timeZone: "Asia/Tokyo",
      region: "asia-northeast1",
    },
    async () => {
      const context = getCurrentNotificationContext();

      logger.info(
        `Checking notifications: ${context.currentHour}:${context.currentMinute}, ` +
          `day=${context.currentDayOfWeek}, isHoliday=${context.isHoliday}`,
      );

      await processAllUsersNotifications(db, context);
    },
  );
