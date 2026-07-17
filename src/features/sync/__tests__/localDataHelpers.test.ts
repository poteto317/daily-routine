import { hasAnyLocalSyncData } from "../sync/localDataHelpers";

const emptyData = {
  routines: [],
  dailyProgress: null,
  dailyHistory: {},
  pomodoroHistory: {},
  workSessionHistory: {},
  workTemplates: [],
  weightHistory: {},
  journalHistory: {},
  budgetData: { expenses: {} },
  budgetCategories: [],
  budgetIncomeItems: [],
  budgetExpenseItems: [],
  mealHistory: {},
  presets: [],
  todoLists: [],
};

describe("hasAnyLocalSyncData", () => {
  it("全て空の場合はfalseを返す", () => {
    expect(hasAnyLocalSyncData(emptyData)).toBe(false);
  });

  it("budgetCategoriesが1件でもあればtrueを返す", () => {
    expect(
      hasAnyLocalSyncData({
        ...emptyData,
        budgetCategories: [
          { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
        ],
      }),
    ).toBe(true);
  });

  it("routinesが1件でもあればtrueを返す", () => {
    expect(
      hasAnyLocalSyncData({ ...emptyData, routines: [{ id: "r1" }] }),
    ).toBe(true);
  });

  it("budgetIncomeItemsが1件でもあればtrueを返す", () => {
    expect(
      hasAnyLocalSyncData({
        ...emptyData,
        budgetIncomeItems: [
          { id: "income-1", name: "給与", amount: 300000, createdAt: "2026-05-01T00:00:00.000Z" },
        ],
      }),
    ).toBe(true);
  });

  it("budgetExpenseItemsが1件でもあればtrueを返す", () => {
    expect(
      hasAnyLocalSyncData({
        ...emptyData,
        budgetExpenseItems: [
          {
            id: "expense-1",
            name: "家賃",
            amount: 80000,
            kind: "fixed",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
      }),
    ).toBe(true);
  });
});
