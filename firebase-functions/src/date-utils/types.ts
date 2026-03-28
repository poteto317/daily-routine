/**
 * 通知判定に必要な現在時刻・曜日・祝日情報をまとめたコンテキスト型
 */
export type NotificationContext = {
  currentHour: number;
  currentMinute: number;
  currentDayOfWeek: number;
  isHoliday: boolean;
  todayStr: string;
};
