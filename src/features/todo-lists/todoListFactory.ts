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

export const createTodoListItem = (title: string): TodoListItem => ({
  id: generateId(),
  title,
  isCompleted: false,
  createdAt: new Date().toISOString(),
});
