import { generateId } from "../idGenerator";
import { formatJstTime } from "../jstTime";
import type { CreateExpenseInput, ExpensePatchInput } from "./expenseInput";
import type { Expense } from "./expenseTypes";

/**
 * 検証済みの入力から新しい支出を作る。
 * id と createdAt はサーバーが採番し、usedTime 未指定なら JST の現在時刻にする。
 * categoryId 未指定のときはキー自体を持たせない（Firestore に undefined を渡さない）。
 */
export const createExpense = (
  input: CreateExpenseInput,
  now: Date,
): Expense => ({
  id: generateId("expense", now),
  date: input.date,
  amount: input.amount,
  ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
  createdAt: now.toISOString(),
  usedTime: input.usedTime ?? formatJstTime(now),
});

/** 既存の支出へパッチを適用する。clearCategory ならカテゴリを解除する */
export const applyExpensePatch = (
  existing: Expense,
  { patch, clearCategory }: ExpensePatchInput,
): Expense => {
  const updated: Expense = { ...existing, ...patch };
  if (clearCategory) delete updated.categoryId;
  return updated;
};
