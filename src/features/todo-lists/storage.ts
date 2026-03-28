import { getUserScopedKey } from "@/lib/storage/core";
import type { TodoList } from "./types";

const STORAGE_KEY = "todo-lists";
const SELECTED_TODO_LIST_ID_KEY = "selected-todo-list-id";

export const getTodoLists = (): TodoList[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(getUserScopedKey(STORAGE_KEY));
    if (!data) return [];
    return JSON.parse(data) as TodoList[];
  } catch {
    return [];
  }
};

export const saveTodoLists = (lists: TodoList[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getUserScopedKey(STORAGE_KEY), JSON.stringify(lists));
  } catch {
    // ignore
  }
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
