import { getVisibleTodoItems } from "../todoListItemVisibilityFilter";
import type { TodoListItem } from "../types";

const item = (
  id: string,
  indent: number,
  isCompleted = false,
): TodoListItem => ({
  id,
  title: id,
  isCompleted,
  createdAt: "",
  indent,
});

describe("getVisibleTodoItems（折りたたみ統合）", () => {
  const items: TodoListItem[] = [
    item("A", 0, false),
    item("B", 1, true),
    item("C", 1, false),
    item("D", 0, false),
  ];

  it("折りたたみと完了非表示を同時に適用できる", () => {
    const result = getVisibleTodoItems(items, true, new Set(["A"]));
    expect(result.map((i) => i.id)).toEqual(["A", "D"]);
  });

  it("折りたたみのみ適用", () => {
    const result = getVisibleTodoItems(items, false, new Set(["A"]));
    expect(result.map((i) => i.id)).toEqual(["A", "D"]);
  });

  it("完了非表示のみ適用", () => {
    const result = getVisibleTodoItems(items, true, new Set());
    expect(result.map((i) => i.id)).toEqual(["A", "C", "D"]);
  });

  it("collapsedItemIds を省略できる（後方互換）", () => {
    const result = getVisibleTodoItems(items, false);
    expect(result).toEqual(items);
  });
});
