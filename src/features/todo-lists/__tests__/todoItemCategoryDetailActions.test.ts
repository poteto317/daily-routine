import type { TodoList, TodoListItem } from "../types";
import { updateTodoItemCategoryInLists } from "../todoItemCategoryDetailActions";

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

describe("todoItemCategoryDetailActions", () => {
  describe("updateTodoItemCategoryInLists", () => {
    it("指定アイテムの categoryId を更新する", () => {
      const lists = [
        createList({
          items: [createItem({ id: "item-1" }), createItem({ id: "item-2" })],
        }),
      ];

      const result = updateTodoItemCategoryInLists({
        lists,
        listId: "list-1",
        itemId: "item-1",
        categoryId: "cat-1",
      });

      expect(result[0].items[0].categoryId).toBe("cat-1");
      expect(result[0].items[1].categoryId).toBeUndefined();
    });

    it("undefined を渡すと categoryId をリセットする", () => {
      const lists = [
        createList({
          items: [createItem({ id: "item-1", categoryId: "cat-1" })],
        }),
      ];

      const result = updateTodoItemCategoryInLists({
        lists,
        listId: "list-1",
        itemId: "item-1",
        categoryId: undefined,
      });

      expect(result[0].items[0].categoryId).toBeUndefined();
    });

    it("対象外のリストには影響を与えない", () => {
      const lists = [
        createList({ id: "list-1", items: [createItem({ id: "item-1" })] }),
        createList({ id: "list-2", items: [createItem({ id: "item-2" })] }),
      ];

      const result = updateTodoItemCategoryInLists({
        lists,
        listId: "list-1",
        itemId: "item-1",
        categoryId: "cat-1",
      });

      expect(result[1].items[0].categoryId).toBeUndefined();
    });

    it("対象外のアイテムには影響を与えない", () => {
      const lists = [
        createList({
          items: [
            createItem({ id: "item-1" }),
            createItem({ id: "item-2", categoryId: "cat-2" }),
          ],
        }),
      ];

      const result = updateTodoItemCategoryInLists({
        lists,
        listId: "list-1",
        itemId: "item-1",
        categoryId: "cat-1",
      });

      expect(result[0].items[1].categoryId).toBe("cat-2");
    });
  });
});
