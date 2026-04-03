import { getMaxAllowedIndent } from "../todoListItemMaxIndent";
import type { TodoListItem } from "../types";

const item = (id: string, indent: number): TodoListItem => ({
  id,
  title: id,
  isCompleted: false,
  createdAt: "",
  indent,
});

describe("getMaxAllowedIndent", () => {
  it("先頭アイテム（index=0）は常に 0 を返す", () => {
    expect(getMaxAllowedIndent([item("A", 0)], 0)).toBe(0);
  });

  it("直前アイテムが indent=0 なら最大 1 を返す", () => {
    expect(getMaxAllowedIndent([item("A", 0), item("B", 0)], 1)).toBe(1);
  });

  it("直前アイテムが indent=1 なら最大 2 を返す", () => {
    expect(getMaxAllowedIndent([item("A", 1), item("B", 0)], 1)).toBe(2);
  });

  it("直前アイテムが indent=2 なら最大 3 を返す", () => {
    expect(getMaxAllowedIndent([item("A", 2), item("B", 0)], 1)).toBe(3);
  });

  it("直前アイテムが indent=3（最大）でも上限は 3 を超えない", () => {
    expect(getMaxAllowedIndent([item("A", 3), item("B", 0)], 1)).toBe(3);
  });

  it("indent が未設定の直前アイテムは 0 として扱い最大 1 を返す", () => {
    const items: TodoListItem[] = [
      { id: "A", title: "A", isCompleted: false, createdAt: "" },
      item("B", 0),
    ];
    expect(getMaxAllowedIndent(items, 1)).toBe(1);
  });
});
