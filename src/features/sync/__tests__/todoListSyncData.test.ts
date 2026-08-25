import {
  collectTodoListSyncData,
  hasTodoListSyncData,
  normalizeTodoListSyncData,
  saveTodoListSyncData,
} from "../sync/todoListSyncData";
import { todoCategoryFixture, todoListFixture } from "./sync.test.fixtures";
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

  it("カテゴリが欠損（undefined）している場合は既存のローカルカテゴリを保持する（本フィールド追加前のクラウドデータによる意図しない削除を防止）", () => {
    (todoListsStorage.getTodoCategories as jest.Mock).mockReturnValue([
      todoCategoryFixture,
    ]);

    expect(normalizeTodoListSyncData({ todoLists: [todoListFixture] })).toEqual(
      {
        todoLists: [todoListFixture],
        todoCategories: [todoCategoryFixture],
      },
    );
  });

  it("カテゴリが明示的に空配列の場合はそのまま空配列として正規化する（ユーザーが全カテゴリを削除した結果を尊重する）", () => {
    (todoListsStorage.getTodoCategories as jest.Mock).mockReturnValue([
      todoCategoryFixture,
    ]);

    expect(
      normalizeTodoListSyncData({
        todoLists: [todoListFixture],
        todoCategories: [],
      }),
    ).toEqual({
      todoLists: [todoListFixture],
      todoCategories: [],
    });
  });

  it("Todoリストが欠損（undefined）している場合は既存のローカルリストを保持する（本フィールド追加前のクラウドデータによる意図しない削除を防止）", () => {
    (todoListsStorage.getTodoLists as jest.Mock).mockReturnValue([
      todoListFixture,
    ]);

    expect(
      normalizeTodoListSyncData({ todoCategories: [todoCategoryFixture] }),
    ).toEqual({
      todoLists: [todoListFixture],
      todoCategories: [todoCategoryFixture],
    });
  });

  it("Todoリストが明示的に空配列の場合はそのまま空配列として正規化する（ユーザーが全リストを削除した結果を尊重する）", () => {
    (todoListsStorage.getTodoLists as jest.Mock).mockReturnValue([
      todoListFixture,
    ]);

    expect(
      normalizeTodoListSyncData({
        todoLists: [],
        todoCategories: [todoCategoryFixture],
      }),
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
