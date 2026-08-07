import {
  collectBudgetSyncData,
  hasBudgetSyncData,
  normalizeBudgetSyncData,
  saveBudgetSyncData,
} from "../sync/budgetSyncData";
import {
  budgetCategoryFixture,
  budgetExpenseItemFixture,
  budgetIncomeItemFixture,
} from "./sync.test.fixtures";
import * as budgetStorage from "@/features/budget/storage";

jest.mock("@/features/budget/storage", () => ({
  getBudgetData: jest.fn(() => ({ expenses: {} })),
  saveBudgetData: jest.fn(),
  getBudgetCategories: jest.fn(() => []),
  saveBudgetCategories: jest.fn(),
  getBudgetIncomeItems: jest.fn(() => []),
  saveBudgetIncomeItems: jest.fn(),
  getBudgetExpenseItems: jest.fn(() => []),
  saveBudgetExpenseItems: jest.fn(),
}));

const budgetDataFixture = {
  expenses: {
    "2026-02": [
      {
        id: "expense-record-1",
        date: "2026-02-12",
        amount: 1200,
        createdAt: "2026-02-12T00:00:00.000Z",
      },
    ],
  },
};

describe("budgetSyncData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (budgetStorage.getBudgetData as jest.Mock).mockReturnValue({
      expenses: {},
    });
    (budgetStorage.getBudgetCategories as jest.Mock).mockReturnValue([]);
    (budgetStorage.getBudgetIncomeItems as jest.Mock).mockReturnValue([]);
    (budgetStorage.getBudgetExpenseItems as jest.Mock).mockReturnValue([]);
  });

  it("予算データをまとめて収集する", () => {
    (budgetStorage.getBudgetData as jest.Mock).mockReturnValue(
      budgetDataFixture,
    );
    (budgetStorage.getBudgetCategories as jest.Mock).mockReturnValue([
      budgetCategoryFixture,
    ]);
    (budgetStorage.getBudgetIncomeItems as jest.Mock).mockReturnValue([
      budgetIncomeItemFixture,
    ]);
    (budgetStorage.getBudgetExpenseItems as jest.Mock).mockReturnValue([
      budgetExpenseItemFixture,
    ]);

    expect(collectBudgetSyncData()).toEqual({
      budgetData: budgetDataFixture,
      budgetCategories: [budgetCategoryFixture],
      budgetIncomeItems: [budgetIncomeItemFixture],
      budgetExpenseItems: [budgetExpenseItemFixture],
    });
  });

  it("予算データをまとめて保存する", () => {
    saveBudgetSyncData({
      budgetData: budgetDataFixture,
      budgetCategories: [budgetCategoryFixture],
      budgetIncomeItems: [budgetIncomeItemFixture],
      budgetExpenseItems: [budgetExpenseItemFixture],
    });

    expect(budgetStorage.saveBudgetData).toHaveBeenCalledWith(
      budgetDataFixture,
    );
    expect(budgetStorage.saveBudgetCategories).toHaveBeenCalledWith([
      budgetCategoryFixture,
    ]);
    expect(budgetStorage.saveBudgetIncomeItems).toHaveBeenCalledWith([
      budgetIncomeItemFixture,
    ]);
    expect(budgetStorage.saveBudgetExpenseItems).toHaveBeenCalledWith([
      budgetExpenseItemFixture,
    ]);
  });

  it("欠損した予算データは既存のローカル値を保持する（本フィールド追加前のクラウドデータによる意図しない削除を防止）", () => {
    const localCategories = [{ id: "c1", name: "食費" }];
    (budgetStorage.getBudgetData as jest.Mock).mockReturnValue(budgetDataFixture);
    (budgetStorage.getBudgetCategories as jest.Mock).mockReturnValue(localCategories);

    expect(normalizeBudgetSyncData({})).toEqual({
      budgetData: budgetDataFixture,
      budgetCategories: localCategories,
      budgetIncomeItems: [],
      budgetExpenseItems: [],
    });
  });

  it("明示的に空の予算データはそのまま正規化する（ユーザーが全削除した結果を尊重する）", () => {
    (budgetStorage.getBudgetData as jest.Mock).mockReturnValue(budgetDataFixture);
    (budgetStorage.getBudgetCategories as jest.Mock).mockReturnValue([{ id: "c1" }]);

    expect(
      normalizeBudgetSyncData({
        budgetData: { expenses: {} },
        budgetCategories: [],
        budgetIncomeItems: [],
        budgetExpenseItems: [],
      }),
    ).toEqual({
      budgetData: { expenses: {} },
      budgetCategories: [],
      budgetIncomeItems: [],
      budgetExpenseItems: [],
    });
  });

  it("支出記録がある場合は同期対象ありと判定する", () => {
    expect(
      hasBudgetSyncData({
        budgetData: budgetDataFixture,
        budgetCategories: [],
        budgetIncomeItems: [],
        budgetExpenseItems: [],
      }),
    ).toBe(true);
  });

  it("カテゴリ・収入項目・支出項目のいずれかがある場合は同期対象ありと判定する", () => {
    expect(
      hasBudgetSyncData({
        budgetData: { expenses: {} },
        budgetCategories: [budgetCategoryFixture],
        budgetIncomeItems: [],
        budgetExpenseItems: [],
      }),
    ).toBe(true);
    expect(
      hasBudgetSyncData({
        budgetData: { expenses: {} },
        budgetCategories: [],
        budgetIncomeItems: [budgetIncomeItemFixture],
        budgetExpenseItems: [],
      }),
    ).toBe(true);
    expect(
      hasBudgetSyncData({
        budgetData: { expenses: {} },
        budgetCategories: [],
        budgetIncomeItems: [],
        budgetExpenseItems: [budgetExpenseItemFixture],
      }),
    ).toBe(true);
  });

  it("予算データが全て空の場合は同期対象なしと判定する", () => {
    expect(
      hasBudgetSyncData({
        budgetData: {},
        budgetCategories: [],
        budgetIncomeItems: [],
        budgetExpenseItems: [],
      }),
    ).toBe(false);
  });
});
