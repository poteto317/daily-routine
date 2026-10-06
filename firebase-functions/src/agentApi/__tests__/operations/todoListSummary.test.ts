/** @jest-environment node */
import { summarizeList } from "../../operations/todo/todoListSummary";
import type { TodoList } from "../../operations/todo/todoTypes";

const list = (items: Array<{ isCompleted: boolean }>): TodoList => ({
  id: "l1",
  title: "リスト",
  items: items.map((item, i) => ({
    id: `item-${i}`,
    title: `アイテム${i}`,
    isCompleted: item.isCompleted,
    createdAt: "2026-10-01T00:00:00.000Z",
  })),
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
});

describe("summarizeList", () => {
  it("items 配列を除外し、itemCount と completedCount を付与する", () => {
    const summary = summarizeList(
      list([
        { isCompleted: true },
        { isCompleted: false },
        { isCompleted: true },
      ]),
    );
    expect(summary).toEqual({
      id: "l1",
      title: "リスト",
      itemCount: 3,
      completedCount: 2,
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-01T00:00:00.000Z",
    });
    expect("items" in summary).toBe(false);
  });

  it("空リストの場合は itemCount 0, completedCount 0 を返す", () => {
    const summary = summarizeList(list([]));
    expect(summary.itemCount).toBe(0);
    expect(summary.completedCount).toBe(0);
  });

  it("items が不正な値の場合でも 0 件として安全に集計する", () => {
    const broken = {
      id: "l1",
      title: "壊れたリスト",
      items: null,
      createdAt: "t",
      updatedAt: "t",
    } as unknown as TodoList;
    const summary = summarizeList(broken);
    expect(summary.itemCount).toBe(0);
    expect(summary.completedCount).toBe(0);
  });
});
