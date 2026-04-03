import type { TodoList } from "../types";
import {
  createTodoListAndPersist,
  deleteTodoListAndPersist,
  renameTodoListAndPersist,
  toggleTodoListVisibilityAndPersist,
} from "../managementPageStateActions";
import {
  createTodoListCreateHandler,
  createTodoListDeleteHandler,
  createTodoListRenameHandler,
  createTodoListVisibilityToggleHandler,
} from "../todoListManagementMutationHandlers";
import { normalizeTitle } from "../todoListTitleNormalization";

jest.mock("../managementPageStateActions", () => ({
  createTodoListAndPersist: jest.fn(),
  deleteTodoListAndPersist: jest.fn(),
  renameTodoListAndPersist: jest.fn(),
  toggleTodoListVisibilityAndPersist: jest.fn(),
}));

jest.mock("../todoListTitleNormalization", () => ({
  normalizeTitle: jest.fn(),
}));

const baseList: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("todoListManagementMutationHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const real = jest.requireActual<
      typeof import("../todoListTitleNormalization")
    >("../todoListTitleNormalization");
    (normalizeTitle as jest.Mock).mockImplementation(real.normalizeTitle);
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

  it("rename handler が空白を trim して空文字を除外する", () => {
    const persist = jest.fn();

    createTodoListRenameHandler({
      lists: [baseList],
      persist,
    })("list-1", "  Work  ");

    expect(renameTodoListAndPersist).toHaveBeenCalledWith(
      [baseList],
      "list-1",
      "Work",
      persist,
    );

    createTodoListRenameHandler({
      lists: [baseList],
      persist,
    })("list-1", "   ");

    expect(renameTodoListAndPersist).toHaveBeenCalledTimes(1);
  });

  it("rename handler は normalizeTitle に委譲する", () => {
    const persist = jest.fn();
    (normalizeTitle as jest.Mock).mockReturnValue("NormalizedTitle");

    createTodoListRenameHandler({
      lists: [baseList],
      persist,
    })("list-1", "  raw title  ");

    expect(normalizeTitle).toHaveBeenCalledWith("  raw title  ");
    expect(renameTodoListAndPersist).toHaveBeenCalledWith(
      [baseList],
      "list-1",
      "NormalizedTitle",
      persist,
    );
  });

  it("normalizeTitle が null を返すと renameTodoListAndPersist を呼ばない", () => {
    const persist = jest.fn();
    (normalizeTitle as jest.Mock).mockReturnValue(null);

    createTodoListRenameHandler({
      lists: [baseList],
      persist,
    })("list-1", "   ");

    expect(renameTodoListAndPersist).not.toHaveBeenCalled();
  });
});
