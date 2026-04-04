import type { TodoList } from "../types";
import { deleteTodoListAndPersist } from "../todoListDeletePersistActions";
import { updateTodoListTitleAndPersist } from "../todoListTitleUpdatePersistAction";
import {
  createDeleteTodoListHandler,
  createUpdateListTitleHandler,
} from "../todoListDetailListHandlers";
import { normalizeTitle } from "../todoListTitleNormalization";

jest.mock("../todoListDeletePersistActions", () => ({
  deleteTodoListAndPersist: jest.fn(),
}));

jest.mock("../todoListTitleUpdatePersistAction", () => ({
  updateTodoListTitleAndPersist: jest.fn(),
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

describe("todoListDetailListHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const real = jest.requireActual<
      typeof import("../todoListTitleNormalization")
    >("../todoListTitleNormalization");
    (normalizeTitle as jest.Mock).mockImplementation(real.normalizeTitle);
  });

  it("list 削除 handler が確認文言を組み立てる", () => {
    const persist = jest.fn();

    createDeleteTodoListHandler({
      lists: [baseList],
      persist,
      deleteListConfirmTemplate: (title) => `delete-list:${title}`,
    })(baseList);

    expect(deleteTodoListAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      list: baseList,
      message: "delete-list:Inbox",
      persist,
    });
  });

  it("list title 更新 handler が trim と空文字 guard を行う", () => {
    const persist = jest.fn();

    createUpdateListTitleHandler({
      lists: [baseList],
      persist,
    })("list-1", "  Work  ");

    expect(updateTodoListTitleAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      title: "Work",
      persist,
    });

    createUpdateListTitleHandler({
      lists: [baseList],
      persist,
    })("list-1", "   ");

    expect(updateTodoListTitleAndPersist).toHaveBeenCalledTimes(1);
  });

  it("list title 更新 handler は normalizeTitle に委譲する", () => {
    const persist = jest.fn();
    (normalizeTitle as jest.Mock).mockReturnValue("Normalized");

    createUpdateListTitleHandler({ lists: [baseList], persist })(
      "list-1",
      "  raw  ",
    );

    expect(normalizeTitle).toHaveBeenCalledWith("  raw  ");
    expect(updateTodoListTitleAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Normalized" }),
    );
  });

  it("normalizeTitle が null を返すと updateTodoListTitleAndPersist を呼ばない", () => {
    const persist = jest.fn();
    (normalizeTitle as jest.Mock).mockReturnValue(null);

    createUpdateListTitleHandler({ lists: [baseList], persist })(
      "list-1",
      "   ",
    );

    expect(updateTodoListTitleAndPersist).not.toHaveBeenCalled();
  });
});
