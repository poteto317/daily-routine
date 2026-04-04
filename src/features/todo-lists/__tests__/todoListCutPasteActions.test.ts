import type { TodoList, TodoListItem } from "../types";
import {
  cutTodoItemsFromLists,
  pasteTodoItemsToLists,
} from "../todoListCutPasteActions";

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

describe("todoListCutPasteActions", () => {
  describe("cutTodoItemsFromLists", () => {
    it("指定 ID のアイテムを切り取って返す", () => {
      const items = [
        createItem({ id: "a", title: "A" }),
        createItem({ id: "b", title: "B" }),
      ];
      const lists = [createList({ items })];

      const { updatedLists, cutItems } = cutTodoItemsFromLists({
        lists,
        listId: "list-1",
        itemIds: new Set(["a"]),
      });

      expect(cutItems).toHaveLength(1);
      expect(cutItems[0].id).toBe("a");
      expect(updatedLists[0].items).toHaveLength(1);
      expect(updatedLists[0].items[0].id).toBe("b");
    });

    it("複数アイテムを一度に切り取れる", () => {
      const items = [
        createItem({ id: "a" }),
        createItem({ id: "b" }),
        createItem({ id: "c" }),
      ];
      const lists = [createList({ items })];

      const { updatedLists, cutItems } = cutTodoItemsFromLists({
        lists,
        listId: "list-1",
        itemIds: new Set(["a", "c"]),
      });

      expect(cutItems).toHaveLength(2);
      expect(updatedLists[0].items.map((i) => i.id)).toEqual(["b"]);
    });

    it("存在しない itemId を指定しても他のアイテムに影響しない", () => {
      const items = [createItem({ id: "a" })];
      const lists = [createList({ items })];

      const { updatedLists, cutItems } = cutTodoItemsFromLists({
        lists,
        listId: "list-1",
        itemIds: new Set(["no-such-id"]),
      });

      expect(cutItems).toHaveLength(0);
      expect(updatedLists[0].items).toHaveLength(1);
    });

    it("対象外のリストは変更しない", () => {
      const lists = [
        createList({ id: "list-1", items: [createItem({ id: "a" })] }),
        createList({ id: "list-2", items: [createItem({ id: "b" })] }),
      ];

      const { updatedLists } = cutTodoItemsFromLists({
        lists,
        listId: "list-1",
        itemIds: new Set(["a"]),
      });

      expect(updatedLists[1].items).toHaveLength(1);
    });
  });

  describe("pasteTodoItemsToLists", () => {
    it("アイテムをリストの末尾に貼り付ける", () => {
      const existing = createItem({ id: "existing", title: "Existing" });
      const lists = [createList({ items: [existing] })];
      const toPaste = [createItem({ id: "pasted", title: "Pasted" })];

      const result = pasteTodoItemsToLists({
        lists,
        listId: "list-1",
        items: toPaste,
      });

      expect(result[0].items).toHaveLength(2);
      expect(result[0].items[1].id).toBe("pasted");
    });

    it("空リストへも貼り付けられる", () => {
      const lists = [createList({ items: [] })];
      const toPaste = [createItem({ id: "new" })];

      const result = pasteTodoItemsToLists({
        lists,
        listId: "list-1",
        items: toPaste,
      });

      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].id).toBe("new");
    });

    it("複数アイテムを貼り付けると順序を維持する", () => {
      const lists = [createList({ items: [] })];
      const toPaste = [
        createItem({ id: "x", title: "X" }),
        createItem({ id: "y", title: "Y" }),
      ];

      const result = pasteTodoItemsToLists({
        lists,
        listId: "list-1",
        items: toPaste,
      });

      expect(result[0].items.map((i) => i.id)).toEqual(["x", "y"]);
    });

    it("対象外のリストは変更しない", () => {
      const lists = [
        createList({ id: "list-1", items: [] }),
        createList({ id: "list-2", items: [createItem({ id: "original" })] }),
      ];

      const result = pasteTodoItemsToLists({
        lists,
        listId: "list-1",
        items: [createItem({ id: "new" })],
      });

      expect(result[1].items).toHaveLength(1);
      expect(result[1].items[0].id).toBe("original");
    });
  });
});
