import {
  reorderTodoItemsInLists,
  updateTodoItemTitleInLists,
} from "../todoItemDetailActions";
import type { TodoList, TodoListItem } from "../types";

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

describe("todoItemDetailActions", () => {
  describe("reorderTodoItemsInLists", () => {
    it("アイテムを移動する", () => {
      const listWithItems = createList({
        items: [
          createItem({ id: "a", title: "A" }),
          createItem({ id: "b", title: "B" }),
          createItem({ id: "c", title: "C" }),
        ],
      });

      const result = reorderTodoItemsInLists({
        lists: [listWithItems],
        listId: "list-1",
        fromIndex: 0,
        toIndex: 2,
      });

      expect(result[0].items.map((i) => i.id)).toEqual(["b", "c", "a"]);
    });

    it("子要素を持つ親アイテムを移動すると子も追従する", () => {
      const listWithNested = createList({
        items: [
          createItem({ id: "parent", title: "Parent" }),
          createItem({ id: "child", title: "Child", indent: 1 }),
          createItem({ id: "sibling", title: "Sibling" }),
        ],
      });

      const result = reorderTodoItemsInLists({
        lists: [listWithNested],
        listId: "list-1",
        fromIndex: 0,
        toIndex: 2,
      });

      expect(result[0].items.map((i) => i.id)).toEqual([
        "sibling",
        "parent",
        "child",
      ]);
    });

    it("対象リストのみ変更し他のリストは変更しない", () => {
      const list1 = createList({
        id: "list-1",
        items: [
          createItem({ id: "a", title: "A" }),
          createItem({ id: "b", title: "B" }),
        ],
      });
      const list2 = createList({ id: "list-2", title: "Other" });

      const result = reorderTodoItemsInLists({
        lists: [list1, list2],
        listId: "list-1",
        fromIndex: 0,
        toIndex: 1,
      });

      expect(result[1]).toBe(list2);
    });
  });

  describe("updateTodoItemTitleInLists", () => {
    it("指定アイテムのタイトルを更新する", () => {
      const listWithItems = createList({
        items: [
          createItem({ id: "item-1", title: "Old" }),
          createItem({ id: "item-2", title: "Keep" }),
        ],
      });

      const result = updateTodoItemTitleInLists({
        lists: [listWithItems],
        listId: "list-1",
        itemId: "item-1",
        title: "New",
      });

      expect(result[0].items[0].title).toBe("New");
    });

    it("対象アイテム以外のタイトルを変更しない", () => {
      const listWithItems = createList({
        items: [
          createItem({ id: "item-1", title: "Old" }),
          createItem({ id: "item-2", title: "Keep" }),
        ],
      });

      const result = updateTodoItemTitleInLists({
        lists: [listWithItems],
        listId: "list-1",
        itemId: "item-1",
        title: "New",
      });

      expect(result[0].items[1].title).toBe("Keep");
    });
  });
});
