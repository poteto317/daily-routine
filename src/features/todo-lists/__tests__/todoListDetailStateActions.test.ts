import type { TodoList } from "../types";
import {
  createAddTodoItemHandler,
  createDeleteTodoItemHandler,
  createIndentTodoItemHandler,
  createOutdentTodoItemHandler,
  createPersistTodoListsAction,
  createToggleTodoItemHandler,
} from "../todoListDetailStateActions";

jest.mock("../todoListPersistence", () => ({
  persistTodoLists: jest.fn(),
}));

jest.mock("../sync", () => ({
  saveTodoListsToLocal: jest.fn(),
}));

jest.mock("../pageStateActions", () => ({
  addTodoItemAndPersist: jest.fn(),
  indentTodoItemAndPersist: jest.fn(),
  outdentTodoItemAndPersist: jest.fn(),
  toggleTodoItemAndPersist: jest.fn(),
}));

jest.mock("../todoListDeletePersistActions", () => ({
  deleteTodoItemAndPersist: jest.fn(),
}));

import { persistTodoLists } from "../todoListPersistence";
import { saveTodoListsToLocal } from "../sync";
import {
  addTodoItemAndPersist,
  indentTodoItemAndPersist,
  outdentTodoItemAndPersist,
  toggleTodoItemAndPersist,
} from "../pageStateActions";
import { deleteTodoItemAndPersist } from "../todoListDeletePersistActions";

const baseList: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [
    {
      id: "item-1",
      title: "Task 1",
      isCompleted: false,
      createdAt: "2026-03-07T00:00:00.000Z",
    },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("todoListDetailStateActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persist action が state と storage 保存を委譲する", () => {
    const setLists = jest.fn();

    createPersistTodoListsAction({ setLists })([baseList]);

    expect(persistTodoLists).toHaveBeenCalledWith({
      nextLists: [baseList],
      setLists,
      saveLists: saveTodoListsToLocal,
    });
  });

  it("各 item/list handler が pageState action を組み立てる", () => {
    const persist = jest.fn();

    createAddTodoItemHandler({ lists: [baseList], persist })(
      "list-1",
      "New Task",
    );
    createToggleTodoItemHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
    );
    createDeleteTodoItemHandler({
      lists: [baseList],
      persist,
      deleteItemConfirmTemplate: (title) => `delete-item:${title}`,
    })("list-1", "item-1", "Task 1");
    createIndentTodoItemHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
    );
    createOutdentTodoItemHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
    );

    expect(addTodoItemAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      title: "New Task",
      persist,
    });
    expect(toggleTodoItemAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      persist,
    });
    expect(deleteTodoItemAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      message: "delete-item:Task 1",
      persist,
    });
    expect(indentTodoItemAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      persist,
    });
    expect(outdentTodoItemAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      persist,
    });
  });
});
