import type { TodoList, TodoListItem } from "../types";
import { confirmAndDeleteTodoItem } from "../todoListConfirmDeleteActions";

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

describe("todoListConfirmDeleteActions", () => {
  describe("confirmAndDeleteTodoItem", () => {
    it("confirmDelete が false を返すと null を返す", () => {
      const lists = [createList({ items: [createItem()] })];

      const result = confirmAndDeleteTodoItem({
        lists,
        listId: "list-1",
        itemId: "item-1",
        message: "削除しますか？",
        confirmDelete: () => false,
      });

      expect(result).toBeNull();
    });

    it("confirmDelete が true を返すと対象アイテムを除いたリストを返す", () => {
      const lists = [
        createList({
          items: [createItem(), createItem({ id: "item-2", title: "Next" })],
        }),
      ];

      const result = confirmAndDeleteTodoItem({
        lists,
        listId: "list-1",
        itemId: "item-1",
        message: "削除しますか？",
        confirmDelete: () => true,
      });

      expect(result![0].items).toHaveLength(1);
      expect(result![0].items[0].id).toBe("item-2");
    });

    it("confirmDelete に渡されたメッセージが転送される", () => {
      const confirmDelete = jest.fn(() => false);
      const lists = [createList({ items: [createItem()] })];

      confirmAndDeleteTodoItem({
        lists,
        listId: "list-1",
        itemId: "item-1",
        message: "本当に削除しますか？",
        confirmDelete,
      });

      expect(confirmDelete).toHaveBeenCalledWith("本当に削除しますか？");
    });

    it("対象アイテムが1件のみの場合、削除後は items が空になる", () => {
      const lists = [createList({ items: [createItem()] })];

      const result = confirmAndDeleteTodoItem({
        lists,
        listId: "list-1",
        itemId: "item-1",
        message: "confirm",
        confirmDelete: () => true,
      });

      expect(result![0].items).toHaveLength(0);
    });

    it("対象外のリストは変更されない", () => {
      const lists = [
        createList({ id: "list-1", items: [createItem({ id: "item-1" })] }),
        createList({ id: "list-2", items: [createItem({ id: "item-2" })] }),
      ];

      const result = confirmAndDeleteTodoItem({
        lists,
        listId: "list-1",
        itemId: "item-1",
        message: "confirm",
        confirmDelete: () => true,
      });

      expect(result![1].items).toHaveLength(1);
      expect(result![1].items[0].id).toBe("item-2");
    });
  });
});
