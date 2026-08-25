import type { PersistTodoCategories, TodoCategory } from "./types";
import type { TodoItemBgColorValue } from "./todoItemBgColor";
import {
  addTodoCategory,
  removeTodoCategory,
  renameTodoCategory,
  reorderTodoCategories,
  updateTodoCategoryColor,
} from "./todoCategoryMutations";
import { normalizeCategoryName } from "./todoCategoryNameNormalization";

export type ConfirmDelete = (message: string) => boolean;

export const createTodoCategoryAndPersist = (params: {
  categories: TodoCategory[];
  nameInput: string;
  color?: TodoItemBgColorValue;
  persist: PersistTodoCategories;
}): TodoCategory[] | null => {
  const { categories, nameInput, color, persist } = params;
  const nextCategories = addTodoCategory(categories, nameInput, color);

  if (nextCategories === categories) {
    return null;
  }

  persist(nextCategories);
  return nextCategories;
};

export const renameTodoCategoryAndPersist = (params: {
  categories: TodoCategory[];
  categoryId: string;
  name: string;
  persist: PersistTodoCategories;
}): TodoCategory[] | null => {
  const { categories, categoryId, name, persist } = params;
  const normalized = normalizeCategoryName(name);
  if (!normalized) return null;

  const currentCategory = categories.find(
    (category) => category.id === categoryId,
  );
  if (!currentCategory || currentCategory.name === normalized) {
    return null;
  }

  const nextCategories = renameTodoCategory(categories, categoryId, normalized);
  persist(nextCategories);
  return nextCategories;
};

export const updateTodoCategoryColorAndPersist = (params: {
  categories: TodoCategory[];
  categoryId: string;
  color: TodoItemBgColorValue | undefined;
  persist: PersistTodoCategories;
}): TodoCategory[] | null => {
  const { categories, categoryId, color, persist } = params;
  const currentCategory = categories.find(
    (category) => category.id === categoryId,
  );
  if (!currentCategory || currentCategory.color === color) {
    return null;
  }

  const nextCategories = updateTodoCategoryColor(categories, categoryId, color);
  persist(nextCategories);
  return nextCategories;
};

export const reorderTodoCategoriesAndPersist = (params: {
  categories: TodoCategory[];
  fromIndex: number;
  toIndex: number;
  persist: PersistTodoCategories;
}): TodoCategory[] | null => {
  const { categories, fromIndex, toIndex, persist } = params;
  const nextCategories = reorderTodoCategories(categories, fromIndex, toIndex);

  if (nextCategories === categories) {
    return null;
  }

  persist(nextCategories);
  return nextCategories;
};

export const deleteTodoCategoryAndPersist = (params: {
  categories: TodoCategory[];
  category: TodoCategory;
  message: string;
  persist: PersistTodoCategories;
  confirmDelete?: ConfirmDelete;
}): TodoCategory[] | null => {
  const {
    categories,
    category,
    message,
    persist,
    confirmDelete = window.confirm,
  } = params;

  if (!confirmDelete(message)) {
    return null;
  }

  const nextCategories = removeTodoCategory(categories, category.id);
  persist(nextCategories);
  return nextCategories;
};
