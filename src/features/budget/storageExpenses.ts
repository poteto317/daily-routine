import { generateId } from "@/lib/storage/core";
import type { Expense } from "@/types/routine";
import { getBudgetData, saveBudgetData } from "./storageData";
import { formatTimeOfDay } from "./utils/date";

export const getMonthlyExpenses = (month: string): Expense[] => {
  const data = getBudgetData();
  return data.expenses[month] || [];
};

export const addExpense = (
  date: string,
  amount: number,
  categoryId?: string,
): void => {
  const data = getBudgetData();
  const month = date.substring(0, 7);

  if (!data.expenses[month]) {
    data.expenses[month] = [];
  }

  // createdAt（記録時刻）とusedTime（追加時刻）は、追加時点では
  // 同じ瞬間を指すため同一のnowから算出する。
  const now = new Date();

  data.expenses[month].push({
    id: generateId("expense"),
    date,
    amount,
    categoryId,
    createdAt: now.toISOString(),
    usedTime: formatTimeOfDay(now),
  });

  saveBudgetData(data);
};

export const updateExpense = (
  month: string,
  expenseId: string,
  updates: Partial<
    Pick<Expense, "date" | "amount" | "categoryId" | "usedTime">
  >,
): void => {
  const data = getBudgetData();
  const monthExpenses = data.expenses[month];

  if (!monthExpenses) return;

  const existing = monthExpenses.find((expense) => expense.id === expenseId);

  if (!existing) return;

  // updates に含まれないキーは既存の値を保持する（例えば categoryId を
  // 省略した場合はカテゴリを変更しない。undefined を明示的に渡した場合は
  // カテゴリを未設定にクリアする）
  const updated: Expense = { ...existing, ...updates };
  const nextMonth = updated.date.substring(0, 7);

  if (nextMonth === month) {
    // 月をまたがない場合は配列内の並び順を保ったまま該当要素だけ書き換える
    data.expenses[month] = monthExpenses.map((expense) =>
      expense.id === expenseId ? updated : expense,
    );
    saveBudgetData(data);
    return;
  }

  // 日付の変更で月をまたぐ場合は、旧月バケットから除去してから
  // 新しい日付の月バケットへ入れ直す
  data.expenses[month] = monthExpenses.filter(
    (expense) => expense.id !== expenseId,
  );

  if (!data.expenses[nextMonth]) {
    data.expenses[nextMonth] = [];
  }

  data.expenses[nextMonth].push(updated);

  saveBudgetData(data);
};

export const deleteExpense = (month: string, expenseId: string): void => {
  const data = getBudgetData();

  if (!data.expenses[month]) return;

  data.expenses[month] = data.expenses[month].filter(
    (expense) => expense.id !== expenseId,
  );
  saveBudgetData(data);
};

export const getMonthlyTotalExpense = (month: string): number => {
  return getMonthlyExpenses(month).reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
};
