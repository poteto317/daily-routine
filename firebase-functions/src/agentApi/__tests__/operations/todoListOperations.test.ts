/** @jest-environment node */
import { todoListOperations } from "../../operations/todo/todoListOperations";
import type { TodoList } from "../../operations/todo/todoTypes";
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

describe("todoListOperations", () => {
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
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
  };

  it("list は要約情報（件数付き・アイテム配列なし）の一覧を返す", () => {
    const outcome = todoListOperations.list(
      context({ data: { todoLists: [existingList] } }),
    );
    expect(outcome.status).toBe(200);
    expect(outcome.body).toEqual({
      lists: [
        {
          id: "todo-list-1",
          title: "買い物",
          itemCount: 2,
          completedCount: 1,
          createdAt: "2026-10-01T00:00:00.000Z",
          updatedAt: "2026-10-01T00:00:00.000Z",
        },
      ],
    });
  });

  it("create はリストを新規作成し 201 を返す", () => {
    const outcome = todoListOperations.create(
      context({
        data: { todoLists: [existingList] },
        body: {
          title: " 仕事 ",
          addItemPosition: "first",
          defaultItemBgColor: "bg-red-50",
          isHidden: true,
        },
      }),
    );
    expect(outcome.status).toBe(201);
    const body = outcome.body as { list: Record<string, unknown> };
    expect(body.list).toMatchObject({
      title: "仕事",
      addItemPosition: "first",
      defaultItemBgColor: "bg-red-50",
      isHidden: true,
      itemCount: 0,
      completedCount: 0,
    });
    expect(outcome.changes?.todoLists).toHaveLength(2);
  });

  it("update はリスト設定を更新し updatedAt を現在時刻にする", () => {
    const outcome = todoListOperations.update(
      context({
        data: { todoLists: [existingList] },
        id: "todo-list-1",
        body: {
          title: "週末の買い物",
          hideCompleted: true,
        },
      }),
    );
    expect(outcome.status).toBe(200);
    const body = outcome.body as { list: Record<string, unknown> };
    expect(body.list).toMatchObject({
      title: "週末の買い物",
      hideCompleted: true,
      updatedAt: NOW.toISOString(),
      itemCount: 2,
      completedCount: 1,
    });
    const updatedInDoc = (outcome.changes?.todoLists as TodoList[])[0];
    expect(updatedInDoc.items).toEqual(existingList.items);
  });

  it("update は存在しないリスト ID で 404", () => {
    expect(() =>
      todoListOperations.update(
        context({
          data: { todoLists: [existingList] },
          id: "non-existent",
          body: { title: "新タイトル" },
        }),
      ),
    ).toThrow(expect.objectContaining({ status: 404 }));
  });

  it("remove はリストを削除し 200 を返す", () => {
    const outcome = todoListOperations.remove(
      context({
        data: { todoLists: [existingList] },
        id: "todo-list-1",
      }),
    );
    expect(outcome.status).toBe(200);
    expect(outcome.body).toEqual({ deleted: "todo-list-1" });
    expect(outcome.changes?.todoLists).toEqual([]);
  });

  it("remove は存在しないリスト ID で 404", () => {
    expect(() =>
      todoListOperations.remove(
        context({
          data: { todoLists: [existingList] },
          id: "non-existent",
        }),
      ),
    ).toThrow(expect.objectContaining({ status: 404 }));
  });
});
