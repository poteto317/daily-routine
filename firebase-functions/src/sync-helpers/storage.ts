import * as admin from "firebase-admin";

/**
 * FCMトークンとルーティン一覧をユーザードキュメントに保存する
 * ドキュメントIDとして FCMトークンを使用する
 */
export const saveUserData = async (
  db: admin.firestore.Firestore,
  fcmToken: string,
  routines: unknown[],
): Promise<void> => {
  await db.collection("users").doc(fcmToken).set({
    fcmToken,
    routines,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
};
