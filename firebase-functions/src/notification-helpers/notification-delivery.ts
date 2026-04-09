import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { type Routine } from "../types";
import { createNotificationId } from "./notification-id";
import {
  hasNotificationBeenSent,
  recordSentNotification,
} from "./notification-history";
import { buildRoutineNotificationMessage } from "./notification-message";

export const sendRoutineNotification = async (
  fcmToken: string,
  routine: Routine,
  db: admin.firestore.Firestore,
  todayStr: string,
): Promise<boolean> => {
  const notificationId = createNotificationId(fcmToken, routine.id, todayStr);

  if (await hasNotificationBeenSent(db, notificationId)) {
    logger.info(`Already notified: ${routine.title}`);
    return false;
  }

  try {
    await admin
      .messaging()
      .send(buildRoutineNotificationMessage(fcmToken, routine));

    await recordSentNotification(db, notificationId, routine);

    logger.info(
      `Sent notification: ${routine.title} to token: ${fcmToken.substring(0, 20)}...`,
    );
    return true;
  } catch (error) {
    logger.error(`Failed to send notification for ${routine.title}:`, error);
    return false;
  }
};
