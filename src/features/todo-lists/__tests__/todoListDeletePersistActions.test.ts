import { deleteTodoItemAndPersist } from "../todoListDeletePersistActions";
import type { TodoList, TodoListItem } from "../types";

jest.mock("../todoListConfirmDeleteActions", () => ({
  confirmAndDeleteTodoItem: jest.fn(),
}));

import { confirmAndDeleteTodoItem } from "../todoListConfirmDeleteActions";

const createItem = (overrides: Partial<TodoListItem> = {}): TodoListItem => ({
  id: "item-1",
  title: "Task",
  isCompleted: false,
  createdAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("deleteTodoItemAndPersist", () => {
  it("確認OKなら persist を呼び更新後リストを返す", () => {
    const item2 = createItem({ id: "item-2", title: "Second" });
    const lists = [createList({ items: [createItem(), item2] })];
    const persist = jest.fn();
    const remaining = [createList({ items: [item2] })];
    (confirmAndDeleteTodoItem as jest.Mock).mockReturnValue(remaining);

    const result = deleteTodoItemAndPersist({
      lists,
      listId: "list-1",
      itemId: "item-1",
      message: "削除しますか？",
      persist,
      confirmDelete: jest.fn(() => true),
    });

    expect(result).toBe(remaining);
    expect(persist).toHaveBeenCalledWith(remaining);
  });

  it("確認キャンセルなら persist を呼ばず null を返す", () => {
    const lists = [createList({ items: [createItem()] })];
    const persist = jest.fn();
    (confirmAndDeleteTodoItem as jest.Mock).mockReturnValue(null);

    const result = deleteTodoItemAndPersist({
      lists,
      listId: "list-1",
      itemId: "item-1",
      message: "削除しますか？",
      persist,
      confirmDelete: jest.fn(() => false),
    });

    expect(result).toBeNull();
    expect(persist).not.toHaveBeenCalled();
  });

  it("confirmAndDeleteTodoItem に正しいパラメータを渡す", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const confirmDelete = jest.fn(() => true);
    (confirmAndDeleteTodoItem as jest.Mock).mockReturnValue([]);

    deleteTodoItemAndPersist({
      lists,
      listId: "list-1",
      itemId: "item-1",
      message: "msg",
      persist,
      confirmDelete,
    });

    expect(confirmAndDeleteTodoItem).toHaveBeenCalledWith({
      lists,
      listId: "list-1",
      itemId: "item-1",
      message: "msg",
      confirmDelete,
    });
  });

  it("confirmDelete を省略すると window.confirm をデフォルトで使う（呼び出し確認）", () => {
    const lists = [createList({ items: [createItem()] })];
    const persist = jest.fn();
    jest.spyOn(window, "confirm").mockReturnValue(false);
    // 渡された confirmDelete を実際に呼び出すよう mock を設定
    (confirmAndDeleteTodoItem as jest.Mock).mockImplementation(
      ({
        confirmDelete,
        message,
      }: {
        confirmDelete: (m: string) => boolean;
        message: string;
      }) => {
        confirmDelete(message);
        return null;
      },
    );

    deleteTodoItemAndPersist({
      lists,
      listId: "list-1",
      itemId: "item-1",
      message: "msg",
      persist,
    });

    expect(window.confirm).toHaveBeenCalledWith("msg");
    expect(persist).not.toHaveBeenCalled();
  });

  it("persist に confirmAndDeleteTodoItem の戻り値をそのまま渡す", () => {
    const lists = [createList()];
    const persist = jest.fn();
    const nextLists = [createList({ id: "list-1" })];
    (confirmAndDeleteTodoItem as jest.Mock).mockReturnValue(nextLists);

    const result = deleteTodoItemAndPersist({
      lists,
      listId: "list-1",
      itemId: "item-1",
      message: "msg",
      persist,
      confirmDelete: jest.fn(() => true),
    });

    expect(persist).toHaveBeenCalledWith(nextLists);
    expect(result).toBe(nextLists);
  });
});
