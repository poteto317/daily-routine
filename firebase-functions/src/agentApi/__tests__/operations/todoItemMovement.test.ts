/** @jest-environment node */
import {
  blockEndIndex,
  insertItem,
  moveItem,
} from "../../operations/todo/todoItemMovement";
import type { TodoItem } from "../../operations/todo/todoTypes";

const item = (id: string, indent?: number): TodoItem => ({
  id,
  title: id,
  isCompleted: false,
  createdAt: "2026-10-01T00:00:00.000Z",
  ...(indent !== undefined && { indent }),
});

const ids = (items: TodoItem[]): string[] => items.map((i) => i.id);

describe("insertItem", () => {
  const items = [item("a"), item("b")];

  it("insertAfterIndex の直後に挿入する", () => {
    expect(ids(insertItem(items, item("x"), "last", 0))).toEqual(["a", "x", "b"]);
  });

  it("指定が無ければ position が first のときは先頭、last のときは末尾に追加する", () => {
    expect(ids(insertItem(items, item("x"), "first", undefined))).toEqual([
      "x",
      "a",
      "b",
    ]);
    expect(ids(insertItem(items, item("x"), "last", undefined))).toEqual([
      "a",
      "b",
      "x",
    ]);
    expect(ids(insertItem(items, item("x"), undefined, undefined))).toEqual([
      "a",
      "b",
      "x",
    ]);
  });

  it("範囲外の insertAfterIndex は 400 invalid_field", () => {
    expect(() => insertItem(items, item("x"), "last", 2)).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
    expect(() => insertItem([], item("x"), "last", 0)).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });
});

describe("blockEndIndex", () => {
  it("インデントがないアイテムが単独の場合は次のインデックスを返す", () => {
    const items = [item("a", 0), item("b", 0)];
    expect(blockEndIndex(items, 0)).toBe(1);
    expect(blockEndIndex(items, 1)).toBe(2);
  });

  it("子アイテム（より深いインデント）を含むブロックの終端を返す", () => {
    const items = [
      item("parent", 0),
      item("child1", 1),
      item("grandchild", 2),
      item("child2", 1),
      item("nextParent", 0),
    ];
    expect(blockEndIndex(items, 0)).toBe(4);
    expect(blockEndIndex(items, 1)).toBe(3);
    expect(blockEndIndex(items, 4)).toBe(5);
  });
});

describe("moveItem", () => {
  it("後方へ移動する", () => {
    const items = [item("a"), item("b"), item("c")];
    expect(ids(moveItem(items, 0, 2))).toEqual(["b", "c", "a"]);
  });

  it("前方へ移動する", () => {
    const items = [item("a"), item("b"), item("c")];
    expect(ids(moveItem(items, 2, 0))).toEqual(["c", "a", "b"]);
  });

  it("親は子と一緒にブロックとして移動する", () => {
    const items = [item("a", 0), item("a1", 1), item("b", 0), item("c", 0)];
    expect(ids(moveItem(items, 0, 2))).toEqual(["b", "a", "a1", "c"]);
    expect(ids(moveItem(items, 2, 0))).toEqual(["b", "a", "a1", "c"]);
  });

  it("後方移動は移動先アンカーの子孫の後ろに挿入する", () => {
    const items = [item("a"), item("b", 0), item("b1", 1), item("c")];
    expect(ids(moveItem(items, 0, 1))).toEqual(["b", "b1", "a", "c"]);
  });

  it("同一インデックスや自ブロック内への移動は何もしない", () => {
    const items = [item("a", 0), item("a1", 1), item("b", 0)];
    expect(moveItem(items, 0, 0)).toBe(items);
    expect(moveItem(items, 0, 1)).toBe(items);
  });

  it("範囲外の toIndex は 400 invalid_field", () => {
    expect(() => moveItem([item("a")], 0, 1)).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });
});
