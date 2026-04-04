import type { TodoList } from "../types";
import {
  updateTodoItemBgColorAndPersist,
  updateAllTodoItemsBgColorAndPersist,
} from "../todoItemBgColorPageStateActions";

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

describe("todoItemBgColorPageStateActions", () => {
  describe("updateTodoItemBgColorAndPersist", () => {
    it("bgColor 更新後に永続化する", () => {
      const persist = jest.fn();

      const nextLists = updateTodoItemBgColorAndPersist({
        lists: [baseList],
        listId: "list-1",
        itemId: "item-1",
        bgColor: "bg-red-50",
        persist,
      });

      expect(nextLists[0].items[0].bgColor).toBe("bg-red-50");
      expect(persist).toHaveBeenCalledWith(nextLists);
    });

    it("bgColor を undefined に戻したら永続化する", () => {
      const listWithColor: TodoList = {
        ...baseList,
        items: [
          { ...baseList.items[0], bgColor: "bg-red-50" },
          baseList.items[1],
        ],
      };
      const persist = jest.fn();

      const nextLists = updateTodoItemBgColorAndPersist({
        lists: [listWithColor],
        listId: "list-1",
        itemId: "item-1",
        bgColor: undefined,
        persist,
      });

      expect(nextLists[0].items[0].bgColor).toBeUndefined();
      expect(persist).toHaveBeenCalledWith(nextLists);
    });

    it("対象外のアイテムには影響を与えない", () => {
      const persist = jest.fn();

      const nextLists = updateTodoItemBgColorAndPersist({
        lists: [baseList],
        listId: "list-1",
        itemId: "item-1",
        bgColor: "bg-green-50",
        persist,
      });

      expect(nextLists[0].items[1].bgColor).toBeUndefined();
    });

    it("対象外のリストには影響を与えない", () => {
      const otherList: TodoList = {
        ...baseList,
        id: "list-2",
        items: [{ ...baseList.items[0], id: "item-3" }],
      };
      const persist = jest.fn();

      const nextLists = updateTodoItemBgColorAndPersist({
        lists: [baseList, otherList],
        listId: "list-1",
        itemId: "item-1",
        bgColor: "bg-blue-50",
        persist,
      });

      expect(nextLists[1].items[0].bgColor).toBeUndefined();
    });

    it("更新されたリストを返す", () => {
      const persist = jest.fn();

      const result = updateTodoItemBgColorAndPersist({
        lists: [baseList],
        listId: "list-1",
        itemId: "item-1",
        bgColor: "bg-yellow-50",
        persist,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("list-1");
    });
  });

  describe("updateAllTodoItemsBgColorAndPersist", () => {
    it("全アイテムの bgColor を一括更新して永続化する", () => {
      const persist = jest.fn();

      const nextLists = updateAllTodoItemsBgColorAndPersist({
        lists: [baseList],
        listId: "list-1",
        bgColor: "bg-yellow-50",
        persist,
      });

      expect(
        nextLists[0].items.every((item) => item.bgColor === "bg-yellow-50"),
      ).toBe(true);
      expect(persist).toHaveBeenCalledWith(nextLists);
    });

    it("全アイテムの bgColor を undefined にリセットして永続化する", () => {
      const coloredList: TodoList = {
        ...baseList,
        items: baseList.items.map((item) => ({
          ...item,
          bgColor: "bg-blue-50",
        })),
      };
      const persist = jest.fn();

      const nextLists = updateAllTodoItemsBgColorAndPersist({
        lists: [coloredList],
        listId: "list-1",
        bgColor: undefined,
        persist,
      });

      expect(
        nextLists[0].items.every((item) => item.bgColor === undefined),
      ).toBe(true);
      expect(persist).toHaveBeenCalledWith(nextLists);
    });

    it("対象外のリストには影響を与えない", () => {
      const otherList: TodoList = {
        ...baseList,
        id: "list-2",
        items: [
          { ...baseList.items[0], id: "item-3", bgColor: "bg-orange-50" },
        ],
      };
      const persist = jest.fn();

      const nextLists = updateAllTodoItemsBgColorAndPersist({
        lists: [baseList, otherList],
        listId: "list-1",
        bgColor: "bg-yellow-50",
        persist,
      });

      expect(nextLists[1].items[0].bgColor).toBe("bg-orange-50");
    });

    it("更新されたリストを返す", () => {
      const persist = jest.fn();

      const result = updateAllTodoItemsBgColorAndPersist({
        lists: [baseList],
        listId: "list-1",
        bgColor: "bg-pink-50",
        persist,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("list-1");
    });
  });
});
