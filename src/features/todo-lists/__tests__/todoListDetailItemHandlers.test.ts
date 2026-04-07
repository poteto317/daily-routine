import type { TodoList } from "../types";
import {
  addTodoItemAndPersist,
  indentTodoItemAndPersist,
  outdentTodoItemAndPersist,
  reorderTodoItemsAndPersist,
  toggleTodoItemAndPersist,
  updateTodoItemTitleAndPersist,
} from "../pageStateActions";
import {
  cutTodoItemsAndPersist,
  pasteTodoItemsAndPersist,
} from "../todoListCutPastePersistActions";
import { deleteTodoItemAndPersist } from "../todoListDeletePersistActions";
import {
  createAddTodoItemHandler,
  createCutTodoItemsHandler,
  createDeleteTodoItemHandler,
  createIndentTodoItemHandler,
  createOutdentTodoItemHandler,
  createPasteTodoItemsHandler,
  createReorderTodoItemsHandler,
  createToggleTodoItemHandler,
  createUpdateTodoItemTitleHandler,
} from "../todoListDetailItemHandlers";
import { normalizeTitle } from "../todoListTitleNormalization";

jest.mock("../todoListTitleNormalization", () => ({
  normalizeTitle: jest.fn(),
}));

jest.mock("../pageStateActions", () => ({
  addTodoItemAndPersist: jest.fn(),
  indentTodoItemAndPersist: jest.fn(),
  outdentTodoItemAndPersist: jest.fn(),
  reorderTodoItemsAndPersist: jest.fn(),
  toggleTodoItemAndPersist: jest.fn(),
  updateTodoItemTitleAndPersist: jest.fn(),
}));

jest.mock("../todoListCutPastePersistActions", () => ({
  cutTodoItemsAndPersist: jest.fn(),
  pasteTodoItemsAndPersist: jest.fn(),
}));

jest.mock("../todoListDeletePersistActions", () => ({
  deleteTodoItemAndPersist: jest.fn(),
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
    (normalizeTitle as jest.Mock).mockImplementation(real.normalizeTitle);
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
      insertAfterIndex: undefined,
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

  it("item title 更新 handler は normalizeTitle に委譲する", () => {
    const persist = jest.fn();
    (normalizeTitle as jest.Mock).mockReturnValue("Normalized");

    createUpdateTodoItemTitleHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
      "  raw  ",
    );

    expect(normalizeTitle).toHaveBeenCalledWith("  raw  ");
    expect(updateTodoItemTitleAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Normalized" }),
    );
  });

  it("normalizeTitle が null を返すと updateTodoItemTitleAndPersist を呼ばない", () => {
    const persist = jest.fn();
    (normalizeTitle as jest.Mock).mockReturnValue(null);

    createUpdateTodoItemTitleHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
      "   ",
    );

    expect(updateTodoItemTitleAndPersist).not.toHaveBeenCalled();
  });

  it("cut handler が cutTodoItemsAndPersist を呼んで切り取ったアイテムを返す", () => {
    const persist = jest.fn();
    const cutItem = { ...baseList.items[0] };
    (cutTodoItemsAndPersist as jest.Mock).mockReturnValue([cutItem]);

    const result = createCutTodoItemsHandler({ lists: [baseList], persist })(
      "list-1",
      new Set(["item-1"]),
    );

    expect(cutTodoItemsAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      itemIds: new Set(["item-1"]),
      persist,
    });
    expect(result).toEqual([cutItem]);
  });

  it("paste handler が pasteTodoItemsAndPersist を呼ぶ", () => {
    const persist = jest.fn();
    const items = [baseList.items[0]];

    createPasteTodoItemsHandler({ lists: [baseList], persist })(
      "list-1",
      items,
    );

    expect(pasteTodoItemsAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      items,
      persist,
    });
  });

  it("add handler が insertAfterIndex の値を addTodoItemAndPersist に渡す", () => {
    const persist = jest.fn();

    createAddTodoItemHandler({ lists: [baseList], persist })(
      "list-1",
      "New Task",
      2,
    );

    expect(addTodoItemAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      title: "New Task",
      insertAfterIndex: 2,
      persist,
    });
  });
});
