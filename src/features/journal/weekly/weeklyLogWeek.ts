/**
 * 週ごとの業務日誌の週（月曜〜日曜）の計算。
 * 日付の文字列（YYYY-MM-DD）を UTC の 0 時として扱い、端末のタイムゾーンに左右されない。
 * 表示用の文言は weeklyLogTexts.ts に置く。
 * 計算は統計の weeklyGoalDateKeys.ts と同じ（機能をまたいだ依存を作らないため journal 側に置く）。
 */
const DAY_MS = 24 * 60 * 60 * 1000;

export const toUtcDate = (dateKey: string): Date =>
  new Date(`${dateKey}T00:00:00.000Z`);

export const addDays = (dateKey: string, days: number): string =>
  new Date(toUtcDate(dateKey).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10);

/** dateKey（YYYY-MM-DD）を含む週の月曜 */
export const getWeeklyLogWeekStart = (dateKey: string): string => {
  const day = toUtcDate(dateKey).getUTCDay();
  return addDays(dateKey, -((day + 6) % 7));
};

/** 週の開始日を weeks 週ずらす（負なら前の週） */
export const shiftWeeklyLogWeek = (weekStart: string, weeks: number): string =>
  addDays(weekStart, weeks * 7);
