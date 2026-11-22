import { createHash } from "node:crypto";
import { FieldValue, type Firestore } from "../adminSdk";
import { NOTIFICATION_SUBSCRIPTIONS_COLLECTION } from "../constants";
import type { Routine } from "../types";

/** 端末の登録と所有者の確認を同じトランザクションで行う。 */
export const saveNotificationSubscription = async (
  db: Firestore,
  ownerUid: string,
  fcmToken: string,
  routines: Routine[],
): Promise<boolean> => {
  const key = createHash("sha256").update(fcmToken).digest("hex");
  const ref = db.collection(NOTIFICATION_SUBSCRIPTIONS_COLLECTION).doc(key);
  return db.runTransaction(async (tx) => {
    const existing = await tx.get(ref);
    if (existing.exists && existing.data()?.ownerUid !== ownerUid) return false;

    tx.set(ref, {
      ownerUid,
      fcmToken,
      routines,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return true;
  });
};
