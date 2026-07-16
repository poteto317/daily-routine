import type { TodoList } from "../types";
import { updateTodoItemCategoryAndPersist } from "../todoItemCategoryPageStateActions";
import { createUpdateTodoItemCategoryHandler } from "../todoListDetailCategoryHandlers";

jest.mock("../todoItemCategoryPageStateActions", () => ({
  updateTodoItemCategoryAndPersist: jest.fn(),
}));

const makeList = (id: string): TodoList => ({
  id,
  title: "List",
  items: [
    {
      id: "item-1",
      title: "Task 1",
      isCompleted: false,
      createdAt: "2026-03-07T00:00:00.000Z",
    },
    {
      id: "item-2",
      title: "Task 2",
      isCompleted: false,
      createdAt: "2026-03-07T00:00:00.000Z",
    },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
});

const baseList = makeList("list-1");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createUpdateTodoItemCategoryHandler", () => {
  it("指定した categoryId で updateTodoItemCategoryAndPersist を呼ぶ", () => {
    const persist = jest.fn();

    createUpdateTodoItemCategoryHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
      "cat-1",
    );

    expect(updateTodoItemCategoryAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      categoryId: "cat-1",
      persist,
    });
  });

  it("categoryId に undefined を渡すと updateTodoItemCategoryAndPersist を呼ぶ", () => {
    const persist = jest.fn();

    createUpdateTodoItemCategoryHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
      undefined,
    );

    expect(updateTodoItemCategoryAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      categoryId: undefined,
      persist,
    });
  });

  it("渡した lists がそのまま転送される", () => {
    const persist = jest.fn();
    const lists = [makeList("list-A"), makeList("list-B")];

    createUpdateTodoItemCategoryHandler({ lists, persist })(
      "list-A",
      "item-1",
      "cat-1",
    );

    expect(updateTodoItemCategoryAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ lists }),
    );
  });

  it("呼び出した listId・itemId がそのまま転送される", () => {
    const persist = jest.fn();
    const lists = [makeList("list-X")];

    createUpdateTodoItemCategoryHandler({ lists, persist })(
      "list-X",
      "item-2",
      "cat-2",
    );

    expect(updateTodoItemCategoryAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ listId: "list-X", itemId: "item-2" }),
    );
  });

  it("渡した persist がそのまま転送される", () => {
    const persist = jest.fn();

    createUpdateTodoItemCategoryHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
      "cat-1",
    );

    expect(updateTodoItemCategoryAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ persist }),
    );
  });
});
