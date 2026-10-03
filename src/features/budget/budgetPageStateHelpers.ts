import type { Expense } from "@/types/routine";
import { getMonthlyExpenses } from "./storage";
import { getDefaultExpenseDate, toMonthKey } from "./utils/date";

export type MonthStateSnapshot = {
  monthKey: string;
  expenses: Expense[];
  defaultExpenseDate: string;
};

// 収入・固定費・変動費の項目は月に紐付かないテンプレートのため、
// 「月に使える金額」（monthBudget）はここには含めない。
// 唯一の情報源は useBudgetAllowanceState であり、月移動のたびに
// 再計算・再同期すると、リアルタイム同期でストレージが更新された際に
// 画面上の金額表示が食い違う可能性があるため（useBudgetPageState.ts参照）。
export const getMonthStateSnapshot = (date: Date): MonthStateSnapshot => {
  const monthKey = toMonthKey(date);

  return {
    monthKey,
    expenses: getMonthlyExpenses(monthKey),
    defaultExpenseDate: getDefaultExpenseDate(date),
  };
};

const parseAmount = (
  value: string,
  isAllowed: (amount: number) => boolean,
): number | null => {
  const amount = Number.parseFloat(value);
  return Number.isNaN(amount) || !isAllowed(amount) ? null : amount;
};

/** 0 を含む 0 以上の金額を読み取る。数値でない・負の値は null */
export const parseNonNegativeAmount = (value: string): number | null =>
  parseAmount(value, (amount) => amount >= 0);

/** 0 より大きい金額を読み取る。数値でない・0 以下は null */
export const parsePositiveAmount = (value: string): number | null =>
  parseAmount(value, (amount) => amount > 0);
