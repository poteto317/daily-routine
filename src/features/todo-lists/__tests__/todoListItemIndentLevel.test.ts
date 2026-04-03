import { getItemIndentLevel } from "../todoListItemIndentLevel";
import type { TodoListItem } from "../types";

const item = (id: string, indent?: number): TodoListItem => ({
  id,
  title: id,
  isCompleted: false,
  createdAt: "",
  indent,
});

describe("getItemIndentLevel", () => {
  it("indent が設定されている場合はその値を返す", () => {
    expect(getItemIndentLevel(item("A", 0))).toBe(0);
    expect(getItemIndentLevel(item("B", 1))).toBe(1);
    expect(getItemIndentLevel(item("C", 3))).toBe(3);
  });

  it("indent が undefined の場合は 0 を返す", () => {
    expect(getItemIndentLevel(item("X"))).toBe(0);
  });

  it("indent が 0 の場合は 0 を返す（undefined との区別）", () => {
    expect(getItemIndentLevel(item("Y", 0))).toBe(0);
  });
});
