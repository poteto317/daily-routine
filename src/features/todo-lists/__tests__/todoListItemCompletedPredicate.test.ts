import { isItemCompleted } from "../todoListItemCompletedPredicate";
import type { TodoListItem } from "../types";

const createItem = (overrides: Partial<TodoListItem> = {}): TodoListItem => ({
  id: "item-1",
  title: "Task",
  isCompleted: false,
  createdAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("isItemCompleted", () => {
  it("isCompleted が true のアイテムは true を返す", () => {
    expect(isItemCompleted(createItem({ isCompleted: true }))).toBe(true);
  });

  it("isCompleted が false のアイテムは false を返す", () => {
    expect(isItemCompleted(createItem({ isCompleted: false }))).toBe(false);
  });
});
