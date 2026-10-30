import * as admin from "firebase-admin";
import { NOTIFICATIONS_SENT_COLLECTION } from "../constants";
import { type Routine } from "../types";

/** 送信履歴ドキュメントへの参照 */
const sentNotificationRef = (
  db: admin.firestore.Firestore,
  notificationId: string,
) => db.collection(NOTIFICATIONS_SENT_COLLECTION).doc(notificationId);

/**
 * 指定の通知が本日すでに送信済みか確認する
 */
export const hasNotificationBeenSent = async (
  db: admin.firestore.Firestore,
  notificationId: string,
): Promise<boolean> => {
  const existingDoc = await sentNotificationRef(db, notificationId).get();

  return existingDoc.exists;
};

/**
 * 通知を送信済みとして記録する（翌日以降に cleanupNotifications が削除する）
 */
export const recordSentNotification = async (
  db: admin.firestore.Firestore,
  notificationId: string,
  routine: Routine,
): Promise<void> => {
  await sentNotificationRef(db, notificationId).set({
    routineId: routine.id,
    routineTitle: routine.title,
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};
