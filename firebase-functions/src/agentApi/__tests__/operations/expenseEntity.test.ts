/** @jest-environment node */
import {
  applyExpensePatch,
  createExpense,
} from "../../operations/expenses/expenseEntity";
import type { Expense } from "../../operations/expenses/expenseTypes";

const NOW = new Date("2026-10-03T00:30:00.000Z"); // JST 09:30

describe("createExpense", () => {
  it("id と createdAt を採番し、入力値を引き継ぐ", () => {
    const expense = createExpense(
      {
        date: "2026-10-03",
        amount: 1200,
        categoryId: "budget-category-1",
        usedTime: "08:15",
      },
      NOW,
    );
    expect(expense).toMatchObject({
      date: "2026-10-03",
      amount: 1200,
      categoryId: "budget-category-1",
      usedTime: "08:15",
      createdAt: NOW.toISOString(),
    });
    expect(expense.id).toMatch(/^expense-\d+-[a-z0-9]+$/);
  });

  it("usedTime 未指定なら JST の現在時刻を入れる", () => {
    expect(createExpense({ date: "2026-10-03", amount: 1 }, NOW).usedTime).toBe(
      "09:30",
    );
  });

  it("categoryId 未指定のときはキー自体を持たない（undefined を作らない）", () => {
    const expense = createExpense(
      { date: "2026-10-03", amount: 1, categoryId: undefined },
      NOW,
    );
    expect("categoryId" in expense).toBe(false);
  });

  it("呼び出しごとに異なる id を返す", () => {
    const input = { date: "2026-10-03", amount: 1 };
    expect(createExpense(input, NOW).id).not.toBe(createExpense(input, NOW).id);
  });
});

describe("applyExpensePatch", () => {
  const existing: Expense = {
    id: "expense-1",
    date: "2026-10-01",
    amount: 500,
    categoryId: "budget-category-1",
    createdAt: "2026-10-01T03:00:00.000Z",
    usedTime: "12:00",
  };

  it("パッチのフィールドだけを上書きし、id と createdAt は保持する", () => {
    expect(
      applyExpensePatch(existing, {
        patch: { amount: 700 },
        clearCategory: false,
      }),
    ).toEqual({ ...existing, amount: 700 });
  });

  it("clearCategory ならカテゴリを解除する", () => {
    const updated = applyExpensePatch(existing, {
      patch: {},
      clearCategory: true,
    });
    expect("categoryId" in updated).toBe(false);
    expect(updated.amount).toBe(500);
  });

  it("パッチと clearCategory が同時でもカテゴリは解除される", () => {
    const updated = applyExpensePatch(existing, {
      patch: { amount: 1 },
      clearCategory: true,
    });
    expect(updated.amount).toBe(1);
    expect("categoryId" in updated).toBe(false);
  });

  it("元の支出を変更しない", () => {
    const before = { ...existing };
    applyExpensePatch(existing, { patch: { amount: 1 }, clearCategory: true });
    expect(existing).toEqual(before);
  });
});
