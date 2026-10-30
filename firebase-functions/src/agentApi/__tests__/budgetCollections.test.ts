/** @jest-environment node */
import { ApiError } from "../errors";
import {
  categoryOperations,
  expenseItemOperations,
  incomeItemOperations,
} from "../operations/budgetCollections";
import type { OperationContext } from "../operations/types";

const NOW = new Date("2026-10-03T00:00:00.000Z");

const context = (
  overrides: Partial<OperationContext> = {},
): OperationContext => ({
  data: {},
  query: {},
  body: {},
  now: NOW,
  ...overrides,
});

describe("categoryOperations", () => {
  const existing = [
    {
      id: "budget-category-1",
      name: "食費",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  it("list は既存配列を返し、未設定なら空配列", () => {
    expect(
      categoryOperations.list(
        context({ data: { budgetCategories: existing } }),
      ),
    ).toEqual({ status: 200, body: { categories: existing } });
    expect(categoryOperations.list(context())).toEqual({
      status: 200,
      body: { categories: [] },
    });
  });

  it("create は ID と createdAt を採番し、changes に追記後の配列を入れる", () => {
    const outcome = categoryOperations.create(
      context({
        data: { budgetCategories: existing },
        body: { name: " 交通費 " },
      }),
    );
    expect(outcome.status).toBe(201);
    const item = (outcome.body as { category: Record<string, unknown> })
      .category;
    expect(item.name).toBe("交通費");
    expect(item.id).toMatch(/^budget-category-\d+-[a-z0-9]+$/);
    expect(item.createdAt).toBe(NOW.toISOString());
    expect(outcome.changes).toEqual({ budgetCategories: [...existing, item] });
  });

  it("create は空名・未知キーを 400 にする", () => {
    expect(() =>
      categoryOperations.create(context({ body: { name: "  " } })),
    ).toThrow(ApiError);
    expect(() =>
      categoryOperations.create(context({ body: { name: "a", extra: 1 } })),
    ).toThrow(ApiError);
    expect(() => categoryOperations.create(context({ body: {} }))).toThrow(
      ApiError,
    );
  });

  it("update は指定フィールドだけ変更し、id と createdAt は保持する", () => {
    const outcome = categoryOperations.update(
      context({
        data: { budgetCategories: existing },
        id: "budget-category-1",
        body: { name: "外食" },
      }),
    );
    expect(outcome.status).toBe(200);
    expect(outcome.changes).toEqual({
      budgetCategories: [{ ...existing[0], name: "外食" }],
    });
  });

  it("update は存在しない ID を 404、空パッチを 400 にする", () => {
    expect(() =>
      categoryOperations.update(
        context({
          data: { budgetCategories: existing },
          id: "x",
          body: { name: "a" },
        }),
      ),
    ).toThrow(expect.objectContaining({ status: 404 }));
    expect(() =>
      categoryOperations.update(
        context({
          data: { budgetCategories: existing },
          id: "budget-category-1",
          body: {},
        }),
      ),
    ).toThrow(expect.objectContaining({ status: 400, code: "empty_patch" }));
  });

  it("remove は該当要素を除去し、存在しなければ 404", () => {
    const outcome = categoryOperations.remove(
      context({
        data: { budgetCategories: existing },
        id: "budget-category-1",
      }),
    );
    expect(outcome).toEqual({
      status: 200,
      body: { deleted: "budget-category-1" },
      changes: { budgetCategories: [] },
    });
    expect(() =>
      categoryOperations.remove(
        context({ data: { budgetCategories: existing }, id: "nope" }),
      ),
    ).toThrow(expect.objectContaining({ status: 404 }));
  });
});

describe("incomeItemOperations", () => {
  it("name と amount を必須とする", () => {
    const outcome = incomeItemOperations.create(
      context({ body: { name: "給与", amount: 300000 } }),
    );
    const item = (outcome.body as { incomeItem: Record<string, unknown> })
      .incomeItem;
    expect(item).toMatchObject({ name: "給与", amount: 300000 });
    expect(outcome.changes).toEqual({ budgetIncomeItems: [item] });
    expect(() =>
      incomeItemOperations.create(context({ body: { name: "給与" } })),
    ).toThrow(ApiError);
  });

  describe("update", () => {
    const existing = {
      id: "budget-income-item-1",
      name: "給与",
      amount: 300000,
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const update = (body: Record<string, unknown>) =>
      incomeItemOperations.update(
        context({
          data: { budgetIncomeItems: [existing] },
          id: existing.id,
          body,
        }),
      );

    it("name と amount をそれぞれ単独で変更できる", () => {
      expect(update({ name: "賞与" }).changes).toEqual({
        budgetIncomeItems: [{ ...existing, name: "賞与" }],
      });
      expect(update({ amount: 310000 }).changes).toEqual({
        budgetIncomeItems: [{ ...existing, amount: 310000 }],
      });
    });

    it("空のボディは 400 empty_patch", () => {
      expect(() => update({})).toThrow(
        expect.objectContaining({ status: 400, code: "empty_patch" }),
      );
    });

    it("許可されていないキーは 400", () => {
      expect(() => update({ kind: "fixed" })).toThrow(
        expect.objectContaining({ status: 400 }),
      );
    });

    it("空文字の name は 400", () => {
      expect(() => update({ name: "" })).toThrow(
        expect.objectContaining({ status: 400 }),
      );
    });
  });
});

describe("expenseItemOperations", () => {
  it("kind は fixed / variable のみ", () => {
    const outcome = expenseItemOperations.create(
      context({ body: { name: "家賃", amount: 80000, kind: "fixed" } }),
    );
    expect(outcome.changes).toEqual({
      budgetExpenseItems: [
        expect.objectContaining({ name: "家賃", amount: 80000, kind: "fixed" }),
      ],
    });
    expect(() =>
      expenseItemOperations.create(
        context({ body: { name: "家賃", amount: 80000, kind: "other" } }),
      ),
    ).toThrow(ApiError);
  });

  it("update で amount だけ変更できる", () => {
    const existing = {
      id: "budget-expense-item-1",
      name: "家賃",
      amount: 80000,
      kind: "fixed",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const outcome = expenseItemOperations.update(
      context({
        data: { budgetExpenseItems: [existing] },
        id: existing.id,
        body: { amount: 82000 },
      }),
    );
    expect(outcome.changes).toEqual({
      budgetExpenseItems: [{ ...existing, amount: 82000 }],
    });
  });

  it("update でも kind は fixed / variable のみ", () => {
    const existing = {
      id: "budget-expense-item-1",
      name: "家賃",
      amount: 80000,
      kind: "fixed",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const update = (kind: string) =>
      expenseItemOperations.update(
        context({
          data: { budgetExpenseItems: [existing] },
          id: existing.id,
          body: { kind },
        }),
      );

    expect(update("variable").changes).toEqual({
      budgetExpenseItems: [{ ...existing, kind: "variable" }],
    });
    expect(() => update("other")).toThrow(
      expect.objectContaining({ status: 400 }),
    );
  });
});
