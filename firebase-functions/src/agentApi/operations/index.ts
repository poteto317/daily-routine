import type { Action } from "../router";
import {
  categoryOperations,
  expenseItemOperations,
  incomeItemOperations,
} from "./budgetCollections";
import { expenseOperations } from "./expenses";
import { journalOperations } from "./journal";
import {
  todoCategoryOperations,
  todoItemOperations,
  todoListOperations,
} from "./todo";
import type { ResourceOperations } from "./types";

export type ResourceName =
  | "expenses"
  | "categories"
  | "incomeItems"
  | "expenseItems"
  | "journalEntries"
  | "todoLists"
  | "todoItems"
  | "todoCategories";

/** 一覧で受け付けるクエリパラメータ。一覧と削除以外の操作ではクエリを受け付けない */
export const RESOURCE_QUERY_KEYS: Record<ResourceName, readonly string[]> = {
  expenses: ["month"],
  categories: [],
  incomeItems: [],
  expenseItems: [],
  journalEntries: ["date"],
  todoLists: [],
  todoItems: ["listId"],
  todoCategories: [],
};

/** 削除で受け付けるクエリパラメータ。Todo アイテムは対象リストを listId で選ぶ */
export const RESOURCE_REMOVE_QUERY_KEYS: Partial<
  Record<ResourceName, readonly string[]>
> = {
  todoItems: ["listId"],
};

/** リソースとアクションに応じて許可されるクエリパラメータキーの一覧を返す */
export const getAllowedQueryKeys = (
  resource: ResourceName,
  action: Action,
): readonly string[] => {
  if (action === "list") return RESOURCE_QUERY_KEYS[resource] ?? [];
  if (action === "remove") return RESOURCE_REMOVE_QUERY_KEYS[resource] ?? [];
  return [];
};

export const RESOURCE_OPERATIONS: Record<ResourceName, ResourceOperations> = {
  expenses: expenseOperations,
  categories: categoryOperations,
  incomeItems: incomeItemOperations,
  expenseItems: expenseItemOperations,
  journalEntries: journalOperations,
  todoLists: todoListOperations,
  todoItems: todoItemOperations,
  todoCategories: todoCategoryOperations,
};
