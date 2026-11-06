import type { Expense } from "@/types/routine";
import {
  buildDateValue,
  daysInMonthByKey,
  getDayFromDateValue,
  getMonthKeyFromDateValue,
} from "./date";

/**
 * 表示中の月のうち、今日より前の日で、支出の記録（金額 0 円を含む）が 1 件も無い日を、
 * 日付の昇順の "YYYY-MM-DD" の配列で返す（家計簿の「未入力の日」）。
 * - 表示中の月が今日の月より後: []
 * - 表示中の月が今日の月: 1 日〜昨日のうち記録の無い日（今日は含めない。今日が 1 日なら []）
 * - 表示中の月が今日の月より前: その月の全日のうち記録の無い日
 * 支出は date が表示中の月の日付と一致する記録だけを入力済みに数える（別の月の日付を持つ記録は無視する）。
 *
 * 「1日あたり使える金額」の分母の未入力日数（calculateUnenteredMonthDays。今日・未来の日を
 * 含む日数）とは別の概念。時計は読まず、今日は引数で受ける。
 *
 * @param monthKey 表示中の月（"YYYY-MM"）
 * @param expenses 支出の記録
 * @param todayKey 端末のローカルの今日（"YYYY-MM-DD"）
 */
export const listMissingExpenseDates = (
  monthKey: string,
  expenses: readonly Expense[],
  todayKey: string,
): string[] => {
  const todayMonthKey = getMonthKeyFromDateValue(todayKey);
  // "YYYY-MM" は固定長なので、文字列の大小がそのまま月の前後になる
  if (monthKey > todayMonthKey) {
    return [];
  }

  const lastDay =
    monthKey === todayMonthKey
      ? getDayFromDateValue(todayKey) - 1
      : daysInMonthByKey(monthKey);

  // 表示中の月の日付だけを下で照合するので、別の月の日付を持つ記録が入っていても
  // 表示中の月の日を「入力済み」にしない
  const recordedDates = new Set(expenses.map((expense) => expense.date));

  const missingDates: string[] = [];
  for (let day = 1; day <= lastDay; day++) {
    const dateKey = buildDateValue(monthKey, day);
    if (!recordedDates.has(dateKey)) {
      missingDates.push(dateKey);
    }
  }
  return missingDates;
};

/** "YYYY-MM-DD" をローカル時刻の 0 時の Date にする（既存の formatExpenseDate と同じ解釈）。 */
const toLocalDate = (dateKey: string): Date => new Date(`${dateKey}T00:00:00`);

/** "YYYY-MM-DD" → "3日(火)"（未入力の日のボタンの表記） */
export const formatMissingDayLabel = (dateKey: string): string =>
  toLocalDate(dateKey).toLocaleDateString("ja-JP", {
    day: "numeric",
    weekday: "short",
  });

/** "YYYY-MM-DD" → "11月3日(火)"（未入力の日のボタンの読み上げ名の日付の部分） */
export const formatMissingDayFullLabel = (dateKey: string): string =>
  toLocalDate(dateKey).toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
