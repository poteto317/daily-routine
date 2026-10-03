import { readObject } from "../dataAccess";
import type { SyncDocData } from "../../syncDoc";
import type { Expense, ExpensesByMonth, FoundExpense } from "./expenseTypes";

/** 同期ドキュメントから月別の支出を読み出す（未設定・型不正は空） */
export const readExpensesByMonth = (data: SyncDocData): ExpensesByMonth =>
  readObject(readObject(data, "budgetData"), "expenses") as ExpensesByMonth;

/** budgetData 内の他のキーを保ったまま expenses だけを差し替える変更を作る */
export const toBudgetDataChanges = (
  data: SyncDocData,
  expenses: ExpensesByMonth,
): SyncDocData => ({
  budgetData: { ...readObject(data, "budgetData"), expenses },
});

/** "YYYY-MM-DD" から月キー "YYYY-MM" を取り出す */
export const toMonthKey = (date: string): string => date.slice(0, 7);

/** 全月を走査して ID が一致する支出と、それが入っている月を返す */
export const findExpense = (
  expenses: ExpensesByMonth,
  id: string | undefined,
): FoundExpense | null => {
  for (const [month, monthExpenses] of Object.entries(expenses)) {
    const expense = monthExpenses.find((candidate) => candidate.id === id);
    if (expense) return { month, expense };
  }
  return null;
};

/** month 指定ならその月、省略時は全月を月（YYYY-MM）の昇順に連結して返す */
export const listExpenses = (
  expenses: ExpensesByMonth,
  month: string | undefined,
): Expense[] =>
  month
    ? (expenses[month] ?? [])
    : Object.keys(expenses)
        .sort()
        .flatMap((key) => expenses[key]);

/** 支出の日付が属する月の末尾に追加する */
export const addExpense = (
  expenses: ExpensesByMonth,
  expense: Expense,
): ExpensesByMonth => {
  const month = toMonthKey(expense.date);
  return { ...expenses, [month]: [...(expenses[month] ?? []), expense] };
};

/**
 * 支出を更新後の値に置き換える。
 * 同じ月なら並び順を保ち、日付で月をまたぐ場合は旧月から除いて新月へ追加する。
 */
export const replaceExpense = (
  expenses: ExpensesByMonth,
  found: FoundExpense,
  updated: Expense,
): ExpensesByMonth => {
  const nextMonth = toMonthKey(updated.date);
  if (found.month === nextMonth) {
    return {
      ...expenses,
      [found.month]: expenses[found.month].map((expense) =>
        expense.id === updated.id ? updated : expense,
      ),
    };
  }
  return {
    ...expenses,
    [found.month]: expenses[found.month].filter(
      (expense) => expense.id !== updated.id,
    ),
    [nextMonth]: [...(expenses[nextMonth] ?? []), updated],
  };
};

/** 支出を元の月から取り除く（空になった月の配列は残す） */
export const removeExpense = (
  expenses: ExpensesByMonth,
  found: FoundExpense,
): ExpensesByMonth => ({
  ...expenses,
  [found.month]: expenses[found.month].filter(
    (expense) => expense.id !== found.expense.id,
  ),
});
