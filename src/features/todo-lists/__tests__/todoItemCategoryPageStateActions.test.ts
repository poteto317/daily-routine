import type { TodoList } from "../types";
import { updateTodoItemCategoryAndPersist } from "../todoItemCategoryPageStateActions";

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
    {
      id: "item-2",
      title: "Task 2",
      isCompleted: false,
      createdAt: "2026-03-07T00:00:00.000Z",
    },
  ],
  createdAt: "2026-03-07T00:00:00.000Z",
  updatedAt: "2026-03-07T00:00:00.000Z",
};

describe("todoItemCategoryPageStateActions", () => {
  describe("updateTodoItemCategoryAndPersist", () => {
    it("categoryId 更新後に永続化する", () => {
      const persist = jest.fn();

      const nextLists = updateTodoItemCategoryAndPersist({
        lists: [baseList],
        listId: "list-1",
        itemId: "item-1",
        categoryId: "cat-1",
        persist,
      });

      expect(nextLists[0].items[0].categoryId).toBe("cat-1");
      expect(persist).toHaveBeenCalledWith(nextLists);
    });

    it("categoryId を undefined に戻したら永続化する", () => {
      const listWithCategory: TodoList = {
        ...baseList,
        items: [
          { ...baseList.items[0], categoryId: "cat-1" },
          baseList.items[1],
        ],
      };
      const persist = jest.fn();

      const nextLists = updateTodoItemCategoryAndPersist({
        lists: [listWithCategory],
        listId: "list-1",
        itemId: "item-1",
        categoryId: undefined,
        persist,
      });

      expect(nextLists[0].items[0].categoryId).toBeUndefined();
      expect(persist).toHaveBeenCalledWith(nextLists);
    });

    it("対象外のアイテムには影響を与えない", () => {
      const persist = jest.fn();

      const nextLists = updateTodoItemCategoryAndPersist({
        lists: [baseList],
        listId: "list-1",
        itemId: "item-1",
        categoryId: "cat-1",
        persist,
      });

      expect(nextLists[0].items[1].categoryId).toBeUndefined();
    });

    it("対象外のリストには影響を与えない", () => {
      const otherList: TodoList = {
        ...baseList,
        id: "list-2",
        items: [{ ...baseList.items[0], id: "item-3" }],
      };
      const persist = jest.fn();

      const nextLists = updateTodoItemCategoryAndPersist({
        lists: [baseList, otherList],
        listId: "list-1",
        itemId: "item-1",
        categoryId: "cat-1",
        persist,
      });

      expect(nextLists[1].items[0].categoryId).toBeUndefined();
    });

    it("更新されたリストを返す", () => {
      const persist = jest.fn();

      const result = updateTodoItemCategoryAndPersist({
        lists: [baseList],
        listId: "list-1",
        itemId: "item-1",
        categoryId: "cat-1",
        persist,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("list-1");
    });
  });
});
