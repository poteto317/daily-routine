import { type WeeklyLogEntry, type WeeklyLogHistory } from "@/types/routine";

const WEEK_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 実在する日付で、かつ月曜のキーだけを週の開始日として認める */
const isWeekStartKey = (key: string): boolean => {
  if (!WEEK_KEY_PATTERN.test(key)) return false;
  const date = new Date(`${key}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === key &&
    date.getUTCDay() === 1
  );
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** 壊れた値は null。weekStart は置き場所（キー）を正とする */
const toWeeklyLogEntry = (
  weekStart: string,
  value: unknown,
): WeeklyLogEntry | null => {
  if (!isRecord(value)) return null;
  const { id, content, createdAt, updatedAt } = value;
  if (
    typeof id !== "string" ||
    typeof content !== "string" ||
    typeof createdAt !== "string" ||
    typeof updatedAt !== "string"
  ) {
    return null;
  }
  // 知らないフィールドも残す（新しい版で足したフィールドを、古い版の保存・同期で消さない）
  return { ...value, id, weekStart, content, createdAt, updatedAt };
};

/**
 * ストレージから読んだ生の値を業務日誌の履歴に整える。
 * オブジェクトでない値・月曜の実在する日付でないキー・フィールドが欠けた値は捨てる。
 * 毎回新しいオブジェクトを返す
 */
export const normalizeWeeklyLogHistory = (raw: unknown): WeeklyLogHistory => {
  const history: WeeklyLogHistory = {};
  if (!isRecord(raw)) return history;

  for (const [weekStart, value] of Object.entries(raw)) {
    if (!isWeekStartKey(weekStart)) continue;
    const entry = toWeeklyLogEntry(weekStart, value);
    if (entry) history[weekStart] = entry;
  }
  return history;
};

/** 週の開始日の降順の一覧 */
export const listWeeklyLogsByLatest = (
  history: WeeklyLogHistory,
): WeeklyLogEntry[] =>
  Object.values(history).sort((left, right) =>
    right.weekStart.localeCompare(left.weekStart),
  );
