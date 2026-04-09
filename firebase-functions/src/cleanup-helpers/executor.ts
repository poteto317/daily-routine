import type * as admin from "firebase-admin";

/**
 * 閾値日付より古い通知履歴を Firestore から一括削除する
 */
export const deleteOldNotifications = async (
  db: admin.firestore.Firestore,
  thresholdDate: Date,
): Promise<number> => {
  const snapshot = await db
    .collection("notifications_sent")
    .where("sentAt", "<", thresholdDate)
    .get();

  const batch = db.batch();

  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
  }

  await batch.commit();

  return snapshot.size;
};
