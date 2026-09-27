import type { Expense } from "@/types/routine";
import { daysInMonth, isCurrentMonthDate, toDateKey } from "./date";
import { calculateExpenseTotals } from "./expenseTotals";
import { calculateUnenteredMonthDays } from "./unenteredMonthDays";

export type BudgetMetrics = {
  dailyBudget: number;
  dailyRemainingBudget: number;
  /**
   * 1日あたり使える金額の計算に用いる分母日数。
   * 当月内の未入力日数（今日に入力がある場合も今日例外ルールにより日数に含める）。
   * 当月外の場合は 0。
   */
  unenteredDays: number;
  isCurrentMonth: boolean;
  remaining: number;
  todayExpense: number;
  totalExpense: number;
};

/**
 * 家計簿の月次・日次メトリクス（予算残額、1日あたり予算、1日あたり使える金額など）を統合計算する。
 */
export const calculateBudgetMetrics = (
  currentDate: Date,
  monthBudget: number,
  expenses: readonly Expense[],
  now: Date = new Date(),
): BudgetMetrics => {
  const todayKey = toDateKey(now);
  const isCurrentMonth = isCurrentMonthDate(currentDate, now);
  const currentMonthDays = daysInMonth(currentDate);

  const { totalExpense, todayExpense } = calculateExpenseTotals(
    expenses,
    todayKey,
  );
  const remaining = monthBudget - totalExpense;
  const dailyBudget = monthBudget > 0 ? monthBudget / currentMonthDays : 0;
  const unenteredDays = calculateUnenteredMonthDays(
    currentDate,
    expenses,
    now,
  );
  const dailyRemainingBudget =
    unenteredDays > 0 ? remaining / unenteredDays : 0;

  return {
    dailyBudget,
    dailyRemainingBudget,
    isCurrentMonth,
    remaining,
    todayExpense,
    totalExpense,
    unenteredDays,
  };
};
