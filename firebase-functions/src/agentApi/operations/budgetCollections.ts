import {
  compact,
  readAmount,
  readEnum,
  readString,
  required,
  type JsonObject,
} from "../validation";
import { createSimpleCollection } from "./simpleCollection";

const NAME_OPTIONS = { maxLength: 100, trim: true } as const;
const EXPENSE_ITEM_KINDS = ["fixed", "variable"] as const;

export const categoryOperations = createSimpleCollection({
  field: "budgetCategories",
  responseKey: "categories",
  itemKey: "category",
  idPrefix: "budget-category",
  allowedKeys: ["name"],
  parseCreate: (body: JsonObject) => ({
    name: required("name", readString(body, "name", NAME_OPTIONS)),
  }),
  parsePatch: (body: JsonObject) =>
    compact({ name: readString(body, "name", NAME_OPTIONS) }),
});

export const incomeItemOperations = createSimpleCollection({
  field: "budgetIncomeItems",
  responseKey: "incomeItems",
  itemKey: "incomeItem",
  idPrefix: "budget-income-item",
  allowedKeys: ["name", "amount"],
  parseCreate: (body: JsonObject) => ({
    name: required("name", readString(body, "name", NAME_OPTIONS)),
    amount: required("amount", readAmount(body, "amount")),
  }),
  parsePatch: (body: JsonObject) =>
    compact({
      name: readString(body, "name", NAME_OPTIONS),
      amount: readAmount(body, "amount"),
    }),
});

export const expenseItemOperations = createSimpleCollection({
  field: "budgetExpenseItems",
  responseKey: "expenseItems",
  itemKey: "expenseItem",
  idPrefix: "budget-expense-item",
  allowedKeys: ["name", "amount", "kind"],
  parseCreate: (body: JsonObject) => ({
    name: required("name", readString(body, "name", NAME_OPTIONS)),
    amount: required("amount", readAmount(body, "amount")),
    kind: required("kind", readEnum(body, "kind", EXPENSE_ITEM_KINDS)),
  }),
  parsePatch: (body: JsonObject) =>
    compact({
      name: readString(body, "name", NAME_OPTIONS),
      amount: readAmount(body, "amount"),
      kind: readEnum(body, "kind", EXPENSE_ITEM_KINDS),
    }),
});
