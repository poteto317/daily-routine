const JOURNAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 保存・更新で受け付ける最も古い日付（YYYY-MM-DD）。日付欄の min にも使う。
 * デスクトップの Chrome は年を 1 文字打つごとに onChange を送る（"202" で 0202 年）ため、
 * 打ちかけの年のまま保存して一覧から消えるのを防ぐ。API（firebase-functions）は対象外
 */
export const JOURNAL_MIN_DATE = "1900-01-01";

/** 日付の検証で保存を拒否する理由。空は invalid-format に含める。too-old は JOURNAL_MIN_DATE より前 */
export type JournalDateError =
  | "invalid-format"
  | "not-real"
  | "too-old"
  | "future";

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * "YYYY-MM-DD" の年月日が暦の上で実在するか（例: 2026-02-30 は false）。
 * Date.UTC は 0〜99 年を 1900 年代に補正するため、setUTCFullYear で年を直接設定する
 * （firebase-functions の validation/dateFormats.ts の isRealDate と同じ）。
 */
const isRealJournalDate = (value: string): boolean => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

/**
 * 形式（YYYY-MM-DD）と実在だけを見る。未来や JOURNAL_MIN_DATE より前の日付も true
 * （それらを拒否するのは getJournalDateError）
 */
export const isValidJournalDate = (date: string): boolean =>
  JOURNAL_DATE_PATTERN.test(date) && isRealJournalDate(date);

/**
 * 保存・更新で日付を拒否する理由を返す。問題が無ければ null。
 * today は未来の判定の基準にする今日（YYYY-MM-DD）。
 */
export const getJournalDateError = (
  date: string,
  today: string,
): JournalDateError | null => {
  if (!JOURNAL_DATE_PATTERN.test(date)) return "invalid-format";
  if (!isRealJournalDate(date)) return "not-real";
  // どれも YYYY-MM-DD なので、文字列の比較で日付の前後が分かる
  if (date < JOURNAL_MIN_DATE) return "too-old";
  if (date > today) return "future";
  return null;
};

export const formatJournalDate = (dateStr: string): string => {
  // 日付欄の値が空・不正でも、例外や "Invalid Date" にせず入力をそのまま返す
  if (!isValidJournalDate(dateStr)) return dateStr;

  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

export const formatUpdatedAt = (dateTimeStr: string): string => {
  return new Date(dateTimeStr).toLocaleString("ja-JP");
};
