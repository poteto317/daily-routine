import {
  cutItemsFromList,
  normalizeItemIndents,
  pasteItemsToList,
} from "../todoListCutPasteHelpers";
import type { TodoList, TodoListItem } from "../types";

const createItem = (overrides: Partial<TodoListItem> = {}): TodoListItem => ({
  id: "item-1",
  title: "Task",
  isCompleted: false,
  createdAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "List 1",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("cutItemsFromList", () => {
  it("指定されたアイテムをリストから切り取る", () => {
    const items = [
      createItem({ id: "a", title: "A" }),
      createItem({ id: "b", title: "B" }),
      createItem({ id: "c", title: "C" }),
    ];
    const lists = [createList({ items })];
    const { updatedLists, cutItems } = cutItemsFromList(
      lists,
      "list-1",
      new Set(["a", "c"]),
    );

    expect(cutItems).toHaveLength(2);
    expect(cutItems.map((i) => i.id)).toEqual(["a", "c"]);
    expect(updatedLists[0].items).toHaveLength(1);
    expect(updatedLists[0].items[0].id).toBe("b");
  });

  it("存在しないアイテムIDは無視される", () => {
    const items = [createItem({ id: "a" })];
    const lists = [createList({ items })];
    const { updatedLists, cutItems } = cutItemsFromList(
      lists,
      "list-1",
      new Set(["nonexistent"]),
    );

    expect(cutItems).toHaveLength(0);
    expect(updatedLists[0].items).toHaveLength(1);
  });

  it("対象外リストは変更されない", () => {
    const list1 = createList({
      id: "list-1",
      items: [createItem({ id: "a" })],
    });
    const list2 = createList({
      id: "list-2",
      items: [createItem({ id: "b" })],
    });
    const { updatedLists } = cutItemsFromList(
      [list1, list2],
      "list-1",
      new Set(["a"]),
    );

    expect(updatedLists[1]).toBe(list2);
  });

  it("listId が存在しないとき updatedLists は変更なし・cutItems は空", () => {
    const lists = [createList({ items: [createItem({ id: "a" })] })];

    const { updatedLists, cutItems } = cutItemsFromList(
      lists,
      "nonexistent-list",
      new Set(["a"]),
    );

    expect(cutItems).toHaveLength(0);
    expect(updatedLists[0]).toBe(lists[0]);
  });

  it("全アイテムを切り取るとリストのアイテムが空になる", () => {
    const items = [
      createItem({ id: "a" }),
      createItem({ id: "b" }),
      createItem({ id: "c" }),
    ];
    const lists = [createList({ items })];

    const { updatedLists, cutItems } = cutItemsFromList(
      lists,
      "list-1",
      new Set(["a", "b", "c"]),
    );

    expect(cutItems).toHaveLength(3);
    expect(updatedLists[0].items).toHaveLength(0);
  });

  it("切り取り後に updatedAt が更新される", () => {
    const lists = [
      createList({
        items: [createItem({ id: "a" })],
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
    ];

    const { updatedLists } = cutItemsFromList(lists, "list-1", new Set(["a"]));

    expect(updatedLists[0].updatedAt).not.toBe("2024-01-01T00:00:00.000Z");
  });
});

describe("pasteItemsToList", () => {
  it("アイテムをリストの末尾に追加する", () => {
    const existing = [createItem({ id: "existing" })];
    const lists = [createList({ items: existing })];
    const toPaste = [createItem({ id: "new-1" }), createItem({ id: "new-2" })];

    const result = pasteItemsToList(lists, "list-1", toPaste);

    expect(result[0].items).toHaveLength(3);
    expect(result[0].items[1].id).toBe("new-1");
    expect(result[0].items[2].id).toBe("new-2");
  });

  it("インデントを正規化する（最小インデントを0に合わせる）", () => {
    const lists = [createList()];
    const toPaste = [
      createItem({ id: "a", indent: 2 }),
      createItem({ id: "b", indent: 3 }),
    ];

    const result = pasteItemsToList(lists, "list-1", toPaste);

    expect(result[0].items[0].indent).toBe(0);
    expect(result[0].items[1].indent).toBe(1);
  });

  it("空配列の場合はリストを変更しない", () => {
    const lists = [createList()];
    const result = pasteItemsToList(lists, "list-1", []);

    expect(result).toBe(lists);
  });

  it("インデント0のアイテムはそのまま追加される", () => {
    const lists = [createList()];
    const toPaste = [
      createItem({ id: "a", indent: 0 }),
      createItem({ id: "b", indent: 1 }),
    ];

    const result = pasteItemsToList(lists, "list-1", toPaste);

    expect(result[0].items[0].indent).toBe(0);
    expect(result[0].items[1].indent).toBe(1);
  });

  it("listId が存在しないとき lists が変更されない", () => {
    const lists = [createList({ items: [createItem({ id: "a" })] })];
    const toPaste = [createItem({ id: "new" })];

    const result = pasteItemsToList(lists, "nonexistent-list", toPaste);

    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0].id).toBe("a");
  });

  it("貼り付け後に updatedAt が更新される", () => {
    const lists = [createList({ updatedAt: "2024-01-01T00:00:00.000Z" })];
    const toPaste = [createItem({ id: "new" })];

    const result = pasteItemsToList(lists, "list-1", toPaste);

    expect(result[0].updatedAt).not.toBe("2024-01-01T00:00:00.000Z");
  });
});

describe("normalizeItemIndents", () => {
  it("最小インデントを 0 に揃え、相対差を維持する", () => {
    const items = [
      createItem({ id: "a", indent: 2 }),
      createItem({ id: "b", indent: 3 }),
      createItem({ id: "c", indent: 4 }),
    ];

    const result = normalizeItemIndents(items);

    expect(result[0].indent).toBe(0);
    expect(result[1].indent).toBe(1);
    expect(result[2].indent).toBe(2);
  });

  it("最小インデントが 0 の場合は参照同一の配列を返す", () => {
    const items = [
      createItem({ id: "a", indent: 0 }),
      createItem({ id: "b", indent: 1 }),
    ];

    const result = normalizeItemIndents(items);

    expect(result).toBe(items);
  });

  it("空配列はそのまま返す", () => {
    const result = normalizeItemIndents([]);

    expect(result).toEqual([]);
  });

  it("indent が undefined のアイテムは 0 として扱う", () => {
    const items = [
      createItem({ id: "a", indent: undefined }),
      createItem({ id: "b", indent: undefined }),
    ];

    const result = normalizeItemIndents(items);

    expect(result).toBe(items);
  });

  it("単一アイテムで indent が 3 の場合は 0 に正規化される", () => {
    const items = [createItem({ id: "a", indent: 3 })];

    const result = normalizeItemIndents(items);

    expect(result[0].indent).toBe(0);
  });
});
