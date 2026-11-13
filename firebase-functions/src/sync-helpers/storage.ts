import type { Firestore } from "../adminSdk";
import { FieldValue } from "../adminSdk";
import { USERS_COLLECTION } from "../constants";

/**
 * FCMトークンとルーティン一覧をユーザードキュメントに保存する
 * ドキュメントIDとして FCMトークンを使用する
 */
export const saveUserData = async (
  db: Firestore,
  fcmToken: string,
  routines: unknown[],
): Promise<void> => {
  await db.collection(USERS_COLLECTION).doc(fcmToken).set({
    fcmToken,
    routines,
    updatedAt: FieldValue.serverTimestamp(),
  });
};
