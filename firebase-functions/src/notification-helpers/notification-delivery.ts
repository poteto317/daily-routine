import type { Firestore } from "../adminSdk";
import { getMessaging } from "../adminSdk";
import * as logger from "firebase-functions/logger";
import { abbreviateTokenForLog } from "../token-log";
import { type Routine } from "../types";
import { createNotificationId } from "./notification-id";
import {
  hasNotificationBeenSent,
  recordSentNotification,
} from "./notification-history";
import { buildRoutineNotificationMessage } from "./notification-message";

/**
 * ルーティンの通知を 1 件送信する。
 * 同じ日に送信済みなら送らない。送信に成功したら送信履歴を記録して true を返す。
 * 送信・記録の失敗はログに残して false を返す（送信済み確認の失敗は呼び出し元へ伝わる）。
 */
export const sendRoutineNotification = async (
  fcmToken: string,
  routine: Routine,
  db: Firestore,
  todayStr: string,
): Promise<boolean> => {
  const notificationId = createNotificationId(fcmToken, routine.id, todayStr);

  if (await hasNotificationBeenSent(db, notificationId)) {
    logger.info(`Already notified: ${routine.title}`);
    return false;
  }

  try {
    await getMessaging().send(
      buildRoutineNotificationMessage(fcmToken, routine),
    );

    await recordSentNotification(db, notificationId, routine);

    logger.info(
      `Sent notification: ${routine.title} to token: ${abbreviateTokenForLog(fcmToken)}`,
    );
    return true;
  } catch (error) {
    logger.error(`Failed to send notification for ${routine.title}:`, error);
    return false;
  }
};
