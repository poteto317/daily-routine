import type { TodoItemBgColorValue } from "./todoItemBgColor";
import type { TodoList, TodoListItem } from "./types";

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const createTodoList = (title: string): TodoList => ({
  id: generateId(),
  title,
  items: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createTodoListItem = (
  title: string,
  bgColor?: TodoItemBgColorValue,
): TodoListItem => ({
  id: generateId(),
  title,
  isCompleted: false,
  createdAt: new Date().toISOString(),
  ...(bgColor !== undefined && { bgColor }),
});
