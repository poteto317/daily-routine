import {
  addItemToList,
  deleteItemFromList,
  indentItemInList,
  outdentItemInList,
  reorderItemsInList,
  toggleItemInList,
  updateListAddItemPosition,
  updateListHideCompleted,
  updateListMoveCompletedToBottom,
} from "../helpers";
import { getItemIndentLevel } from "../todoListItemIndentLevel";
import type { TodoList, TodoListItem } from "../types";

jest.mock("../todoListItemIndentLevel", () => ({
  ...jest.requireActual("../todoListItemIndentLevel"),
  getItemIndentLevel: jest.fn(),
}));

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

const createItem = (overrides: Partial<TodoListItem> = {}): TodoListItem => ({
  id: "item-1",
  title: "Task",
  isCompleted: false,
  createdAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("todo list helpers", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00.000Z"));
    jest.spyOn(Date, "now").mockReturnValue(12345);
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);
    const real = jest.requireActual<
      typeof import("../todoListItemIndentLevel")
    >("../todoListItemIndentLevel");
    (getItemIndentLevel as jest.Mock).mockImplementation(
      real.getItemIndentLevel,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("指定リストにアイテムを追加する", () => {
    const item = createItem();
    const result = addItemToList([createList()], "list-1", item);

    expect(result[0].items).toEqual([item]);
    expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
  });

  it("insertAfterIndex を指定すると指定位置の直後に挿入される", () => {
    const itemA = createItem({ id: "a", title: "A" });
    const itemB = createItem({ id: "b", title: "B" });
    const newItem = createItem({ id: "new", title: "New" });
    const list = createList({ items: [itemA, itemB] });

    const result = addItemToList([list], "list-1", newItem, 0);

    expect(result[0].items.map((i) => i.id)).toEqual(["a", "new", "b"]);
  });

  it("insertAfterIndex が範囲外の場合は末尾に追加される", () => {
    const itemA = createItem({ id: "a" });
    const newItem = createItem({ id: "new", title: "New" });
    const list = createList({ items: [itemA] });

    const result = addItemToList([list], "list-1", newItem, 99);

    expect(result[0].items.map((i) => i.id)).toEqual(["a", "new"]);
  });

  it("insertAfterIndex が負の値の場合は末尾に追加される", () => {
    const itemA = createItem({ id: "a" });
    const newItem = createItem({ id: "new", title: "New" });
    const list = createList({ items: [itemA] });

    const result = addItemToList([list], "list-1", newItem, -1);

    expect(result[0].items.map((i) => i.id)).toEqual(["a", "new"]);
  });

  it("addItemPosition が 'first' のとき insertAfterIndex なしで先頭に追加される", () => {
    const itemA = createItem({ id: "a" });
    const newItem = createItem({ id: "new", title: "New" });
    const list = createList({ items: [itemA], addItemPosition: "first" });

    const result = addItemToList([list], "list-1", newItem);

    expect(result[0].items.map((i) => i.id)).toEqual(["new", "a"]);
  });

  it("addItemPosition が 'first' でも insertAfterIndex が有効なら指定位置に挿入される", () => {
    const itemA = createItem({ id: "a" });
    const itemB = createItem({ id: "b" });
    const newItem = createItem({ id: "new" });
    const list = createList({ items: [itemA, itemB], addItemPosition: "first" });

    const result = addItemToList([list], "list-1", newItem, 0);

    expect(result[0].items.map((i) => i.id)).toEqual(["a", "new", "b"]);
  });

  it("updateListAddItemPosition でリストの addItemPosition を更新する", () => {
    const list = createList();

    const result = updateListAddItemPosition([list], "list-1", "first");

    expect(result[0].addItemPosition).toBe("first");
    expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
  });

  it("updateListAddItemPosition は対象外のリストを変更しない", () => {
    const list1 = createList({ id: "list-1" });
    const list2 = createList({ id: "list-2", addItemPosition: "first" });

    const result = updateListAddItemPosition([list1, list2], "list-1", "last");

    expect(result[0].addItemPosition).toBe("last");
    expect(result[1].addItemPosition).toBe("first");
  });

  it("updateListMoveCompletedToBottom でリストの moveCompletedToBottom を更新する", () => {
    const list = createList();

    const result = updateListMoveCompletedToBottom([list], "list-1", true);

    expect(result[0].moveCompletedToBottom).toBe(true);
    expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
  });

  it("updateListMoveCompletedToBottom は対象外のリストを変更しない", () => {
    const list1 = createList({ id: "list-1" });
    const list2 = createList({ id: "list-2", moveCompletedToBottom: true });

    const result = updateListMoveCompletedToBottom(
      [list1, list2],
      "list-1",
      true,
    );

    expect(result[0].moveCompletedToBottom).toBe(true);
    expect(result[1].moveCompletedToBottom).toBe(true);
    expect(result[1]).toBe(list2);
  });

  it("updateListHideCompleted でリストの hideCompleted を更新する", () => {
    const list = createList();

    const result = updateListHideCompleted([list], "list-1", true);

    expect(result[0].hideCompleted).toBe(true);
    expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
  });

  it("updateListHideCompleted は対象外のリストを変更しない", () => {
    const list1 = createList({ id: "list-1" });
    const list2 = createList({ id: "list-2", hideCompleted: true });

    const result = updateListHideCompleted([list1, list2], "list-1", true);

    expect(result[0].hideCompleted).toBe(true);
    expect(result[1]).toBe(list2);
  });

  it("指定アイテムの完了状態を切り替える", () => {
    const result = toggleItemInList(
      [createList({ items: [createItem()] })],
      "list-1",
      "item-1",
    );

    expect(result[0].items[0].isCompleted).toBe(true);
  });

  it("指定アイテムを削除する", () => {
    const result = deleteItemFromList(
      [createList({ items: [createItem(), createItem({ id: "item-2" })] })],
      "list-1",
      "item-1",
    );

    expect(result[0].items).toEqual([
      expect.objectContaining({ id: "item-2" }),
    ]);
  });

  it("インデントを上げ下げする", () => {
    const items = [createItem({ indent: 1 })];

    expect(
      indentItemInList([createList({ items })], "list-1", "item-1")[0].items[0]
        .indent,
    ).toBe(2);
    expect(
      outdentItemInList([createList({ items })], "list-1", "item-1")[0].items[0]
        .indent,
    ).toBe(0);
  });

  it("インデントは 0-3 の範囲に収まる", () => {
    const items = [createItem({ indent: 3 })];

    expect(
      indentItemInList([createList({ items })], "list-1", "item-1")[0].items[0]
        .indent,
    ).toBe(3);
    expect(
      outdentItemInList(
        [createList({ items: [createItem({ indent: 0 })] })],
        "list-1",
        "item-1",
      )[0].items[0].indent,
    ).toBe(0);
  });

  it("親アイテムの並び替え時は子要素も一緒に移動する", () => {
    const items = [
      createItem({ id: "item-1", title: "Parent" }),
      createItem({ id: "item-2", title: "Child", indent: 1 }),
      createItem({ id: "item-3", title: "Sibling" }),
      createItem({ id: "item-4", title: "Later" }),
    ];

    const result = reorderItemsInList([createList({ items })], "list-1", 0, 3);

    expect(result[0].items.map((item) => item.id)).toEqual([
      "item-3",
      "item-4",
      "item-1",
      "item-2",
    ]);
  });

  it("子アイテムを並び替えるとその子孫も一緒に移動する", () => {
    const items = [
      createItem({ id: "item-1", title: "Root" }),
      createItem({ id: "item-2", title: "Child", indent: 1 }),
      createItem({ id: "item-3", title: "Grandchild", indent: 2 }),
      createItem({ id: "item-4", title: "Sibling child", indent: 1 }),
      createItem({ id: "item-5", title: "Another root" }),
    ];

    const result = reorderItemsInList([createList({ items })], "list-1", 1, 4);

    expect(result[0].items.map((item) => item.id)).toEqual([
      "item-1",
      "item-4",
      "item-5",
      "item-2",
      "item-3",
    ]);
  });

  it("indentItemInList は getItemIndentLevel に委譲してインデントを読み取る", () => {
    (getItemIndentLevel as jest.Mock).mockReturnValue(1);

    const items = [createItem({ indent: 1 })];
    indentItemInList([createList({ items })], "list-1", "item-1");

    expect(getItemIndentLevel).toHaveBeenCalledWith(
      expect.objectContaining({ id: "item-1" }),
    );
  });

  it("outdentItemInList は getItemIndentLevel に委譲してインデントを読み取る", () => {
    (getItemIndentLevel as jest.Mock).mockReturnValue(2);

    const items = [createItem({ indent: 2 })];
    outdentItemInList([createList({ items })], "list-1", "item-1");

    expect(getItemIndentLevel).toHaveBeenCalledWith(
      expect.objectContaining({ id: "item-1" }),
    );
  });

  it("reorderItemsInList は getItemIndentLevel に委譲してブロック境界を判定する", () => {
    const items = [
      createItem({ id: "item-1", indent: 0 }),
      createItem({ id: "item-2", indent: 1 }),
      createItem({ id: "item-3", indent: 0 }),
    ];
    const list = createList({ items });

    reorderItemsInList([list], "list-1", 0, 2);

    expect(getItemIndentLevel).toHaveBeenCalled();
  });
});
