import {
  addTodoItemToLists,
  confirmAndDeleteTodoItem,
  confirmAndDeleteTodoList,
  cutTodoItemsFromLists,
  indentTodoItemInLists,
  outdentTodoItemInLists,
  pasteTodoItemsToLists,
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

  it("指定アイテムをリストから切り取って返す", () => {
    const items = [
      createItem({ id: "a", title: "A" }),
      createItem({ id: "b", title: "B" }),
    ];
    const lists = [createList({ items })];

    const { updatedLists, cutItems } = cutTodoItemsFromLists({
      lists,
      listId: "list-1",
      itemIds: new Set(["a"]),
    });

    expect(cutItems).toHaveLength(1);
    expect(cutItems[0].id).toBe("a");
    expect(updatedLists[0].items).toHaveLength(1);
    expect(updatedLists[0].items[0].id).toBe("b");
  });

  it("アイテムをリストの末尾に貼り付ける", () => {
    const existing = createItem({ id: "existing", title: "Existing" });
    const lists = [createList({ items: [existing] })];
    const toPaste = [createItem({ id: "pasted", title: "Pasted" })];

    const result = pasteTodoItemsToLists({
      lists,
      listId: "list-1",
      items: toPaste,
    });

    expect(result[0].items).toHaveLength(2);
    expect(result[0].items[1].id).toBe("pasted");
  });
});
