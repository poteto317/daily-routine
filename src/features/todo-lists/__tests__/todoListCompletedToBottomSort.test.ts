import { sortCompletedToBottom } from "../todoListCompletedToBottomSort";
import type { TodoListItem } from "../types";

const item = (
  id: string,
  isCompleted: boolean,
  overrides: Partial<TodoListItem> = {},
): TodoListItem => ({
  id,
  title: id,
  isCompleted,
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("sortCompletedToBottom", () => {
  it("アイテムがない場合は空配列を返す", () => {
    expect(sortCompletedToBottom([])).toEqual([]);
  });

  it("未完了のみの場合は順序を変えずに返す", () => {
    const items = [item("a", false), item("b", false), item("c", false)];
    expect(sortCompletedToBottom(items).map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("完了済みのみの場合は順序を変えずに返す", () => {
    const items = [item("a", true), item("b", true)];
    expect(sortCompletedToBottom(items).map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("混在する場合は未完了が先、完了済みが後に並ぶ", () => {
    const items = [
      item("a", false),
      item("b", true),
      item("c", false),
      item("d", true),
    ];
    expect(sortCompletedToBottom(items).map((i) => i.id)).toEqual([
      "a",
      "c",
      "b",
      "d",
    ]);
  });

  it("未完了グループ内の相対順序が保持される（安定ソート）", () => {
    const items = [
      item("a", false),
      item("b", true),
      item("c", false),
      item("d", false),
    ];
    const result = sortCompletedToBottom(items);
    const incompleteIds = result
      .filter((i) => !i.isCompleted)
      .map((i) => i.id);
    expect(incompleteIds).toEqual(["a", "c", "d"]);
  });

  it("完了済みグループ内の相対順序が保持される（安定ソート）", () => {
    const items = [
      item("a", true),
      item("b", false),
      item("c", true),
      item("d", true),
    ];
    const result = sortCompletedToBottom(items);
    const completedIds = result.filter((i) => i.isCompleted).map((i) => i.id);
    expect(completedIds).toEqual(["a", "c", "d"]);
  });

  it("インデントを持つアイテムも isCompleted のみで判定する", () => {
    const items = [
      item("parent", false, { indent: 0 }),
      item("child-done", true, { indent: 1 }),
      item("child-open", false, { indent: 1 }),
      item("sibling-done", true, { indent: 0 }),
    ];
    expect(sortCompletedToBottom(items).map((i) => i.id)).toEqual([
      "parent",
      "child-open",
      "child-done",
      "sibling-done",
    ]);
  });

  it("元の配列を変更しない（イミュータブル）", () => {
    const items = [item("a", true), item("b", false)];
    const copy = [...items];
    sortCompletedToBottom(items);
    expect(items.map((i) => i.id)).toEqual(copy.map((i) => i.id));
  });
});
