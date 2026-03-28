import {
  addItemToList,
  createTodoList,
  createTodoListItem,
  deleteItemFromList,
  getListProgress,
  getMaxAllowedIndent,
  indentItemInList,
  outdentItemInList,
  reorderItemsInList,
  toggleItemInList,
} from "../helpers";
import type { TodoList, TodoListItem } from "../types";

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
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("Todoリストを生成する", () => {
    expect(createTodoList("Work")).toEqual({
      id: expect.any(String),
      title: "Work",
      items: [],
      createdAt: "2026-03-07T12:00:00.000Z",
      updatedAt: "2026-03-07T12:00:00.000Z",
    });
  });

  it("Todoアイテムを生成する", () => {
    expect(createTodoListItem("Write tests")).toEqual({
      id: expect.any(String),
      title: "Write tests",
      isCompleted: false,
      createdAt: "2026-03-07T12:00:00.000Z",
    });
  });

  it("指定リストにアイテムを追加する", () => {
    const item = createItem();
    const result = addItemToList([createList()], "list-1", item);

    expect(result[0].items).toEqual([item]);
    expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
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

  it("前アイテムをもとに最大インデントを返す", () => {
    expect(getMaxAllowedIndent([createItem()], 0)).toBe(0);
    expect(
      getMaxAllowedIndent(
        [createItem({ indent: 1 }), createItem({ id: "item-2" })],
        1,
      ),
    ).toBe(2);
    expect(
      getMaxAllowedIndent(
        [createItem({ indent: 3 }), createItem({ id: "item-2" })],
        1,
      ),
    ).toBe(3);
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

  it("進捗情報を計算する", () => {
    expect(
      getListProgress(
        createList({
          items: [
            createItem({ isCompleted: true }),
            createItem({ id: "item-2" }),
          ],
        }),
      ),
    ).toEqual({
      completed: 1,
      total: 2,
      percentage: 50,
    });
  });
});
