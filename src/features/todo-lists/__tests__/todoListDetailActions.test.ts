import {
  updateTodoListAddItemPositionInLists,
  updateTodoListHideCompletedInLists,
  updateTodoListTitleInLists,
} from "../todoListDetailActions";
import type { TodoList } from "../types";

const createList = (overrides: Partial<TodoList> = {}): TodoList => ({
  id: "list-1",
  title: "Inbox",
  items: [],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
  ...overrides,
});

describe("todoListDetailActions", () => {
  describe("updateTodoListTitleInLists", () => {
    it("指定リストのタイトルを更新する", () => {
      const result = updateTodoListTitleInLists({
        lists: [createList()],
        listId: "list-1",
        title: "新しいタイトル",
      });

      expect(result[0].title).toBe("新しいタイトル");
    });

    it("対象リスト以外を変更しない", () => {
      const list2 = createList({ id: "list-2", title: "Other" });

      const result = updateTodoListTitleInLists({
        lists: [createList(), list2],
        listId: "list-1",
        title: "Updated",
      });

      expect(result[1].title).toBe("Other");
    });
  });

  describe("updateTodoListAddItemPositionInLists", () => {
    it("addItemPosition を 'first' に設定する", () => {
      const result = updateTodoListAddItemPositionInLists({
        lists: [createList()],
        listId: "list-1",
        position: "first",
      });

      expect(result[0].addItemPosition).toBe("first");
    });

    it("addItemPosition を 'last' に設定する", () => {
      const result = updateTodoListAddItemPositionInLists({
        lists: [createList({ addItemPosition: "first" })],
        listId: "list-1",
        position: "last",
      });

      expect(result[0].addItemPosition).toBe("last");
    });

    it("対象リスト以外を変更しない", () => {
      const list2 = createList({ id: "list-2", title: "Other" });

      const result = updateTodoListAddItemPositionInLists({
        lists: [createList(), list2],
        listId: "list-1",
        position: "first",
      });

      expect(result[1]).toBe(list2);
    });
  });

  describe("updateTodoListHideCompletedInLists", () => {
    it("hideCompleted を true に設定する", () => {
      const result = updateTodoListHideCompletedInLists({
        lists: [createList()],
        listId: "list-1",
        hideCompleted: true,
      });

      expect(result[0].hideCompleted).toBe(true);
    });

    it("対象リスト以外を変更しない", () => {
      const list2 = createList({ id: "list-2", title: "Other" });

      const result = updateTodoListHideCompletedInLists({
        lists: [createList(), list2],
        listId: "list-1",
        hideCompleted: true,
      });

      expect(result[1]).toBe(list2);
    });
  });
});
