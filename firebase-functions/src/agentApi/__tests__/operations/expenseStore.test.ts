/** @jest-environment node */
import {
  addExpense,
  findExpense,
  listExpenses,
  readExpensesByMonth,
  removeExpense,
  replaceExpense,
  toBudgetDataChanges,
  toMonthKey,
} from "../../operations/expenses/expenseStore";
import type { Expense } from "../../operations/expenses/expenseTypes";

const expense = (overrides: Partial<Expense> = {}): Expense => ({
  id: "expense-1",
  date: "2026-10-01",
  amount: 500,
  categoryId: "budget-category-1",
  createdAt: "2026-10-01T03:00:00.000Z",
  usedTime: "12:00",
  ...overrides,
});

describe("readExpensesByMonth", () => {
  it("budgetData.expenses を返す", () => {
    const expenses = { "2026-10": [expense()] };
    expect(readExpensesByMonth({ budgetData: { expenses } })).toEqual(expenses);
  });

  it.each([
    {},
    { budgetData: null },
    { budgetData: [] },
    { budgetData: {} },
    { budgetData: { expenses: [] } },
    { budgetData: { expenses: "x" } },
  ])("未設定・型不正（%j）は空オブジェクト", (data) => {
    expect(readExpensesByMonth(data)).toEqual({});
  });
});

describe("toBudgetDataChanges", () => {
  it("budgetData の他のキーを保ったまま expenses を差し替える", () => {
    const data = { budgetData: { expenses: { old: [] }, extra: "keep" } };
    expect(toBudgetDataChanges(data, { "2026-10": [] })).toEqual({
      budgetData: { expenses: { "2026-10": [] }, extra: "keep" },
    });
  });

  it("budgetData が無ければ expenses だけを持つ", () => {
    expect(toBudgetDataChanges({}, {})).toEqual({
      budgetData: { expenses: {} },
    });
  });
});

describe("toMonthKey", () => {
  it("日付の先頭 7 文字を返す", () => {
    expect(toMonthKey("2026-10-03")).toBe("2026-10");
  });
});

describe("findExpense", () => {
  const expenses = {
    "2026-09": [expense({ id: "a", date: "2026-09-30" })],
    "2026-10": [expense({ id: "b" })],
  };

  it("全月を走査して月と支出を返す", () => {
    expect(findExpense(expenses, "b")).toEqual({
      month: "2026-10",
      expense: expenses["2026-10"][0],
    });
    expect(findExpense(expenses, "a")?.month).toBe("2026-09");
  });

  it("見つからない・ID 未指定は null", () => {
    expect(findExpense(expenses, "nope")).toBeNull();
    expect(findExpense(expenses, undefined)).toBeNull();
  });
});

describe("listExpenses", () => {
  const expenses = {
    "2026-09": [expense({ id: "a" })],
    "2026-10": [expense({ id: "b" }), expense({ id: "c" })],
  };

  it("month 指定でその月のみ、存在しない月は空", () => {
    expect(listExpenses(expenses, "2026-10").map((e) => e.id)).toEqual([
      "b",
      "c",
    ]);
    expect(listExpenses(expenses, "2026-01")).toEqual([]);
  });

  it("month 省略時は、保存されたキーの順に関わらず月の昇順で連結する", () => {
    const shuffled = {
      "2026-10": [expense({ id: "oct" })],
      "2025-12": [expense({ id: "dec" })],
      "2026-01": [expense({ id: "jan1" }), expense({ id: "jan2" })],
    };
    expect(listExpenses(shuffled, undefined).map((e) => e.id)).toEqual([
      "dec",
      "jan1",
      "jan2",
      "oct",
    ]);
  });

  it("month 省略で全月を月の順に連結する", () => {
    expect(listExpenses(expenses, undefined).map((e) => e.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});

describe("addExpense", () => {
  it("既存の月の末尾に追加する", () => {
    const existing = expense({ id: "a" });
    const added = expense({ id: "b" });
    expect(addExpense({ "2026-10": [existing] }, added)).toEqual({
      "2026-10": [existing, added],
    });
  });

  it("存在しない月は新しく作る", () => {
    const added = expense({ id: "b", date: "2026-11-02" });
    expect(addExpense({}, added)).toEqual({ "2026-11": [added] });
  });

  it("元のオブジェクトを変更しない", () => {
    const expenses = { "2026-10": [expense({ id: "a" })] };
    addExpense(expenses, expense({ id: "b" }));
    expect(expenses["2026-10"]).toHaveLength(1);
  });
});

describe("replaceExpense", () => {
  it("同じ月内は並び順を保って置き換える", () => {
    const first = expense({ id: "a" });
    const second = expense({ id: "b" });
    const updated = { ...first, amount: 999 };
    const expenses = { "2026-10": [first, second] };
    expect(
      replaceExpense(expenses, { month: "2026-10", expense: first }, updated),
    ).toEqual({ "2026-10": [updated, second] });
  });

  it("月をまたぐと旧月から除き、既存の新月の末尾へ追加する", () => {
    const moving = expense({ id: "a" });
    const resident = expense({ id: "b", date: "2026-11-01" });
    const updated = { ...moving, date: "2026-11-02" };
    const expenses = { "2026-10": [moving], "2026-11": [resident] };
    expect(
      replaceExpense(expenses, { month: "2026-10", expense: moving }, updated),
    ).toEqual({ "2026-10": [], "2026-11": [resident, updated] });
  });

  it("月をまたぐとき、存在しない新月は新しく作る", () => {
    const moving = expense({ id: "a" });
    const updated = { ...moving, date: "2026-12-02" };
    expect(
      replaceExpense(
        { "2026-10": [moving] },
        { month: "2026-10", expense: moving },
        updated,
      ),
    ).toEqual({ "2026-10": [], "2026-12": [updated] });
  });

  it("元のオブジェクトを変更しない", () => {
    const moving = expense({ id: "a" });
    const expenses = { "2026-10": [moving] };
    replaceExpense(
      expenses,
      { month: "2026-10", expense: moving },
      { ...moving, date: "2026-11-02" },
    );
    expect(expenses).toEqual({ "2026-10": [moving] });
  });
});

describe("removeExpense", () => {
  it("該当支出だけを除き、空になった月の配列は残す", () => {
    const only = expense({ id: "a" });
    expect(
      removeExpense({ "2026-10": [only] }, { month: "2026-10", expense: only }),
    ).toEqual({ "2026-10": [] });
  });

  it("他の支出と他の月は変更しない", () => {
    const target = expense({ id: "a" });
    const other = expense({ id: "b" });
    const otherMonth = [expense({ id: "c", date: "2026-09-01" })];
    expect(
      removeExpense(
        { "2026-10": [target, other], "2026-09": otherMonth },
        { month: "2026-10", expense: target },
      ),
    ).toEqual({ "2026-10": [other], "2026-09": otherMonth });
  });
});
