import { type Routine } from "../types";

/**
 * 通知処理に使用するユーザーデータの型
 */
export type UserNotificationData = {
  fcmToken: string;
  routines: Routine[];
};
