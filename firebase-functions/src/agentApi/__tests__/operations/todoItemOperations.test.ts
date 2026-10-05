/** @jest-environment node */
import { todoItemOperations } from "../../operations/todo/todoItemOperations";
import type { TodoItem, TodoList } from "../../operations/todo/todoTypes";
import type { OperationContext } from "../../operations/types";

const NOW = new Date("2026-10-05T00:00:00.000Z");

const context = (
  overrides: Partial<OperationContext> = {},
): OperationContext => ({
  data: {},
  query: {},
  body: {},
  now: NOW,
  ...overrides,
});

describe("todoItemOperations", () => {
  const existingList = {
    id: "todo-list-1",
    title: "買い物",
    items: [
      {
        id: "item-1",
        title: "牛乳",
        isCompleted: false,
        createdAt: "2026-10-01T00:00:00.000Z",
      },
      {
        id: "item-2",
        title: "卵",
        isCompleted: true,
        createdAt: "2026-10-01T00:00:00.000Z",
      },
    ],
    defaultItemBgColor: "bg-blue-50" as const,
    addItemPosition: "last" as const,
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
  };

  const initialData = {
    todoLists: [existingList],
    todoCategories: [
      {
        id: "cat-1",
        name: "食品",
        createdAt: "2026-10-01T00:00:00.000Z",
      },
    ],
  };

  describe("list", () => {
    it("listId クエリ必須で、アイテムにインデックスを付与して返す", () => {
      const outcome = todoItemOperations.list(
        context({
          data: initialData,
          query: { listId: "todo-list-1" },
        }),
      );
      expect(outcome.status).toBe(200);
      expect(outcome.body).toEqual({
        listId: "todo-list-1",
        items: [
          { ...existingList.items[0], index: 0 },
          { ...existingList.items[1], index: 1 },
        ],
      });
    });

    it("listId がない場合は 400", () => {
      expect(() =>
        todoItemOperations.list(context({ data: initialData })),
      ).toThrow(expect.objectContaining({ status: 400, code: "invalid_query" }));
    });

    it("存在しない listId の場合は 404", () => {
      expect(() =>
        todoItemOperations.list(
          context({
            data: initialData,
            query: { listId: "unknown-list" },
          }),
        ),
      ).toThrow(expect.objectContaining({ status: 404 }));
    });
  });

  describe("create", () => {
    it("アイテムを作成し、リストの defaultItemBgColor を継承する", () => {
      const outcome = todoItemOperations.create(
        context({
          data: initialData,
          body: {
            listId: "todo-list-1",
            title: "パン",
            categoryId: "cat-1",
            indent: 1,
          },
        }),
      );
      expect(outcome.status).toBe(201);
      const body = outcome.body as { item: TodoItem; index: number };
      expect(body.index).toBe(2);
      expect(body.item).toMatchObject({
        title: "パン",
        isCompleted: false,
        bgColor: "bg-blue-50",
        categoryId: "cat-1",
        indent: 1,
      });

      const updatedLists = outcome.changes?.todoLists as TodoList[];
      expect(updatedLists[0].items).toHaveLength(3);
      expect(updatedLists[0].updatedAt).toBe(NOW.toISOString());
    });

    it("insertAfterIndex で指定位置の直後に挿入できる", () => {
      const outcome = todoItemOperations.create(
        context({
          data: initialData,
          body: {
            listId: "todo-list-1",
            title: "食パン",
            insertAfterIndex: 0,
          },
        }),
      );
      expect(outcome.status).toBe(201);
      const body = outcome.body as { item: TodoItem; index: number };
      expect(body.index).toBe(1);
      const updatedLists = outcome.changes?.todoLists as TodoList[];
      expect(updatedLists[0].items[1].title).toBe("食パン");
    });

    it("存在しない categoryId を指定すると 400", () => {
      expect(() =>
        todoItemOperations.create(
          context({
            data: initialData,
            body: {
              listId: "todo-list-1",
              title: "パン",
              categoryId: "unknown-cat",
            },
          }),
        ),
      ).toThrow(expect.objectContaining({ status: 400, code: "invalid_field" }));
    });
  });

  describe("update", () => {
    it("アイテムの完了状態やタイトルを更新する", () => {
      const outcome = todoItemOperations.update(
        context({
          data: initialData,
          id: "item-1",
          body: {
            listId: "todo-list-1",
            title: "低脂肪乳",
            isCompleted: true,
          },
        }),
      );
      expect(outcome.status).toBe(200);
      const body = outcome.body as { item: TodoItem; index: number };
      expect(body.item.title).toBe("低脂肪乳");
      expect(body.item.isCompleted).toBe(true);

      const updatedLists = outcome.changes?.todoLists as TodoList[];
      expect(updatedLists[0].updatedAt).toBe(NOW.toISOString());
    });

    it("moveToIndex でアイテムを並び替えできる", () => {
      const outcome = todoItemOperations.update(
        context({
          data: initialData,
          id: "item-1",
          body: {
            listId: "todo-list-1",
            moveToIndex: 1,
          },
        }),
      );
      expect(outcome.status).toBe(200);
      const updatedLists = outcome.changes?.todoLists as TodoList[];
      expect(updatedLists[0].items[0].id).toBe("item-2");
      expect(updatedLists[0].items[1].id).toBe("item-1");
    });

    it("存在しない itemId の場合は 404", () => {
      expect(() =>
        todoItemOperations.update(
          context({
            data: initialData,
            id: "unknown-item",
            body: {
              listId: "todo-list-1",
              title: "テスト",
            },
          }),
        ),
      ).toThrow(expect.objectContaining({ status: 404 }));
    });

    it("存在しない categoryId への更新は 400", () => {
      expect(() =>
        todoItemOperations.update(
          context({
            data: initialData,
            id: "item-1",
            body: {
              listId: "todo-list-1",
              categoryId: "unknown-cat",
            },
          }),
        ),
      ).toThrow(expect.objectContaining({ status: 400, code: "invalid_field" }));
    });
  });

  describe("remove", () => {
    it("アイテムを削除し 200 を返す", () => {
      const outcome = todoItemOperations.remove(
        context({
          data: initialData,
          id: "item-1",
          query: { listId: "todo-list-1" },
        }),
      );
      expect(outcome.status).toBe(200);
      expect(outcome.body).toEqual({ deleted: "item-1" });
      const updatedLists = outcome.changes?.todoLists as TodoList[];
      expect(updatedLists[0].items).toHaveLength(1);
      expect(updatedLists[0].items[0].id).toBe("item-2");
      expect(updatedLists[0].updatedAt).toBe(NOW.toISOString());
    });

    it("query に listId がない場合は 400", () => {
      expect(() =>
        todoItemOperations.remove(
          context({
            data: initialData,
            id: "item-1",
          }),
        ),
      ).toThrow(expect.objectContaining({ status: 400, code: "invalid_query" }));
    });

    it("アイテムが存在しない場合は 404", () => {
      expect(() =>
        todoItemOperations.remove(
          context({
            data: initialData,
            id: "unknown-item",
            query: { listId: "todo-list-1" },
          }),
        ),
      ).toThrow(expect.objectContaining({ status: 404 }));
    });
  });
});
