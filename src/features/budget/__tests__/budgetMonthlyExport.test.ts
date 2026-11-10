import type { BudgetCategory, Expense } from "@/types/routine";
import {
  buildBudgetMonthlyExport,
  getBudgetMonthlyExportFileName,
} from "../budgetMonthlyExport";

const expense = (overrides: Partial<Expense> = {}): Expense => ({
  id: "e1",
  date: "2026-11-01",
  amount: 1000,
  categoryId: "food",
  createdAt: "2026-10-31T15:01:00.000Z",
  usedTime: "00:01",
  ...overrides,
});
const categories: BudgetCategory[] = [
  { id: "food", name: '食費, "昼"\n夜', createdAt: "2026-01-01T00:00:00Z" },
  { id: "other", name: "他月のみ", createdAt: "2026-01-01T00:00:00Z" },
];

describe("月別家計簿 JSON", () => {
  it("対象月の最初・最後の日のみを元の順序と全フィールドのまま含める", () => {
    const first = expense();
    const last = expense({
      id: "last",
      date: "2026-11-30",
      amount: 0,
      categoryId: undefined,
      usedTime: undefined,
    });
    const expenses = [
      first,
      expense({ date: "2026-10-31", categoryId: "other" }),
      last,
      expense({ date: "2026-12-01" }),
    ];
    const before = JSON.stringify({ expenses, categories });
    const data = buildBudgetMonthlyExport("2026-11", expenses, categories);
    expect(data).toEqual({
      budgetData: { expenses: { "2026-11": [first, last] } },
      budgetCategories: [categories[0]],
    });
    expect(JSON.stringify({ expenses, categories })).toBe(before);
    expect(
      JSON.parse(JSON.stringify(data)).budgetData.expenses["2026-11"],
    ).toEqual(JSON.parse(JSON.stringify([first, last])));
  });

  it("削除済み・未選択カテゴリや0円の支出も落とさない", () => {
    const expenses = [
      expense({ categoryId: "deleted" }),
      expense({ id: "zero", amount: 0, categoryId: undefined }),
    ];
    expect(buildBudgetMonthlyExport("2026-11", expenses, categories)).toEqual({
      budgetData: { expenses: { "2026-11": expenses } },
      budgetCategories: [],
    });
  });

  it("同じカテゴリの支出が複数あってもカテゴリは重複せず、文字をそのまま保持する", () => {
    expect(
      buildBudgetMonthlyExport(
        "2026-11",
        [expense(), expense({ id: "e2" })],
        categories,
      ).budgetCategories,
    ).toEqual([categories[0]]);
  });

  it("空月は空配列を持つ対象月だけを出力する", () => {
    expect(
      buildBudgetMonthlyExport("2026-12", [expense()], categories),
    ).toEqual({
      budgetData: { expenses: { "2026-12": [] } },
      budgetCategories: [],
    });
  });

  it("対象月を含むファイル名にする", () => {
    expect(getBudgetMonthlyExportFileName("2026-11")).toBe(
      "daily-routine-budget-2026-11.json",
    );
    expect(getBudgetMonthlyExportFileName("2027-01")).toBe(
      "daily-routine-budget-2027-01.json",
    );
  });
});
