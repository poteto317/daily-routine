import { isTodoListVisible } from "../todoListVisibilityPredicate";
import type { TodoList } from "../types";

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("isTodoListVisible", () => {
  it("isHidden が未設定のリストは visible を返す", () => {
    expect(isTodoListVisible(createList())).toBe(true);
  });

  it("isHidden が false のリストは visible を返す", () => {
    expect(isTodoListVisible(createList({ isHidden: false }))).toBe(true);
  });

  it("isHidden が true のリストは visible を返さない", () => {
    expect(isTodoListVisible(createList({ isHidden: true }))).toBe(false);
  });
});
