/**
 * ルーティンの型定義
 */
export interface Routine {
  id: string;
  title: string;
  startTime: string;
  daysOfWeek: number[]; // 0-6 (日曜-土曜), 7 (祝日)
  isActive: boolean;
  notificationMinutes?: number;
  // 旧フィールド（後方互換用）
  holidayMode?: "normal" | "include" | "exclude" | "only";
}
