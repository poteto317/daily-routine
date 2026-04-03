import { createTodoList } from "./helpers";
import { normalizeTodoTitle } from "./todoListTitleNormalization";
import type { TodoList } from "./types";

export const addTodoList = (lists: TodoList[], title: string): TodoList[] => {
  const normalized = normalizeTodoTitle(title);
  if (!normalized) return lists;

  return [...lists, createTodoList(normalized)];
};

export const toggleTodoListVisibility = (
  lists: TodoList[],
  listId: string,
): TodoList[] => {
  return lists.map((list) =>
    list.id === listId ? { ...list, isHidden: !list.isHidden } : list,
  );
};

export const removeTodoList = (
  lists: TodoList[],
  listId: string,
): TodoList[] => {
  return lists.filter((list) => list.id !== listId);
};
