import {
  collectTodoListSyncData,
  hasTodoListSyncData,
  normalizeTodoListSyncData,
  saveTodoListSyncData,
} from "../sync/todoListSyncData";
import {
  todoCategoryFixture,
  todoListFixture,
} from "./sync.test.fixtures";
import * as todoListsStorage from "@/features/todo-lists/storage";

jest.mock("@/features/todo-lists/storage", () => ({
  getTodoLists: jest.fn(() => []),
  saveTodoLists: jest.fn(),
  getTodoCategories: jest.fn(() => []),
  saveTodoCategories: jest.fn(),
}));

describe("todoListSyncData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (todoListsStorage.getTodoLists as jest.Mock).mockReturnValue([]);
    (todoListsStorage.getTodoCategories as jest.Mock).mockReturnValue([]);
  });

  it("Todoリストとカテゴリをまとめて収集する", () => {
    (todoListsStorage.getTodoLists as jest.Mock).mockReturnValue([
      todoListFixture,
    ]);
    (todoListsStorage.getTodoCategories as jest.Mock).mockReturnValue([
      todoCategoryFixture,
    ]);

    expect(collectTodoListSyncData()).toEqual({
      todoLists: [todoListFixture],
      todoCategories: [todoCategoryFixture],
    });
  });

  it("Todoリストとカテゴリをまとめて保存する", () => {
    saveTodoListSyncData({
      todoLists: [todoListFixture],
      todoCategories: [todoCategoryFixture],
    });

    expect(todoListsStorage.saveTodoLists).toHaveBeenCalledWith([
      todoListFixture,
    ]);
    expect(todoListsStorage.saveTodoCategories).toHaveBeenCalledWith([
      todoCategoryFixture,
    ]);
  });

  it("欠損したカテゴリを空配列に正規化する", () => {
    expect(
      normalizeTodoListSyncData({ todoLists: [todoListFixture] }),
    ).toEqual({
      todoLists: [todoListFixture],
      todoCategories: [],
    });
  });

  it("欠損したTodoリストを空配列に正規化する", () => {
    expect(
      normalizeTodoListSyncData({ todoCategories: [todoCategoryFixture] }),
    ).toEqual({
      todoLists: [],
      todoCategories: [todoCategoryFixture],
    });
  });

  it("Todoリストだけがある場合は同期対象ありと判定する", () => {
    expect(
      hasTodoListSyncData({
        todoLists: [todoListFixture],
        todoCategories: [],
      }),
    ).toBe(true);
  });

  it("Todoカテゴリだけがある場合は同期対象ありと判定する", () => {
    expect(
      hasTodoListSyncData({
        todoLists: [],
        todoCategories: [todoCategoryFixture],
      }),
    ).toBe(true);
  });

  it("Todoリストとカテゴリがどちらも空の場合は同期対象なしと判定する", () => {
    expect(
      hasTodoListSyncData({
        todoLists: [],
        todoCategories: [],
      }),
    ).toBe(false);
  });
});
