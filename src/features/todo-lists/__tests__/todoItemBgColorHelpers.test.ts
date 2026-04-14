import type { TodoList, TodoListItem } from "../types";
import {
  updateItemBgColorInList,
  updateAllItemsBgColorInList,
} from "../todoItemBgColorHelpers";

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

describe("todoItemBgColorHelpers", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("updateItemBgColorInList", () => {
    it("指定アイテムの bgColor を更新し updatedAt を変える", () => {
      const items = [
        createItem({ id: "item-1" }),
        createItem({ id: "item-2" }),
      ];
      const result = updateItemBgColorInList(
        [createList({ items })],
        "list-1",
        "item-1",
        "bg-red-50",
      );

      expect(result[0].items[0].bgColor).toBe("bg-red-50");
      expect(result[0].items[1].bgColor).toBeUndefined();
      expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
    });

    it("bgColor に undefined を渡すとプロパティを undefined に戻す", () => {
      const items = [createItem({ id: "item-1", bgColor: "bg-blue-50" })];
      const result = updateItemBgColorInList(
        [createList({ items })],
        "list-1",
        "item-1",
        undefined,
      );

      expect(result[0].items[0].bgColor).toBeUndefined();
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
      const result = updateItemBgColorInList(
        [list1, list2],
        "list-1",
        "item-1",
        "bg-green-50",
      );

      expect(result[1].items[0].bgColor).toBeUndefined();
      expect(result[1].updatedAt).toBe(list2.updatedAt);
    });

    it("対象外のアイテムは変更しない", () => {
      const items = [
        createItem({ id: "item-1" }),
        createItem({ id: "item-2", bgColor: "bg-orange-50" }),
      ];
      const result = updateItemBgColorInList(
        [createList({ items })],
        "list-1",
        "item-1",
        "bg-red-50",
      );

      expect(result[0].items[1].bgColor).toBe("bg-orange-50");
    });

    it("存在しない itemId を指定しても他のアイテムに影響しない", () => {
      const items = [createItem({ id: "item-1", bgColor: "bg-red-50" })];
      const result = updateItemBgColorInList(
        [createList({ items })],
        "list-1",
        "no-such-item",
        "bg-blue-50",
      );

      expect(result[0].items[0].bgColor).toBe("bg-red-50");
    });
  });

  describe("updateAllItemsBgColorInList", () => {
    it("リスト内の全アイテムの bgColor を一括更新し、defaultItemBgColor も更新する", () => {
      const items = [
        createItem({ id: "item-1" }),
        createItem({ id: "item-2" }),
        createItem({ id: "item-3", bgColor: "bg-red-50" }),
      ];
      const result = updateAllItemsBgColorInList(
        [createList({ items })],
        "list-1",
        "bg-yellow-50",
      );

      expect(
        result[0].items.every((item) => item.bgColor === "bg-yellow-50"),
      ).toBe(true);
      expect(result[0].defaultItemBgColor).toBe("bg-yellow-50");
      expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
    });

    it("bgColor に undefined を渡すと全アイテムをデフォルトに戻し、defaultItemBgColor も undefined になる", () => {
      const items = [
        createItem({ id: "item-1", bgColor: "bg-red-50" }),
        createItem({ id: "item-2", bgColor: "bg-blue-50" }),
      ];
      const result = updateAllItemsBgColorInList(
        [createList({ items })],
        "list-1",
        undefined,
      );

      expect(result[0].items.every((item) => item.bgColor === undefined)).toBe(
        true,
      );
      expect(result[0].defaultItemBgColor).toBeUndefined();
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
      const result = updateAllItemsBgColorInList(
        [list1, list2],
        "list-1",
        "bg-pink-50",
      );

      expect(result[1].items[0].bgColor).toBeUndefined();
      expect(result[1].updatedAt).toBe(list2.updatedAt);
    });

    it("アイテムが空のリストでも updatedAt を更新する", () => {
      const result = updateAllItemsBgColorInList(
        [createList({ items: [] })],
        "list-1",
        "bg-red-50",
      );

      expect(result[0].updatedAt).toBe("2026-03-07T12:00:00.000Z");
    });

    it("複数リストの中で対象のリストのみ更新する", () => {
      const list1 = createList({
        id: "list-1",
        items: [createItem({ id: "item-1" })],
      });
      const list2 = createList({
        id: "list-2",
        items: [createItem({ id: "item-2", bgColor: "bg-green-50" })],
      });
      const result = updateAllItemsBgColorInList(
        [list1, list2],
        "list-1",
        "bg-yellow-50",
      );

      expect(result[0].items[0].bgColor).toBe("bg-yellow-50");
      expect(result[1].items[0].bgColor).toBe("bg-green-50");
    });
  });
});
