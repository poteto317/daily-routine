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
  budgetData: { budgets: {}, expenses: {} },
  budgetCategories: [],
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
});
