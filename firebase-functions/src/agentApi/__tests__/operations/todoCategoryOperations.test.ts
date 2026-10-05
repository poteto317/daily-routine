/** @jest-environment node */
import { ApiError } from "../../errors";
import { todoCategoryOperations } from "../../operations/todo/todoCategoryOperations";
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

describe("todoCategoryOperations", () => {
  const existing = [
    {
      id: "todo-category-1",
      name: "買い物",
      color: "bg-red-50" as const,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  it("list は既存配列を返し、未設定なら空配列", () => {
    expect(
      todoCategoryOperations.list(
        context({ data: { todoCategories: existing } }),
      ),
    ).toEqual({ status: 200, body: { categories: existing } });
    expect(todoCategoryOperations.list(context())).toEqual({
      status: 200,
      body: { categories: [] },
    });
  });

  it("create は ID と createdAt を採番し、color を任意で受け付ける", () => {
    const outcome = todoCategoryOperations.create(
      context({
        data: { todoCategories: existing },
        body: { name: " 仕事 ", color: "bg-blue-50" },
      }),
    );
    expect(outcome.status).toBe(201);
    const item = (outcome.body as { category: Record<string, unknown> })
      .category;
    expect(item.name).toBe("仕事");
    expect(item.color).toBe("bg-blue-50");
    expect(item.id).toMatch(/^todo-category-\d+-[a-z0-9]+$/);
    expect(item.createdAt).toBe(NOW.toISOString());
    expect(outcome.changes).toEqual({ todoCategories: [...existing, item] });
  });

  it("create で color: null が指定された場合は color プロパティを設定しない", () => {
    const outcome = todoCategoryOperations.create(
      context({
        data: { todoCategories: existing },
        body: { name: "無色", color: null },
      }),
    );
    expect(outcome.status).toBe(201);
    const item = (outcome.body as { category: Record<string, unknown> })
      .category;
    expect("color" in item).toBe(false);
  });

  it("create は空名・不正な color を 400 にする", () => {
    expect(() =>
      todoCategoryOperations.create(context({ body: { name: "  " } })),
    ).toThrow(ApiError);
    expect(() =>
      todoCategoryOperations.create(
        context({ body: { name: "a", color: "invalid-color" } }),
      ),
    ).toThrow(ApiError);
  });

  it("update は指定フィールドだけ変更し、id と createdAt は保持する", () => {
    const outcome = todoCategoryOperations.update(
      context({
        data: { todoCategories: existing },
        id: "todo-category-1",
        body: { name: "日用品" },
      }),
    );
    expect(outcome.status).toBe(200);
    expect(outcome.changes).toEqual({
      todoCategories: [{ ...existing[0], name: "日用品" }],
    });
  });

  it("update で color: null を指定すると color プロパティが削除される（色解除）", () => {
    const outcome = todoCategoryOperations.update(
      context({
        data: { todoCategories: existing },
        id: "todo-category-1",
        body: { color: null },
      }),
    );
    expect(outcome.status).toBe(200);
    const updated = (outcome.body as { category: Record<string, unknown> })
      .category;
    expect("color" in updated).toBe(false);
    expect(outcome.changes).toEqual({
      todoCategories: [{ id: "todo-category-1", name: "買い物", createdAt: "2026-01-01T00:00:00.000Z" }],
    });
  });

  it("update は存在しない ID を 404、空パッチを 400 にする", () => {
    expect(() =>
      todoCategoryOperations.update(
        context({
          data: { todoCategories: existing },
          id: "x",
          body: { name: "a" },
        }),
      ),
    ).toThrow(expect.objectContaining({ status: 404 }));
    expect(() =>
      todoCategoryOperations.update(
        context({
          data: { todoCategories: existing },
          id: "todo-category-1",
          body: {},
        }),
      ),
    ).toThrow(expect.objectContaining({ status: 400, code: "empty_patch" }));
  });

  it("remove は該当要素を除去し、存在しなければ 404", () => {
    const outcome = todoCategoryOperations.remove(
      context({
        data: { todoCategories: existing },
        id: "todo-category-1",
      }),
    );
    expect(outcome).toEqual({
      status: 200,
      body: { deleted: "todo-category-1" },
      changes: { todoCategories: [] },
    });
    expect(() =>
      todoCategoryOperations.remove(
        context({ data: { todoCategories: existing }, id: "nope" }),
      ),
    ).toThrow(expect.objectContaining({ status: 404 }));
  });
});
