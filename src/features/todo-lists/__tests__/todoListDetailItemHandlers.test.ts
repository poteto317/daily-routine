import type { TodoList } from "../types";
import {
  addTodoItemAndPersist,
  deleteTodoItemAndPersist,
  indentTodoItemAndPersist,
  outdentTodoItemAndPersist,
  reorderTodoItemsAndPersist,
  toggleTodoItemAndPersist,
  updateTodoItemTitleAndPersist,
} from "../pageStateActions";
import {
  createAddTodoItemHandler,
  createDeleteTodoItemHandler,
  createIndentTodoItemHandler,
  createOutdentTodoItemHandler,
  createReorderTodoItemsHandler,
  createToggleTodoItemHandler,
  createUpdateTodoItemTitleHandler,
} from "../todoListDetailItemHandlers";
import { normalizeTodoTitle } from "../todoListTitleNormalization";

jest.mock("../todoListTitleNormalization", () => ({
  normalizeTodoTitle: jest.fn(),
}));

jest.mock("../pageStateActions", () => ({
  addTodoItemAndPersist: jest.fn(),
  deleteTodoItemAndPersist: jest.fn(),
  indentTodoItemAndPersist: jest.fn(),
  outdentTodoItemAndPersist: jest.fn(),
  reorderTodoItemsAndPersist: jest.fn(),
  toggleTodoItemAndPersist: jest.fn(),
  updateTodoItemTitleAndPersist: jest.fn(),
}));

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

describe("todoListDetailItemHandlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const real = jest.requireActual<
      typeof import("../todoListTitleNormalization")
    >("../todoListTitleNormalization");
    (normalizeTodoTitle as jest.Mock).mockImplementation(
      real.normalizeTodoTitle,
    );
  });

  it("item handler 群が pageState action を組み立てる", () => {
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
    createReorderTodoItemsHandler({ lists: [baseList], persist })(
      "list-1",
      0,
      1,
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
      title: "Task 1",
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
    expect(reorderTodoItemsAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      fromIndex: 0,
      toIndex: 1,
      persist,
    });
  });

  it("item title 更新 handler が trim と空文字 guard を行う", () => {
    const persist = jest.fn();

    createUpdateTodoItemTitleHandler({
      lists: [baseList],
      persist,
    })("list-1", "item-1", "  Updated  ");

    expect(updateTodoItemTitleAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      title: "Updated",
      persist,
    });

    createUpdateTodoItemTitleHandler({
      lists: [baseList],
      persist,
    })("list-1", "item-1", "   ");

    expect(updateTodoItemTitleAndPersist).toHaveBeenCalledTimes(1);
  });

  it("item title 更新 handler は normalizeTodoTitle に委譲する", () => {
    const persist = jest.fn();
    (normalizeTodoTitle as jest.Mock).mockReturnValue("Normalized");

    createUpdateTodoItemTitleHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
      "  raw  ",
    );

    expect(normalizeTodoTitle).toHaveBeenCalledWith("  raw  ");
    expect(updateTodoItemTitleAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Normalized" }),
    );
  });

  it("normalizeTodoTitle が null を返すと updateTodoItemTitleAndPersist を呼ばない", () => {
    const persist = jest.fn();
    (normalizeTodoTitle as jest.Mock).mockReturnValue(null);

    createUpdateTodoItemTitleHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
      "   ",
    );

    expect(updateTodoItemTitleAndPersist).not.toHaveBeenCalled();
  });
});
