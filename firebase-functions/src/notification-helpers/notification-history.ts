import * as admin from "firebase-admin";
import { Routine } from "../types";

/**
 * 指定の通知が本日すでに送信済みか確認する
 */
export const hasNotificationBeenSent = async (
  db: admin.firestore.Firestore,
  notificationId: string,
): Promise<boolean> => {
  const existingDoc = await db
    .collection("notifications_sent")
    .doc(notificationId)
    .get();

  return existingDoc.exists;
};

export const recordSentNotification = async (
  db: admin.firestore.Firestore,
  notificationId: string,
  routine: Routine,
): Promise<void> => {
  await db.collection("notifications_sent").doc(notificationId).set({
    routineId: routine.id,
    routineTitle: routine.title,
    sentAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};
