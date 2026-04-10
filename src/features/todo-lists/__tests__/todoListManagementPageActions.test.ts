import type { TodoList } from "../types";
import {
  createManagedTodoListsPersistAction,
  createTodoListCreateHandler,
  createTodoListDeleteHandler,
  createTodoListFormCloseAction,
  createTodoListFormOpenAction,
  createTodoListVisibilityToggleHandler,
} from "../todoListManagementPageActions";

jest.mock("../sync", () => ({
  saveAndSyncTodoLists: jest.fn(),
}));

jest.mock("../managementPageStateActions", () => ({
  createClosedTodoListFormState: jest.fn(),
  createTodoListAndPersist: jest.fn(),
  deleteTodoListAndPersist: jest.fn(),
  persistManagedTodoLists: jest.fn(),
  toggleTodoListVisibilityAndPersist: jest.fn(),
}));

import { saveAndSyncTodoLists } from "../sync";
import {
  createClosedTodoListFormState,
  createTodoListAndPersist,
  deleteTodoListAndPersist,
  persistManagedTodoLists,
  toggleTodoListVisibilityAndPersist,
} from "../managementPageStateActions";

const baseList: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("todoListManagementPageActions", () => {
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

  it("フォーム open/close action を構築する", () => {
    const setShowForm = jest.fn();
    const setTitleInput = jest.fn();
    (createClosedTodoListFormState as jest.Mock).mockReturnValue({
      showForm: false,
      titleInput: "",
    });

    createTodoListFormOpenAction({ setShowForm })();
    expect(setShowForm).toHaveBeenCalledWith(true);

    createTodoListFormCloseAction({ setShowForm, setTitleInput })();
    expect(setTitleInput).toHaveBeenCalledWith("");
    expect(setShowForm).toHaveBeenLastCalledWith(false);
  });

  it("作成 handler が成功時のみ close を呼ぶ", () => {
    const persist = jest.fn();
    const closeForm = jest.fn();
    const nextLists = [
      baseList,
      { ...baseList, id: "list-2", title: "買い物" },
    ];
    (createTodoListAndPersist as jest.Mock).mockReturnValueOnce(nextLists);

    expect(
      createTodoListCreateHandler({
        lists: [baseList],
        titleInput: "買い物",
        persist,
        closeForm,
      })(),
    ).toEqual(nextLists);

    expect(createTodoListAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      titleInput: "買い物",
      persist,
    });
    expect(closeForm).toHaveBeenCalled();

    (createTodoListAndPersist as jest.Mock).mockReturnValueOnce(null);
    expect(
      createTodoListCreateHandler({
        lists: [baseList],
        titleInput: "",
        persist,
        closeForm,
      })(),
    ).toBeNull();
  });

  it("表示切替と削除 handler を構築する", () => {
    const persist = jest.fn();
    const buildDeleteMessage = jest.fn(() => "delete?");

    createTodoListVisibilityToggleHandler({
      lists: [baseList],
      persist,
    })(baseList);

    expect(toggleTodoListVisibilityAndPersist).toHaveBeenCalledWith(
      [baseList],
      "list-1",
      persist,
    );

    createTodoListDeleteHandler({
      lists: [baseList],
      persist,
      buildDeleteMessage,
    })(baseList);

    expect(deleteTodoListAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      list: baseList,
      message: "delete?",
      persist,
    });
  });
});
