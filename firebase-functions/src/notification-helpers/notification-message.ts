import type { Message } from "../adminSdk";
import { type Routine } from "../types";
import { NOTIFICATION_TEXTS } from "./notification-texts";

/**
 * ルーティン通知用の FCM メッセージを構築する
 */
export const buildRoutineNotificationMessage = (
  fcmToken: string,
  routine: Routine,
): Message => {
  return {
    token: fcmToken,
    notification: {
      title: NOTIFICATION_TEXTS.title,
      body: NOTIFICATION_TEXTS.body(routine.title),
    },
    webpush: {
      notification: {
        icon: NOTIFICATION_TEXTS.icon,
        badge: NOTIFICATION_TEXTS.badge,
        tag: routine.id,
        requireInteraction: false,
      },
    },
  };
};
