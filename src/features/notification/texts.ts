/**
 * Notification feature locale constants
 * locales/ja.json から全テキスト定数を集約してエクスポートする
 */

import texts from "./locales/ja.json";

export const NOTIFICATION_SCHEDULE_TITLE = texts.scheduleTitle;

export const getNotificationScheduleBody = (routineTitle: string): string =>
  `"${routineTitle}"${texts.scheduleBodySuffix}`;
