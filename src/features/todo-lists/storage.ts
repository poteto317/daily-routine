import {
  getStorageItem,
  getUserScopedKey,
  setStorageItem,
} from "@/lib/storage/core";
import type { TodoList } from "./types";

export { getTodoCategories, saveTodoCategories } from "./storageCategories";

const STORAGE_KEY = "todo-lists";
const SELECTED_TODO_LIST_ID_KEY = "selected-todo-list-id";

export const getTodoLists = (): TodoList[] => {
  return getStorageItem<TodoList[]>(STORAGE_KEY, []);
};

export const saveTodoLists = (lists: TodoList[]): void => {
  setStorageItem(STORAGE_KEY, lists);
};

export const getStoredSelectedTodoListId = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(getUserScopedKey(SELECTED_TODO_LIST_ID_KEY));
  } catch {
    return null;
  }
};

export const saveSelectedTodoListId = (id: string | null): void => {
  if (typeof window === "undefined") return;
  try {
    const storageKey = getUserScopedKey(SELECTED_TODO_LIST_ID_KEY);
    if (id === null) {
      localStorage.removeItem(storageKey);
      return;
    }

    localStorage.setItem(storageKey, id);
  } catch {
    // ignore
  }
};
