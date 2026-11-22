import type { Firestore } from "../adminSdk";
import { NOTIFICATION_SUBSCRIPTIONS_COLLECTION } from "../constants";
import { type NotificationContext } from "../date-utils";
import { processUserNotifications } from "./process-user-notifications";

/**
 * 端末ごとの通知登録を取得し、各登録の通知処理を実行する
 */
export const processNotificationSubscriptions = async (
  db: Firestore,
  context: NotificationContext,
): Promise<void> => {
  const subscriptions = await db
    .collection(NOTIFICATION_SUBSCRIPTIONS_COLLECTION)
    .get();

  for (const subscription of subscriptions.docs) {
    await processUserNotifications({
      userData: subscription.data(),
      db,
      ...context,
    });
  }
};
