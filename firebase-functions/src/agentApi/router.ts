import { ApiError } from "./errors";
import type { ResourceName } from "./operations";

export type Action = "list" | "create" | "update" | "remove";

export type RouteMatch = {
  resource: ResourceName;
  action: Action;
  id?: string;
};

const RESOURCE_PATHS: Record<string, ResourceName> = {
  "budget/expenses": "expenses",
  "budget/categories": "categories",
  "budget/income-items": "incomeItems",
  "budget/expense-items": "expenseItems",
  "journal/entries": "journalEntries",
  "todo/lists": "todoLists",
  "todo/items": "todoItems",
  "todo/categories": "todoCategories",
  "workout/exercises": "workoutExercises",
  "workout/records": "workoutRecords",
};

const COLLECTION_ACTIONS: Record<string, Action> = {
  GET: "list",
  POST: "create",
};

const ITEM_ACTIONS: Record<string, Action> = {
  PATCH: "update",
  DELETE: "remove",
};

const notFoundRoute = (): ApiError =>
  new ApiError(404, "not_found", "エンドポイントが見つかりません");

const methodNotAllowed = (): ApiError =>
  new ApiError(405, "method_not_allowed", "このメソッドは使用できません");

const invalidPath = (): ApiError =>
  new ApiError(400, "invalid_path", "パスの ID が不正です");

export const matchRoute = (method: string, path: string): RouteMatch => {
  const segments = path.split("/").filter((segment) => segment.length > 0);
  if (segments.length < 2 || segments.length > 3) throw notFoundRoute();

  const resource = RESOURCE_PATHS[`${segments[0]}/${segments[1]}`];
  if (!resource) throw notFoundRoute();

  if (segments.length === 2) {
    const action = COLLECTION_ACTIONS[method];
    if (!action) throw methodNotAllowed();
    return { resource, action, id: undefined };
  }

  const action = ITEM_ACTIONS[method];
  if (!action) throw methodNotAllowed();
  try {
    return { resource, action, id: decodeURIComponent(segments[2]) };
  } catch {
    throw invalidPath();
  }
};
