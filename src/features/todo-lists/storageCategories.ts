import type { TodoCategory } from "./types";
import { getStorageItem, setStorageItem } from "@/lib/storage/core";

const STORAGE_KEY_TODO_CATEGORIES = "todo-categories";

export const getTodoCategories = (): TodoCategory[] => {
  return getStorageItem<TodoCategory[]>(STORAGE_KEY_TODO_CATEGORIES, []);
};

export const saveTodoCategories = (categories: TodoCategory[]): void => {
  setStorageItem(STORAGE_KEY_TODO_CATEGORIES, categories);
};
