import {
  addTodoItemToLists,
  confirmAndDeleteTodoItem,
  confirmAndDeleteTodoList,
  indentTodoItemInLists,
  outdentTodoItemInLists,
  persistTodoLists,
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

  it("一覧の永続化処理を委譲する", () => {
    const setLists = jest.fn();
    const saveLists = jest.fn();
    const nextLists = [createList()];

    persistTodoLists({ nextLists, setLists, saveLists });

    expect(setLists).toHaveBeenCalledWith(nextLists);
    expect(saveLists).toHaveBeenCalledWith(nextLists);
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

  it("リスト削除確認に応じて削除する", () => {
    const lists = [createList(), createList({ id: "list-2", title: "Work" })];

    expect(
      confirmAndDeleteTodoList({
        lists,
        list: lists[0],
        message: "confirm",
        confirmDelete: () => false,
      }),
    ).toBeNull();

    expect(
      confirmAndDeleteTodoList({
        lists,
        list: lists[0],
        message: "confirm",
        confirmDelete: () => true,
      }),
    ).toEqual([expect.objectContaining({ id: "list-2" })]);
  });

  it("アイテム削除確認に応じて削除する", () => {
    const lists = [
      createList({
        items: [createItem(), createItem({ id: "item-2", title: "Next" })],
      }),
    ];

    expect(
      confirmAndDeleteTodoItem({
        lists,
        listId: "list-1",
        itemId: "item-1",
        message: "confirm",
        confirmDelete: () => false,
      }),
    ).toBeNull();

    expect(
      confirmAndDeleteTodoItem({
        lists,
        listId: "list-1",
        itemId: "item-1",
        message: "confirm",
        confirmDelete: () => true,
      }),
    ).toEqual([
      expect.objectContaining({
        items: [expect.objectContaining({ id: "item-2" })],
      }),
    ]);
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
