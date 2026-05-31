import {
  createTodoListAndPersist,
  deleteTodoListAndPersist,
  isTodoListVisible,
  persistManagedTodoLists,
  renameTodoListAndPersist,
  toggleTodoListVisibilityAndPersist,
} from "../todoListCrudPersistActions";
import type { TodoList } from "../types";

const baseList: TodoList = {
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("todoListCrudPersistActions", () => {
  describe("persistManagedTodoLists", () => {
    it("setLists と saveLists の両方を呼ぶ", () => {
      const setLists = jest.fn();
      const saveLists = jest.fn();

      persistManagedTodoLists({ nextLists: [baseList], setLists, saveLists });

      expect(setLists).toHaveBeenCalledWith([baseList]);
      expect(saveLists).toHaveBeenCalledWith([baseList]);
    });
  });

  describe("createTodoListAndPersist", () => {
    it("正常タイトルでリストを作成して永続化する", () => {
      const persist = jest.fn();

      const nextLists = createTodoListAndPersist({
        lists: [],
        titleInput: "新しいリスト",
        persist,
      });

      expect(nextLists).toEqual(
        expect.arrayContaining([expect.objectContaining({ title: "新しいリスト" })]),
      );
      expect(persist).toHaveBeenCalledWith(nextLists);
    });

    it("空白のみのタイトルでは作成しない", () => {
      const persist = jest.fn();

      expect(
        createTodoListAndPersist({ lists: [], titleInput: "   ", persist }),
      ).toBeNull();
      expect(persist).not.toHaveBeenCalled();
    });
  });

  describe("toggleTodoListVisibilityAndPersist", () => {
    it("表示→非表示に切り替えて永続化する", () => {
      const persist = jest.fn();

      const nextLists = toggleTodoListVisibilityAndPersist(
        [baseList],
        "list-1",
        persist,
      );

      expect(nextLists[0].isHidden).toBe(true);
      expect(persist).toHaveBeenCalledWith(nextLists);
    });

    it("非表示→表示に切り替えて永続化する", () => {
      const persist = jest.fn();
      const hiddenList = { ...baseList, isHidden: true };

      const nextLists = toggleTodoListVisibilityAndPersist(
        [hiddenList],
        "list-1",
        persist,
      );

      expect(nextLists[0].isHidden).toBe(false);
    });
  });

  describe("deleteTodoListAndPersist", () => {
    it("確認後に削除して永続化する", () => {
      const persist = jest.fn();

      const nextLists = deleteTodoListAndPersist({
        lists: [baseList],
        list: baseList,
        message: "delete?",
        persist,
        confirmDelete: jest.fn(() => true),
      });

      expect(nextLists).toEqual([]);
      expect(persist).toHaveBeenCalledWith([]);
    });

    it("確認キャンセル時は何もしない", () => {
      const persist = jest.fn();

      expect(
        deleteTodoListAndPersist({
          lists: [baseList],
          list: baseList,
          message: "delete?",
          persist,
          confirmDelete: jest.fn(() => false),
        }),
      ).toBeNull();
      expect(persist).not.toHaveBeenCalled();
    });
  });

  describe("renameTodoListAndPersist", () => {
    it("タイトルを変更して永続化する", () => {
      const persist = jest.fn();

      const nextLists = renameTodoListAndPersist(
        [baseList],
        "list-1",
        "新タイトル",
        persist,
      );

      expect(nextLists[0].title).toBe("新タイトル");
      expect(persist).toHaveBeenCalledWith(nextLists);
    });

    it("対象リスト以外は変更しない", () => {
      const list2: TodoList = { ...baseList, id: "list-2", title: "Other" };
      const persist = jest.fn();

      const nextLists = renameTodoListAndPersist(
        [baseList, list2],
        "list-1",
        "Renamed",
        persist,
      );

      expect(nextLists[1].title).toBe("Other");
    });
  });

  describe("isTodoListVisible", () => {
    it("isHidden が未設定のリストは表示状態", () => {
      expect(isTodoListVisible(baseList)).toBe(true);
    });

    it("isHidden=true のリストは非表示状態", () => {
      expect(isTodoListVisible({ ...baseList, isHidden: true })).toBe(false);
    });

    it("isHidden=false のリストは表示状態", () => {
      expect(isTodoListVisible({ ...baseList, isHidden: false })).toBe(true);
    });
  });
});
