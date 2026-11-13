import type { Firestore } from "../adminSdk";
import { USERS_COLLECTION } from "../constants";
import { type NotificationContext } from "../date-utils";
import { processUserNotifications } from "./process-user-notifications";

/**
 * Firestoreから全ユーザーを取得し、各ユーザーの通知処理を実行する
 */
export const processAllUsersNotifications = async (
  db: Firestore,
  context: NotificationContext,
): Promise<void> => {
  const usersSnapshot = await db.collection(USERS_COLLECTION).get();

  for (const userDoc of usersSnapshot.docs) {
    await processUserNotifications({
      userData: userDoc.data(),
      db,
      ...context,
    });
  }
};
