import {
  getTodoCategories,
  getTodoLists,
  saveTodoCategories,
  saveTodoLists,
} from "@/features/todo-lists/storage";
import type { SyncPayload } from "./types";

export type TodoListSyncData = Pick<
  SyncPayload,
  "todoLists" | "todoCategories"
>;

export type TodoListSyncDataSummary = {
  todoLists: unknown[];
  todoCategories: unknown[];
};

export const collectTodoListSyncData = (): TodoListSyncData => ({
  todoLists: getTodoLists(),
  todoCategories: getTodoCategories(),
});

export const normalizeTodoListSyncData = (
  data: Partial<TodoListSyncData>,
): TodoListSyncData => ({
  todoLists: data.todoLists ?? [],
  todoCategories: data.todoCategories ?? [],
});

export const saveTodoListSyncData = (
  data: TodoListSyncData,
): void => {
  saveTodoLists(data.todoLists);
  saveTodoCategories(data.todoCategories);
};

export const hasTodoListSyncData = (
  data: TodoListSyncDataSummary,
): boolean => data.todoLists.length > 0 || data.todoCategories.length > 0;
