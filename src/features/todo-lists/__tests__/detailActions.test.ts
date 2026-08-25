import {
  addTodoItemToLists,
  indentTodoItemInLists,
  outdentTodoItemInLists,
  toggleTodoItemInLists,
} from "../detailActions";
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
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("todo detailActions", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00.000Z"));
    jest.spyOn(Date, "now").mockReturnValue(12345);
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("Todo追加と完了切替を行う", () => {
    const lists = [createList()];
    const added = addTodoItemToLists({
      lists,
      listId: "list-1",
      title: "New Task",
    });

    expect(added[0].items).toEqual([
      expect.objectContaining({ title: "New Task", isCompleted: false }),
    ]);

    const toggled = toggleTodoItemInLists({
      lists: [createList({ items: [createItem()] })],
      listId: "list-1",
      itemId: "item-1",
    });

    expect(toggled[0].items[0].isCompleted).toBe(true);
  });

  it("insertAfterIndex を指定すると指定位置に挿入される", () => {
    const itemA = createItem({ id: "a", title: "A" });
    const itemB = createItem({ id: "b", title: "B" });
    const lists = [createList({ items: [itemA, itemB] })];

    const result = addTodoItemToLists({
      lists,
      listId: "list-1",
      title: "Middle",
      insertAfterIndex: 0,
    });

    expect(result[0].items[1]).toMatchObject({ title: "Middle" });
    expect(result[0].items.length).toBe(3);
  });

  it("リストに defaultItemBgColor が設定されている場合、新規アイテムに引き継ぐ", () => {
    const lists = [createList({ defaultItemBgColor: "bg-blue-50" })];
    const result = addTodoItemToLists({
      lists,
      listId: "list-1",
      title: "Colored Task",
    });

    expect(result[0].items[0].bgColor).toBe("bg-blue-50");
  });

  it("リストに defaultItemBgColor が設定されていない場合、bgColor なしでアイテムを追加する", () => {
    const lists = [createList()];
    const result = addTodoItemToLists({
      lists,
      listId: "list-1",
      title: "Plain Task",
    });

    expect(result[0].items[0]).not.toHaveProperty("bgColor");
  });

  it("insertAfterIndex と defaultItemBgColor が両方ある場合でも bgColor を引き継ぐ", () => {
    const itemA = createItem({ id: "a", title: "A" });
    const lists = [
      createList({ items: [itemA], defaultItemBgColor: "bg-green-50" }),
    ];

    const result = addTodoItemToLists({
      lists,
      listId: "list-1",
      title: "Inserted",
      insertAfterIndex: 0,
    });

    expect(result[0].items[1].bgColor).toBe("bg-green-50");
  });

  it("インデント操作を委譲する", () => {
    const lists = [createList({ items: [createItem({ indent: 1 })] })];

    expect(
      indentTodoItemInLists({ lists, listId: "list-1", itemId: "item-1" })[0]
        .items[0].indent,
    ).toBe(2);

    expect(
      outdentTodoItemInLists({ lists, listId: "list-1", itemId: "item-1" })[0]
        .items[0].indent,
    ).toBe(0);
  });
});
