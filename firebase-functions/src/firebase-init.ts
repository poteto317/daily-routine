import * as admin from "firebase-admin";

/**
 * Firebase Admin SDK を初期化し Firestore インスタンスを返す
 */
export const initializeFirebase = (): admin.firestore.Firestore => {
  admin.initializeApp();
  return admin.firestore();
};
