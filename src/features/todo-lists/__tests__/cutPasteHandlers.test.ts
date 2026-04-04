import {
  createCutTodoItemsHandler,
  createPasteTodoItemsHandler,
} from "../todoListDetailItemHandlers";
import type { TodoList, TodoListItem } from "../types";

jest.mock("../todoListCutPastePersistActions", () => ({
  ...jest.requireActual("../todoListCutPastePersistActions"),
  cutTodoItemsAndPersist: jest.fn(),
  pasteTodoItemsAndPersist: jest.fn(),
}));

import {
  cutTodoItemsAndPersist,
  pasteTodoItemsAndPersist,
} from "../todoListCutPastePersistActions";

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

describe("createCutTodoItemsHandler", () => {
  it("切り取りハンドラを作成し、persist を呼ぶ", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const cutItems = [createItem({ id: "a" })];
    (cutTodoItemsAndPersist as jest.Mock).mockReturnValue(cutItems);

    const handler = createCutTodoItemsHandler({ lists, persist });
    const result = handler("list-1", new Set(["a"]));

    expect(cutTodoItemsAndPersist).toHaveBeenCalledWith({
      lists,
      listId: "list-1",
      itemIds: new Set(["a"]),
      persist,
    });
    expect(result).toBe(cutItems);
  });

  it("空の itemIds でも cutTodoItemsAndPersist に委譲される（空チェックは todoListCutPastePersistActions に委ねる）", () => {
    const lists = [createList()];
    const persist = jest.fn();
    (cutTodoItemsAndPersist as jest.Mock).mockReturnValue([]);

    const handler = createCutTodoItemsHandler({ lists, persist });
    handler("list-1", new Set());

    expect(cutTodoItemsAndPersist).toHaveBeenCalledWith({
      lists,
      listId: "list-1",
      itemIds: new Set(),
      persist,
    });
  });
});

describe("createPasteTodoItemsHandler", () => {
  it("ペーストハンドラを作成し、persist を呼ぶ", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const items = [createItem({ id: "a" })];

    const handler = createPasteTodoItemsHandler({ lists, persist });
    handler("list-1", items);

    expect(pasteTodoItemsAndPersist).toHaveBeenCalledWith({
      lists,
      listId: "list-1",
      items,
      persist,
    });
  });

  it("空アイテム配列でも呼び出される（空チェックは todoListCutPastePersistActions に委ねる）", () => {
    const lists = [createList()];
    const persist = jest.fn();

    const handler = createPasteTodoItemsHandler({ lists, persist });
    handler("list-1", []);

    expect(pasteTodoItemsAndPersist).toHaveBeenCalledWith({
      lists,
      listId: "list-1",
      items: [],
      persist,
    });
  });
});
