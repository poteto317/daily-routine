import { ApiError, notFound } from "../errors";
import {
  asJsonObject,
  assertKnownKeys,
  compact,
  parseQueryMonth,
  readAmount,
  readDate,
  readString,
  readTime,
  required,
} from "../validation";
import { readArray, readObject } from "./dataAccess";
import { generateId } from "./idGenerator";
import { formatJstTime } from "./jstTime";
import type { Operation, ResourceOperations, SyncDocData } from "./types";

type Expense = {
  id: string;
  date: string;
  amount: number;
  categoryId?: string;
  createdAt: string;
  usedTime?: string;
};
type ExpensesByMonth = Record<string, Expense[]>;

const ALLOWED_KEYS = ["date", "amount", "categoryId", "usedTime"] as const;
const CATEGORY_ID_OPTIONS = { maxLength: 100 } as const;

const readExpensesByMonth = (data: SyncDocData): ExpensesByMonth =>
  readObject(readObject(data, "budgetData"), "expenses") as ExpensesByMonth;

const toBudgetDataChanges = (
  data: SyncDocData,
  expenses: ExpensesByMonth,
): SyncDocData => ({
  budgetData: { ...readObject(data, "budgetData"), expenses },
});

const toMonth = (date: string): string => date.slice(0, 7);

const assertCategoryExists = (data: SyncDocData, categoryId: string): void => {
  const exists = readArray<{ id: string }>(data, "budgetCategories").some(
    (category) => category.id === categoryId,
  );
  if (!exists) {
    throw new ApiError(400, "invalid_field", "categoryId: 存在しないカテゴリです");
  }
};

const findExpense = (
  expenses: ExpensesByMonth,
  id: string | undefined,
): { month: string; expense: Expense } | null => {
  for (const [month, monthExpenses] of Object.entries(expenses)) {
    const expense = monthExpenses.find((candidate) => candidate.id === id);
    if (expense) return { month, expense };
  }
  return null;
};

const list: Operation = ({ data, query }) => {
  const month = parseQueryMonth(query.month);
  const expenses = readExpensesByMonth(data);
  const result = month ? (expenses[month] ?? []) : Object.values(expenses).flat();
  return { status: 200, body: { expenses: result } };
};

const create: Operation = ({ data, body, now }) => {
  const input = asJsonObject(body);
  assertKnownKeys(input, ALLOWED_KEYS);
  const date = required("date", readDate(input, "date"));
  const amount = required("amount", readAmount(input, "amount"));
  const categoryId = readString(input, "categoryId", CATEGORY_ID_OPTIONS);
  if (categoryId !== undefined) assertCategoryExists(data, categoryId);

  const expense: Expense = {
    id: generateId("expense", now),
    date,
    amount,
    ...(categoryId !== undefined ? { categoryId } : {}),
    createdAt: now.toISOString(),
    usedTime: readTime(input, "usedTime") ?? formatJstTime(now),
  };
  const expenses = readExpensesByMonth(data);
  const month = toMonth(date);
  return {
    status: 201,
    body: { expense },
    changes: toBudgetDataChanges(data, {
      ...expenses,
      [month]: [...(expenses[month] ?? []), expense],
    }),
  };
};

const update: Operation = ({ data, id, body }) => {
  const input = asJsonObject(body);
  assertKnownKeys(input, ALLOWED_KEYS);
  const expenses = readExpensesByMonth(data);
  const found = findExpense(expenses, id);
  if (!found) throw notFound("支出");
  if (Object.keys(input).length === 0) {
    throw new ApiError(400, "empty_patch", "更新するフィールドを指定してください");
  }

  const clearCategory = input.categoryId === null;
  const categoryId = clearCategory
    ? undefined
    : readString(input, "categoryId", CATEGORY_ID_OPTIONS);
  if (categoryId !== undefined) assertCategoryExists(data, categoryId);

  const updated: Expense = {
    ...found.expense,
    ...compact({
      date: readDate(input, "date"),
      amount: readAmount(input, "amount"),
      usedTime: readTime(input, "usedTime"),
      categoryId,
    }),
  };
  if (clearCategory) delete updated.categoryId;

  const fromMonth = found.month;
  const toMonthKey = toMonth(updated.date);
  const next: ExpensesByMonth =
    fromMonth === toMonthKey
      ? {
          ...expenses,
          [fromMonth]: expenses[fromMonth].map((expense) =>
            expense.id === updated.id ? updated : expense,
          ),
        }
      : {
          ...expenses,
          [fromMonth]: expenses[fromMonth].filter(
            (expense) => expense.id !== updated.id,
          ),
          [toMonthKey]: [...(expenses[toMonthKey] ?? []), updated],
        };

  return {
    status: 200,
    body: { expense: updated },
    changes: toBudgetDataChanges(data, next),
  };
};

const remove: Operation = ({ data, id }) => {
  const expenses = readExpensesByMonth(data);
  const found = findExpense(expenses, id);
  if (!found) throw notFound("支出");
  return {
    status: 200,
    body: { deleted: id },
    changes: toBudgetDataChanges(data, {
      ...expenses,
      [found.month]: expenses[found.month].filter((expense) => expense.id !== id),
    }),
  };
};

export const expenseOperations: ResourceOperations = {
  list,
  create,
  update,
  remove,
};
