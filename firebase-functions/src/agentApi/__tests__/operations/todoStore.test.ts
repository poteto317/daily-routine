/** @jest-environment node */
import {
  findList,
  readLists,
  replaceList,
  toListChanges,
} from "../../operations/todo/todoStore";
import type { TodoList } from "../../operations/todo/todoTypes";

const list = (id: string): TodoList => ({
  id,
  title: id,
  items: [],
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
});

describe("todoStore", () => {
  it("readLists は未設定・配列以外なら空配列、配列ならそのまま返す", () => {
    expect(readLists({})).toEqual([]);
    expect(readLists({ todoLists: null })).toEqual([]);
    expect(readLists({ todoLists: "invalid" })).toEqual([]);
    expect(readLists({ todoLists: [list("a")] })).toEqual([list("a")]);
  });

  it("findList は指定 ID のリストと配列内インデックスを返す", () => {
    const lists = [list("a"), list("b"), list("c")];
    expect(findList(lists, "b")).toEqual({ list: lists[1], index: 1 });
    expect(findList(lists, "c")).toEqual({ list: lists[2], index: 2 });
  });

  it("findList は存在しない ID で 404 not_found を投げる", () => {
    const lists = [list("a"), list("b")];
    expect(() => findList(lists, "unknown")).toThrow(
      expect.objectContaining({
        status: 404,
        message: "リストが見つかりません",
      }),
    );
  });

  it("replaceList は指定インデックスのリストを置換し、他の要素は不変", () => {
    const lists = [list("a"), list("b")];
    const updated = { ...lists[0], title: "更新済み" };
    const result = replaceList(lists, 0, updated);
    expect(result).toEqual([updated, lists[1]]);
    expect(result[1]).toBe(lists[1]);
  });

  it("toListChanges は todoLists フィールドの更新差分オブジェクトを返す", () => {
    const lists = [list("a")];
    expect(toListChanges(lists)).toEqual({ todoLists: lists });
  });
});
