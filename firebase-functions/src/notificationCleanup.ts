import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import type * as admin from "firebase-admin";
import {
  deleteOldNotifications,
  getCleanupThresholdDate,
} from "./cleanup-helpers";

/**
 * 毎日午前0時に古い通知履歴を削除
 */
export const cleanupNotifications = (db: admin.firestore.Firestore) =>
  onSchedule(
    {
      schedule: "0 0 * * *",
      timeZone: "Asia/Tokyo",
      region: "asia-northeast1",
    },
    async () => {
      const thresholdDate = getCleanupThresholdDate();
      const deletedCount = await deleteOldNotifications(db, thresholdDate);
      logger.info(`Deleted ${deletedCount} old notifications`);
    },
  );
