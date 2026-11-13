import { ensureAdminApp, getFirestore, type Firestore } from "./adminSdk";

/**
 * Firebase Admin SDK を初期化し Firestore インスタンスを返す
 */
export const initializeFirebase = (): Firestore => {
  ensureAdminApp();
  return getFirestore();
};
