import type { TodoList, TodoListItem } from "../types";
import {
  updateTodoItemBgColorInLists,
  updateAllTodoItemsBgColorInLists,
} from "../todoItemBgColorDetailActions";

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

describe("todoItemBgColorDetailActions", () => {
  describe("updateTodoItemBgColorInLists", () => {
    it("指定アイテムの bgColor を更新する", () => {
      const lists = [
        createList({
          items: [createItem({ id: "item-1" }), createItem({ id: "item-2" })],
        }),
      ];

      const result = updateTodoItemBgColorInLists({
        lists,
        listId: "list-1",
        itemId: "item-1",
        bgColor: "bg-blue-50",
      });

      expect(result[0].items[0].bgColor).toBe("bg-blue-50");
      expect(result[0].items[1].bgColor).toBeUndefined();
    });

    it("undefined を渡すと bgColor をリセットする", () => {
      const lists = [
        createList({
          items: [createItem({ id: "item-1", bgColor: "bg-red-50" })],
        }),
      ];

      const result = updateTodoItemBgColorInLists({
        lists,
        listId: "list-1",
        itemId: "item-1",
        bgColor: undefined,
      });

      expect(result[0].items[0].bgColor).toBeUndefined();
    });

    it("対象外のリストには影響を与えない", () => {
      const lists = [
        createList({ id: "list-1", items: [createItem({ id: "item-1" })] }),
        createList({ id: "list-2", items: [createItem({ id: "item-2" })] }),
      ];

      const result = updateTodoItemBgColorInLists({
        lists,
        listId: "list-1",
        itemId: "item-1",
        bgColor: "bg-green-50",
      });

      expect(result[1].items[0].bgColor).toBeUndefined();
    });

    it("対象外のアイテムには影響を与えない", () => {
      const lists = [
        createList({
          items: [
            createItem({ id: "item-1" }),
            createItem({ id: "item-2", bgColor: "bg-orange-50" }),
          ],
        }),
      ];

      const result = updateTodoItemBgColorInLists({
        lists,
        listId: "list-1",
        itemId: "item-1",
        bgColor: "bg-blue-50",
      });

      expect(result[0].items[1].bgColor).toBe("bg-orange-50");
    });
  });

  describe("updateAllTodoItemsBgColorInLists", () => {
    it("全アイテムの bgColor を一括更新する", () => {
      const lists = [
        createList({
          items: [
            createItem({ id: "item-1" }),
            createItem({ id: "item-2", bgColor: "bg-red-50" }),
          ],
        }),
      ];

      const result = updateAllTodoItemsBgColorInLists({
        lists,
        listId: "list-1",
        bgColor: "bg-yellow-50",
      });

      expect(
        result[0].items.every((item) => item.bgColor === "bg-yellow-50"),
      ).toBe(true);
    });

    it("undefined を渡すと全アイテムをリセットする", () => {
      const lists = [
        createList({
          items: [
            createItem({ id: "item-1", bgColor: "bg-red-50" }),
            createItem({ id: "item-2", bgColor: "bg-blue-50" }),
          ],
        }),
      ];

      const result = updateAllTodoItemsBgColorInLists({
        lists,
        listId: "list-1",
        bgColor: undefined,
      });

      expect(result[0].items.every((item) => item.bgColor === undefined)).toBe(
        true,
      );
    });

    it("対象外のリストには影響を与えない", () => {
      const lists = [
        createList({ id: "list-1", items: [createItem({ id: "item-1" })] }),
        createList({
          id: "list-2",
          items: [createItem({ id: "item-2", bgColor: "bg-green-50" })],
        }),
      ];

      const result = updateAllTodoItemsBgColorInLists({
        lists,
        listId: "list-1",
        bgColor: "bg-yellow-50",
      });

      expect(result[1].items[0].bgColor).toBe("bg-green-50");
    });
  });
});
