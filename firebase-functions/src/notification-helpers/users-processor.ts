import type * as admin from "firebase-admin";
import type { NotificationContext } from "../date-utils";
import { processUserNotifications } from "./process-user-notifications";

/**
 * Firestoreから全ユーザーを取得し、各ユーザーの通知処理を実行する
 */
export const processAllUsersNotifications = async (
  db: admin.firestore.Firestore,
  context: NotificationContext,
): Promise<void> => {
  const usersSnapshot = await db.collection("users").get();

  for (const userDoc of usersSnapshot.docs) {
    await processUserNotifications({ userData: userDoc.data(), db, ...context });
  }
};
