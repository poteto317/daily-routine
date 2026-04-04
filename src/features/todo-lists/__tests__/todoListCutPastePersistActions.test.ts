import {
  cutTodoItemsAndPersist,
  pasteTodoItemsAndPersist,
} from "../todoListCutPastePersistActions";
import type { TodoList, TodoListItem } from "../types";

jest.mock("../todoListCutPasteActions", () => ({
  cutTodoItemsFromLists: jest.fn(),
  pasteTodoItemsToLists: jest.fn(),
}));

import {
  cutTodoItemsFromLists,
  pasteTodoItemsToLists,
} from "../todoListCutPasteActions";

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("cutTodoItemsAndPersist", () => {
  it("cutItems が存在するとき persist を呼び cutItems を返す", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const cutItems = [createItem({ id: "a" })];
    const updatedLists = [createList({ items: [] })];
    (cutTodoItemsFromLists as jest.Mock).mockReturnValue({
      updatedLists,
      cutItems,
    });

    const result = cutTodoItemsAndPersist({
      lists,
      listId: "list-1",
      itemIds: new Set(["a"]),
      persist,
    });

    expect(persist).toHaveBeenCalledWith(updatedLists);
    expect(result).toBe(cutItems);
  });

  it("複数 cutItems を返す（persist の戻り値でなく cutItems）", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const cutItems = [createItem({ id: "a" }), createItem({ id: "b" })];
    (cutTodoItemsFromLists as jest.Mock).mockReturnValue({
      updatedLists: lists,
      cutItems,
    });

    const result = cutTodoItemsAndPersist({
      lists,
      listId: "list-1",
      itemIds: new Set(["a", "b"]),
      persist,
    });

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("a");
    expect(result[1].id).toBe("b");
  });

  it("cutItems が空なら persist を呼ばず空配列を返す", () => {
    const lists = [createList()];
    const persist = jest.fn();
    (cutTodoItemsFromLists as jest.Mock).mockReturnValue({
      updatedLists: lists,
      cutItems: [],
    });

    const result = cutTodoItemsAndPersist({
      lists,
      listId: "list-1",
      itemIds: new Set(["missing"]),
      persist,
    });

    expect(result).toEqual([]);
    expect(persist).not.toHaveBeenCalled();
  });

  it("cutTodoItemsFromLists に正しいパラメータを渡す", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const itemIds = new Set(["a"]);
    (cutTodoItemsFromLists as jest.Mock).mockReturnValue({
      updatedLists: lists,
      cutItems: [createItem({ id: "a" })],
    });

    cutTodoItemsAndPersist({ lists, listId: "list-1", itemIds, persist });

    expect(cutTodoItemsFromLists).toHaveBeenCalledWith({
      lists,
      listId: "list-1",
      itemIds,
    });
  });

  it("空の itemIds でも cutTodoItemsFromLists に委譲する", () => {
    const lists = [createList()];
    const persist = jest.fn();
    (cutTodoItemsFromLists as jest.Mock).mockReturnValue({
      updatedLists: lists,
      cutItems: [],
    });

    cutTodoItemsAndPersist({
      lists,
      listId: "list-1",
      itemIds: new Set(),
      persist,
    });

    expect(cutTodoItemsFromLists).toHaveBeenCalledTimes(1);
    expect(persist).not.toHaveBeenCalled();
  });
});

describe("pasteTodoItemsAndPersist", () => {
  it("アイテムが存在し listId が合致するとき persist を呼ぶ", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const items = [createItem({ id: "a" })];
    const nextLists = [createList({ items })];
    (pasteTodoItemsToLists as jest.Mock).mockReturnValue(nextLists);

    pasteTodoItemsAndPersist({ lists, listId: "list-1", items, persist });

    expect(persist).toHaveBeenCalledWith(nextLists);
  });

  it("pasteTodoItemsToLists に正しいパラメータを渡す", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const items = [createItem({ id: "a" }), createItem({ id: "b" })];
    const nextLists = [createList({ items })];
    (pasteTodoItemsToLists as jest.Mock).mockReturnValue(nextLists);

    pasteTodoItemsAndPersist({ lists, listId: "list-1", items, persist });

    expect(pasteTodoItemsToLists).toHaveBeenCalledWith({
      lists,
      listId: "list-1",
      items,
    });
    expect(persist).toHaveBeenCalledWith(nextLists);
  });

  it("items が空なら persist も pasteTodoItemsToLists も呼ばない", () => {
    const lists = [createList()];
    const persist = jest.fn();

    pasteTodoItemsAndPersist({ lists, listId: "list-1", items: [], persist });

    expect(pasteTodoItemsToLists).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });

  it("listId が存在しないリストなら persist も pasteTodoItemsToLists も呼ばない", () => {
    const lists = [createList({ id: "list-1" })];
    const persist = jest.fn();
    const items = [createItem({ id: "a" })];

    pasteTodoItemsAndPersist({
      lists,
      listId: "missing-list",
      items,
      persist,
    });

    expect(pasteTodoItemsToLists).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });

  it("lists が空配列のとき persist を呼ばない", () => {
    const persist = jest.fn();

    pasteTodoItemsAndPersist({
      lists: [],
      listId: "list-1",
      items: [createItem()],
      persist,
    });

    expect(pasteTodoItemsToLists).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });

  it("複数アイテムをペーストして persist を呼ぶ", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const items = [
      createItem({ id: "a" }),
      createItem({ id: "b" }),
      createItem({ id: "c" }),
    ];
    const nextLists = [createList({ items })];
    (pasteTodoItemsToLists as jest.Mock).mockReturnValue(nextLists);

    pasteTodoItemsAndPersist({ lists, listId: "list-1", items, persist });

    expect(pasteTodoItemsToLists).toHaveBeenCalledWith({
      lists,
      listId: "list-1",
      items,
    });
    expect(persist).toHaveBeenCalledWith(nextLists);
  });
});
