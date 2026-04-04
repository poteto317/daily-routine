import type { TodoList } from "../types";
import {
  updateTodoItemBgColorAndPersist,
  updateAllTodoItemsBgColorAndPersist,
} from "../todoItemBgColorPageStateActions";
import {
  createUpdateTodoItemBgColorHandler,
  createUpdateAllTodoItemsBgColorHandler,
} from "../todoListDetailBgColorHandlers";

jest.mock("../todoItemBgColorPageStateActions", () => ({
  updateTodoItemBgColorAndPersist: jest.fn(),
  updateAllTodoItemsBgColorAndPersist: jest.fn(),
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

// ── createUpdateTodoItemBgColorHandler ────────────────────────────────────────

describe("createUpdateTodoItemBgColorHandler", () => {
  it("指定した bgColor で updateTodoItemBgColorAndPersist を呼ぶ", () => {
    const persist = jest.fn();

    createUpdateTodoItemBgColorHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
      "bg-red-50",
    );

    expect(updateTodoItemBgColorAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      bgColor: "bg-red-50",
      persist,
    });
  });

  it("bgColor に undefined を渡すと updateTodoItemBgColorAndPersist を呼ぶ", () => {
    const persist = jest.fn();

    createUpdateTodoItemBgColorHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
      undefined,
    );

    expect(updateTodoItemBgColorAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      itemId: "item-1",
      bgColor: undefined,
      persist,
    });
  });

  it("渡した lists がそのまま転送される", () => {
    const persist = jest.fn();
    const lists = [makeList("list-A"), makeList("list-B")];

    createUpdateTodoItemBgColorHandler({ lists, persist })(
      "list-A",
      "item-1",
      "bg-blue-50",
    );

    expect(updateTodoItemBgColorAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ lists }),
    );
  });

  it("呼び出した listId がそのまま転送される", () => {
    const persist = jest.fn();
    const lists = [makeList("list-X")];

    createUpdateTodoItemBgColorHandler({ lists, persist })(
      "list-X",
      "item-1",
      "bg-green-50",
    );

    expect(updateTodoItemBgColorAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ listId: "list-X" }),
    );
  });

  it("呼び出した itemId がそのまま転送される", () => {
    const persist = jest.fn();

    createUpdateTodoItemBgColorHandler({ lists: [baseList], persist })(
      "list-1",
      "item-2",
      "bg-yellow-50",
    );

    expect(updateTodoItemBgColorAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: "item-2" }),
    );
  });

  it("渡した persist がそのまま転送される", () => {
    const persist = jest.fn();

    createUpdateTodoItemBgColorHandler({ lists: [baseList], persist })(
      "list-1",
      "item-1",
      "bg-pink-50",
    );

    expect(updateTodoItemBgColorAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ persist }),
    );
  });
});

// ── createUpdateAllTodoItemsBgColorHandler ────────────────────────────────────

describe("createUpdateAllTodoItemsBgColorHandler", () => {
  it("指定した bgColor で updateAllTodoItemsBgColorAndPersist を呼ぶ", () => {
    const persist = jest.fn();

    createUpdateAllTodoItemsBgColorHandler({ lists: [baseList], persist })(
      "list-1",
      "bg-yellow-50",
    );

    expect(updateAllTodoItemsBgColorAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      bgColor: "bg-yellow-50",
      persist,
    });
  });

  it("bgColor に undefined を渡すと updateAllTodoItemsBgColorAndPersist を呼ぶ", () => {
    const persist = jest.fn();

    createUpdateAllTodoItemsBgColorHandler({ lists: [baseList], persist })(
      "list-1",
      undefined,
    );

    expect(updateAllTodoItemsBgColorAndPersist).toHaveBeenCalledWith({
      lists: [baseList],
      listId: "list-1",
      bgColor: undefined,
      persist,
    });
  });

  it("渡した lists がそのまま転送される", () => {
    const persist = jest.fn();
    const lists = [makeList("list-A"), makeList("list-B")];

    createUpdateAllTodoItemsBgColorHandler({ lists, persist })(
      "list-A",
      "bg-orange-50",
    );

    expect(updateAllTodoItemsBgColorAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ lists }),
    );
  });

  it("呼び出した listId がそのまま転送される", () => {
    const persist = jest.fn();
    const lists = [makeList("list-Y")];

    createUpdateAllTodoItemsBgColorHandler({ lists, persist })(
      "list-Y",
      "bg-purple-50",
    );

    expect(updateAllTodoItemsBgColorAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ listId: "list-Y" }),
    );
  });

  it("渡した persist がそのまま転送される", () => {
    const persist = jest.fn();

    createUpdateAllTodoItemsBgColorHandler({ lists: [baseList], persist })(
      "list-1",
      "bg-blue-50",
    );

    expect(updateAllTodoItemsBgColorAndPersist).toHaveBeenCalledWith(
      expect.objectContaining({ persist }),
    );
  });
});
