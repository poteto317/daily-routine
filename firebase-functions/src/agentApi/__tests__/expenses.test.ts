/** @jest-environment node */
import { expenseOperations } from "../operations/expenses";
import type { OperationContext } from "../operations/types";

const NOW = new Date("2026-10-03T00:30:00.000Z"); // JST 09:30

const context = (
  overrides: Partial<OperationContext> = {},
): OperationContext => ({
  data: {},
  query: {},
  body: {},
  now: NOW,
  ...overrides,
});

const categories = [
  {
    id: "budget-category-1",
    name: "食費",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

const expense = {
  id: "expense-1",
  date: "2026-10-01",
  amount: 500,
  categoryId: "budget-category-1",
  createdAt: "2026-10-01T03:00:00.000Z",
  usedTime: "12:00",
};

const dataWith = (expenses: Record<string, unknown[]>) => ({
  budgetCategories: categories,
  budgetData: { expenses, extra: "keep" },
});

describe("expenseOperations.list", () => {
  it("month 指定でその月のみ、省略で全月を返す", () => {
    const data = dataWith({
      "2026-10": [expense],
      "2026-09": [{ ...expense, id: "expense-0", date: "2026-09-30" }],
    });
    expect(
      (
        expenseOperations.list(context({ data, query: { month: "2026-10" } }))
          .body as { expenses: unknown[] }
      ).expenses,
    ).toEqual([expense]);
    expect(
      (
        expenseOperations.list(context({ data })).body as {
          expenses: unknown[];
        }
      ).expenses,
    ).toHaveLength(2);
  });

  it("budgetData 未設定でも空配列を返す", () => {
    expect(expenseOperations.list(context())).toEqual({
      status: 200,
      body: { expenses: [] },
    });
  });

  it("month が不正なら 400", () => {
    expect(() =>
      expenseOperations.list(context({ query: { month: "2026-1" } })),
    ).toThrow(expect.objectContaining({ status: 400, code: "invalid_query" }));
  });
});

describe("expenseOperations.create", () => {
  it("月バケットに追記し、usedTime 省略時は JST の現在時刻を入れる", () => {
    const outcome = expenseOperations.create(
      context({
        data: dataWith({ "2026-10": [expense] }),
        body: {
          date: "2026-10-03",
          amount: 1200,
          categoryId: "budget-category-1",
        },
      }),
    );
    expect(outcome.status).toBe(201);
    const created = (outcome.body as { expense: Record<string, unknown> })
      .expense;
    expect(created).toMatchObject({
      date: "2026-10-03",
      amount: 1200,
      categoryId: "budget-category-1",
      usedTime: "09:30",
      createdAt: NOW.toISOString(),
    });
    expect(created.id).toMatch(/^expense-\d+-[a-z0-9]+$/);
    expect(outcome.changes).toEqual({
      budgetData: {
        expenses: { "2026-10": [expense, created] },
        extra: "keep",
      },
    });
  });

  it("categoryId 省略時はキー自体を持たない（undefined を作らない）", () => {
    const outcome = expenseOperations.create(
      context({ body: { date: "2026-10-03", amount: 100 } }),
    );
    const created = (outcome.body as { expense: Record<string, unknown> })
      .expense;
    expect("categoryId" in created).toBe(false);
  });

  it("存在しないカテゴリは 400、date / amount 欠落も 400", () => {
    expect(() =>
      expenseOperations.create(
        context({
          data: dataWith({}),
          body: { date: "2026-10-03", amount: 1, categoryId: "nope" },
        }),
      ),
    ).toThrow(expect.objectContaining({ status: 400 }));
    expect(() =>
      expenseOperations.create(context({ body: { amount: 1 } })),
    ).toThrow(expect.objectContaining({ status: 400 }));
    expect(() =>
      expenseOperations.create(context({ body: { date: "2026-10-03" } })),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });
});

describe("expenseOperations.update", () => {
  it("同じ月内の更新は並び順を保つ", () => {
    const other = { ...expense, id: "expense-2" };
    const outcome = expenseOperations.update(
      context({
        data: dataWith({ "2026-10": [expense, other] }),
        id: "expense-1",
        body: { amount: 700 },
      }),
    );
    expect(outcome.changes).toEqual({
      budgetData: {
        expenses: { "2026-10": [{ ...expense, amount: 700 }, other] },
        extra: "keep",
      },
    });
  });

  it("date で月が変わると月バケット間を移動する", () => {
    const outcome = expenseOperations.update(
      context({
        data: dataWith({ "2026-10": [expense] }),
        id: "expense-1",
        body: { date: "2026-11-02" },
      }),
    );
    expect(outcome.changes).toEqual({
      budgetData: {
        expenses: {
          "2026-10": [],
          "2026-11": [{ ...expense, date: "2026-11-02" }],
        },
        extra: "keep",
      },
    });
  });

  it("categoryId: null でカテゴリを解除する", () => {
    const outcome = expenseOperations.update(
      context({
        data: dataWith({ "2026-10": [expense] }),
        id: "expense-1",
        body: { categoryId: null },
      }),
    );
    const { categoryId, ...withoutCategory } = expense;
    void categoryId;
    expect(outcome.changes).toEqual({
      budgetData: { expenses: { "2026-10": [withoutCategory] }, extra: "keep" },
    });
  });

  it("存在しない ID は 404、空パッチは 400", () => {
    expect(() =>
      expenseOperations.update(
        context({ data: dataWith({}), id: "nope", body: { amount: 1 } }),
      ),
    ).toThrow(expect.objectContaining({ status: 404 }));
    expect(() =>
      expenseOperations.update(
        context({
          data: dataWith({ "2026-10": [expense] }),
          id: "expense-1",
          body: {},
        }),
      ),
    ).toThrow(expect.objectContaining({ code: "empty_patch" }));
  });
});

describe("expenseOperations.remove", () => {
  it("該当支出だけを除去する", () => {
    const other = { ...expense, id: "expense-2" };
    const outcome = expenseOperations.remove(
      context({
        data: dataWith({ "2026-10": [expense, other] }),
        id: "expense-1",
      }),
    );
    expect(outcome).toEqual({
      status: 200,
      body: { deleted: "expense-1" },
      changes: {
        budgetData: { expenses: { "2026-10": [other] }, extra: "keep" },
      },
    });
  });

  it("存在しない ID は 404", () => {
    expect(() =>
      expenseOperations.remove(context({ data: dataWith({}), id: "nope" })),
    ).toThrow(expect.objectContaining({ status: 404 }));
  });
});
