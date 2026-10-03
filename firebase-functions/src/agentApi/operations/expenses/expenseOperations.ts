import { notFound } from "../../errors";
import { parseBody, parseQueryMonth } from "../../validation";
import { createdOutcome, deletedOutcome, okOutcome } from "../outcomes";
import type { Operation, ResourceOperations } from "../types";
import {
  assertAmountRuleForPatch,
  assertZeroAmountOnPastDate,
} from "./expenseAmountRule";
import { applyExpensePatch, createExpense } from "./expenseEntity";
import {
  EXPENSE_KEYS,
  parseCreateExpenseInput,
  parseExpensePatchInput,
} from "./expenseInput";
import {
  addExpense,
  findExpense,
  listExpenses,
  readExpensesByMonth,
  removeExpense,
  replaceExpense,
  toBudgetDataChanges,
} from "./expenseStore";

const list: Operation = ({ data, query }) => {
  const month = parseQueryMonth(query.month);
  const expenses = readExpensesByMonth(data);
  return okOutcome({ expenses: listExpenses(expenses, month) });
};

const create: Operation = ({ data, body, now }) => {
  const input = parseCreateExpenseInput(parseBody(body, EXPENSE_KEYS), data);
  assertZeroAmountOnPastDate(input, now);
  const expense = createExpense(input, now);
  return createdOutcome(
    { expense },
    toBudgetDataChanges(data, addExpense(readExpensesByMonth(data), expense)),
  );
};

const update: Operation = ({ data, id, body, now }) => {
  const input = parseBody(body, EXPENSE_KEYS);
  const expenses = readExpensesByMonth(data);
  const found = findExpense(expenses, id);
  if (!found) throw notFound("支出");

  const patchInput = parseExpensePatchInput(input, data);
  const updated = applyExpensePatch(found.expense, patchInput);
  assertAmountRuleForPatch(patchInput.patch, updated, now);
  return okOutcome(
    { expense: updated },
    toBudgetDataChanges(data, replaceExpense(expenses, found, updated)),
  );
};

const remove: Operation = ({ data, id }) => {
  const expenses = readExpensesByMonth(data);
  const found = findExpense(expenses, id);
  if (!found) throw notFound("支出");
  return deletedOutcome(
    id,
    toBudgetDataChanges(data, removeExpense(expenses, found)),
  );
};

export const expenseOperations: ResourceOperations = {
  list,
  create,
  update,
  remove,
};
