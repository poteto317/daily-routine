/** 週ごとの業務日誌（1 週 1 件） */
export interface WeeklyLogEntry {
  id: string;
  /** 週の開始日（月曜。JST の YYYY-MM-DD） */
  weekStart: string;
  content: string;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

/** 週の開始日（月曜。YYYY-MM-DD）をキーにした、1 週 1 件の業務日誌 */
export interface WeeklyLogHistory {
  [weekStart: string]: WeeklyLogEntry;
}
