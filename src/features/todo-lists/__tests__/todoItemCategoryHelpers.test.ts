import type { TodoList, TodoListItem } from "../types";
import { updateItemCategoryInList } from "../todoItemCategoryHelpers";

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

describe("todoItemCategoryHelpers", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("updateItemCategoryInList", () => {
    it("指定アイテムの categoryId を更新し updatedAt を変える", () => {
      const items = [
        createItem({ id: "item-1" }),
        createItem({ id: "item-2" }),
      ];
      const result = updateItemCategoryInList(
        [createList({ items })],
        "list-1",
        "item-1",
        "cat-1",
      );

      expect(result[0].items[0].categoryId).toBe("cat-1");
      expect(result[0].items[1].categoryId).toBeUndefined();
      expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
    });

    it("categoryId に undefined を渡すと未分類に戻す", () => {
      const items = [createItem({ id: "item-1", categoryId: "cat-1" })];
      const result = updateItemCategoryInList(
        [createList({ items })],
        "list-1",
        "item-1",
        undefined,
      );

      expect(result[0].items[0].categoryId).toBeUndefined();
    });

    it("対象外のリストは変更しない", () => {
      const list1 = createList({
        id: "list-1",
        items: [createItem({ id: "item-1" })],
      });
      const list2 = createList({
        id: "list-2",
        items: [createItem({ id: "item-2" })],
      });
      const result = updateItemCategoryInList(
        [list1, list2],
        "list-1",
        "item-1",
        "cat-1",
      );

      expect(result[1].items[0].categoryId).toBeUndefined();
      expect(result[1].updatedAt).toBe(list2.updatedAt);
    });

    it("対象外のアイテムは変更しない", () => {
      const items = [
        createItem({ id: "item-1" }),
        createItem({ id: "item-2", categoryId: "cat-2" }),
      ];
      const result = updateItemCategoryInList(
        [createList({ items })],
        "list-1",
        "item-1",
        "cat-1",
      );

      expect(result[0].items[1].categoryId).toBe("cat-2");
    });

    it("存在しない itemId を指定しても他のアイテムに影響しない", () => {
      const items = [createItem({ id: "item-1", categoryId: "cat-1" })];
      const result = updateItemCategoryInList(
        [createList({ items })],
        "list-1",
        "no-such-item",
        "cat-2",
      );

      expect(result[0].items[0].categoryId).toBe("cat-1");
    });
  });
});
