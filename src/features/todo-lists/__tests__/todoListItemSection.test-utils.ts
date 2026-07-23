import type { TodoCategory, TodoListItem } from "../types";

export const item = (
  id: string,
  overrides: Partial<TodoListItem> = {},
): TodoListItem => ({
  id,
  title: id,
  isCompleted: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

export const sectionTestCategories: TodoCategory[] = [
  { id: "cat-work", name: "仕事", createdAt: "2026-01-01T00:00:00.000Z" },
  {
    id: "cat-private",
    name: "プライベート",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];
