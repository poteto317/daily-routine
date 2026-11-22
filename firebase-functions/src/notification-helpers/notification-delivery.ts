import { createHash } from "node:crypto";
import type { Firestore } from "../adminSdk";
import { getMessaging } from "../adminSdk";
import * as logger from "firebase-functions/logger";
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
 * 送信・記録の失敗はログに残して false を返す。
 * 送信済み確認の失敗は利用者データを含まない例外として呼び出し元へ伝わる。
 */
export const sendRoutineNotification = async (
  fcmToken: string,
  routine: Routine,
  db: Firestore,
  todayStr: string,
): Promise<boolean> => {
  const notificationId = createNotificationId(fcmToken, routine.id, todayStr);
  const deliveryId = createHash("sha256").update(notificationId).digest("hex");

  const alreadySent = await hasNotificationBeenSent(db, notificationId).catch(
    () => {
      // スケジューラはハンドラーが投げた例外のメッセージをログに記録する。
      throw new Error(`Notification history lookup failed (${deliveryId})`);
    },
  );
  if (alreadySent) {
    logger.info("Notification already sent", { deliveryId });
    return false;
  }

  try {
    await getMessaging().send(
      buildRoutineNotificationMessage(fcmToken, routine),
    );
  } catch {
    logger.error("Notification send failed", { deliveryId });
    return false;
  }

  try {
    await recordSentNotification(db, notificationId, routine);
  } catch {
    logger.error("Notification history write failed", { deliveryId });
    return false;
  }

  logger.info("Notification sent", { deliveryId });
  return true;
};
