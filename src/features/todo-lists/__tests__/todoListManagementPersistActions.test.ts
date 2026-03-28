import type { TodoList } from "../types";
import { persistManagedTodoLists } from "../managementPageStateActions";
import { createManagedTodoListsPersistAction } from "../todoListManagementPersistActions";
import { saveAndSyncTodoLists } from "../sync";

jest.mock("../sync", () => ({
  saveAndSyncTodoLists: jest.fn(),
}));

jest.mock("../managementPageStateActions", () => ({
  persistManagedTodoLists: jest.fn(),
}));

const baseList: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("todoListManagementPersistActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("永続化 action が state と storage 保存を委譲する", () => {
    const setLists = jest.fn();
    const nextLists = [baseList];

    createManagedTodoListsPersistAction({ setLists })(nextLists);

    expect(persistManagedTodoLists).toHaveBeenCalledWith({
      nextLists,
      setLists,
      saveLists: saveAndSyncTodoLists,
    });
  });
});
