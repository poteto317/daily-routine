import type { TodoList } from "../types";
import { persistTodoLists } from "../todoListPersistence";
import { createPersistTodoListsAction } from "../todoListDetailPersistActions";
import { saveAndSyncTodoLists } from "../sync";

jest.mock("../todoListPersistence", () => ({
  persistTodoLists: jest.fn(),
}));

jest.mock("../sync", () => ({
  saveAndSyncTodoLists: jest.fn(),
}));

const baseList: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("todoListDetailPersistActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persist action が state と storage 保存を委譲する", () => {
    const setLists = jest.fn();

    createPersistTodoListsAction({ setLists })([baseList]);

    expect(persistTodoLists).toHaveBeenCalledWith({
      nextLists: [baseList],
      setLists,
      saveLists: saveAndSyncTodoLists,
    });
  });
});
