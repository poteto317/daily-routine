import type { DocumentData } from "../adminSdk";
import { type Routine } from "../types";
import type { UserNotificationData } from "./types";

export type { UserNotificationData };

/**
 * Firestore のユーザードキュメントから通知処理に必要なデータを抽出する
 * データが存在しない場合は null を返す
 */
export const extractUserNotificationData = (
  userData: DocumentData,
): UserNotificationData | null => {
  const fcmToken = userData.fcmToken;
  const routines: Routine[] = userData.routines || [];

  if (!fcmToken || routines.length === 0) return null;

  return { fcmToken, routines };
};
