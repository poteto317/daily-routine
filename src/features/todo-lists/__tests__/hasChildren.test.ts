import { hasChildren } from "../todoListItemHasChildren";
import type { TodoListItem } from "../types";

const item = (id: string, indent: number): TodoListItem => ({
  id,
  title: id,
  isCompleted: false,
  createdAt: "",
  indent,
});

describe("hasChildren", () => {
  const items: TodoListItem[] = [
    item("A", 0),
    item("B", 1),
    item("C", 2),
    item("D", 1),
    item("E", 0),
  ];

  it("次のアイテムのインデントが深ければ true を返す", () => {
    expect(hasChildren(items, 0)).toBe(true); // A → B (0 < 1)
    expect(hasChildren(items, 1)).toBe(true); // B → C (1 < 2)
  });

  it("次のアイテムのインデントが同じか浅ければ false を返す", () => {
    expect(hasChildren(items, 2)).toBe(false); // C → D (2 > 1)
    expect(hasChildren(items, 3)).toBe(false); // D → E (1 > 0)
  });

  it("末尾のアイテムは false を返す", () => {
    expect(hasChildren(items, 4)).toBe(false);
  });

  it("範囲外のインデックスは false を返す", () => {
    expect(hasChildren(items, -1)).toBe(false);
    expect(hasChildren(items, 10)).toBe(false);
  });

  it("indent が未設定のアイテムは 0 として扱う", () => {
    const noIndent: TodoListItem[] = [
      { id: "X", title: "X", isCompleted: false, createdAt: "" },
      { id: "Y", title: "Y", isCompleted: false, createdAt: "", indent: 1 },
    ];
    expect(hasChildren(noIndent, 0)).toBe(true);
  });

  it("1要素のみのリストは false を返す", () => {
    expect(hasChildren([item("solo", 0)], 0)).toBe(false);
  });
});
