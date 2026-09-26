import type { Expense } from "@/types/routine";
import {
  daysInMonth,
  getMonthKeyFromDateValue,
  isCurrentMonthDate,
  toDateKey,
  toMonthKey,
} from "./date";

/**
 * 指定月の未入力日数（1日あたり使える金額の分母）を算出する。
 * - 当月でない場合: 0
 * - 当月の場合: 今月の総日数 - 「今日以外で支出入力がある日（当月分）」のユニーク日数
 *   ※今日に入力があっても今日だけは日数に含める（今日例外ルール）
 *   ※結果は 0 未満にならないようクランプする
 */
export const calculateUnenteredMonthDays = (
  currentDate: Date,
  expenses: readonly Expense[],
  now: Date = new Date(),
): number => {
  if (!isCurrentMonthDate(currentDate, now)) {
    return 0;
  }
  const currentMonthDays = daysInMonth(currentDate);
  const currentMonthKey = toMonthKey(currentDate);
  const todayKey = toDateKey(now);

  const expenseDatesExcludingToday = new Set<string>();
  for (const expense of expenses) {
    if (
      getMonthKeyFromDateValue(expense.date) === currentMonthKey &&
      expense.date !== todayKey
    ) {
      expenseDatesExcludingToday.add(expense.date);
    }
  }

  return Math.max(0, currentMonthDays - expenseDatesExcludingToday.size);
};
