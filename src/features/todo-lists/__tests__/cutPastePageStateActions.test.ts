import {
  cutTodoItemsAndPersist,
  pasteTodoItemsAndPersist,
} from "../todoListCutPastePersistActions";
import type { TodoList, TodoListItem } from "../types";

jest.mock("../todoListCutPasteActions", () => ({
  ...jest.requireActual("../detailActions"),
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
  it("切り取りして persist を呼び、切り取ったアイテムを返す", () => {
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

  it("切り取ったアイテムを返す（persist の戻り値でなく cutItems）", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const cutItems = [createItem({ id: "a" }), createItem({ id: "b" })];
    const updatedLists = [createList()];
    (cutTodoItemsFromLists as jest.Mock).mockReturnValue({
      updatedLists,
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

  it("cutItems が空なら persist を呼ばない", () => {
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
});

describe("pasteTodoItemsAndPersist", () => {
  it("ペーストして persist を呼ぶ", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const items = [createItem({ id: "a" })];
    const nextLists = [createList({ items })];
    (pasteTodoItemsToLists as jest.Mock).mockReturnValue(nextLists);

    pasteTodoItemsAndPersist({
      lists,
      listId: "list-1",
      items,
      persist,
    });

    expect(persist).toHaveBeenCalledWith(nextLists);
  });

  it("pasteTodoItemsToLists の結果を persist に渡す", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const items = [createItem({ id: "a" }), createItem({ id: "b" })];
    const nextLists = [createList({ items })];
    (pasteTodoItemsToLists as jest.Mock).mockReturnValue(nextLists);

    pasteTodoItemsAndPersist({
      lists,
      listId: "list-1",
      items,
      persist,
    });

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

    pasteTodoItemsAndPersist({
      lists,
      listId: "list-1",
      items: [],
      persist,
    });

    expect(pasteTodoItemsToLists).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });

  it("対象 listId が存在しないなら persist も pasteTodoItemsToLists も呼ばない", () => {
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
});
