import { ApiError, emptyPatch } from "../../errors";
import {
  compact,
  readAmount,
  readDate,
  readString,
  readTime,
  required,
  type JsonObject,
} from "../../validation";
import { readArray } from "../dataAccess";
import type { SyncDocData } from "../../syncDoc";
import type { Expense } from "./expenseTypes";

/** 支出の本文に指定できるキー */
export const EXPENSE_KEYS = [
  "date",
  "amount",
  "categoryId",
  "usedTime",
] as const;
const CATEGORY_ID_OPTIONS = { maxLength: 100 } as const;

/** 指定したカテゴリが budgetCategories に存在しなければ 400 にする */
export const assertCategoryExists = (
  data: SyncDocData,
  categoryId: string,
): void => {
  const exists = readArray<{ id: string }>(data, "budgetCategories").some(
    (category) => category.id === categoryId,
  );
  if (!exists) {
    throw new ApiError(
      400,
      "invalid_field",
      "categoryId: 存在しないカテゴリです",
    );
  }
};

export type CreateExpenseInput = {
  date: string;
  amount: number;
  categoryId?: string;
  usedTime?: string;
};

/** 作成用の本文を検証する。date と amount は必須 */
export const parseCreateExpenseInput = (
  input: JsonObject,
  data: SyncDocData,
): CreateExpenseInput => {
  const date = required("date", readDate(input, "date"));
  const amount = required("amount", readAmount(input, "amount"));
  const categoryId = readString(input, "categoryId", CATEGORY_ID_OPTIONS);
  if (categoryId !== undefined) assertCategoryExists(data, categoryId);
  return { date, amount, categoryId, usedTime: readTime(input, "usedTime") };
};

export type ExpensePatchInput = {
  patch: Partial<Pick<Expense, "date" | "amount" | "usedTime" | "categoryId">>;
  /** categoryId: null が指定され、カテゴリを解除する */
  clearCategory: boolean;
};

/** 更新用の本文を検証する。空の本文は 400 empty_patch */
export const parseExpensePatchInput = (
  input: JsonObject,
  data: SyncDocData,
): ExpensePatchInput => {
  if (Object.keys(input).length === 0) throw emptyPatch();

  const clearCategory = input.categoryId === null;
  const categoryId = clearCategory
    ? undefined
    : readString(input, "categoryId", CATEGORY_ID_OPTIONS);
  if (categoryId !== undefined) assertCategoryExists(data, categoryId);

  return {
    patch: compact({
      date: readDate(input, "date"),
      amount: readAmount(input, "amount"),
      usedTime: readTime(input, "usedTime"),
      categoryId,
    }),
    clearCategory,
  };
};
