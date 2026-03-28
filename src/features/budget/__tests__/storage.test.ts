import {
  getBudgetData,
  saveBudgetData,
  getMonthlyBudget,
  setMonthlyBudget,
  getMonthlyExpenses,
} from "../storage";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;
const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;

const createBudget = () => ({
  id: "b1",
  month: "2026-02",
  totalAmount: 10000,
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
});

describe("budget storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStorageItem.mockReturnValue({ budgets: {}, expenses: {} } as never);
  });

  it("getBudgetDataは家計簿データを取得する", () => {
    const data = {
      budgets: { "2026-02": createBudget() },
      expenses: { "2026-02": [] },
    };
    mockGetStorageItem.mockReturnValue(data as never);

    const result = getBudgetData();

    expect(result).toEqual(data);
    expect(mockGetStorageItem).toHaveBeenCalledWith("budget-data", {
      budgets: {},
      expenses: {},
    });
  });

  it("saveBudgetDataは家計簿データを保存する", () => {
    const data = {
      budgets: { "2026-02": createBudget() },
      expenses: { "2026-02": [] },
    };

    saveBudgetData(data);

    expect(mockSetStorageItem).toHaveBeenCalledWith("budget-data", data);
  });

  it("getMonthlyBudgetは指定月の予算を返す", () => {
    const data = { budgets: { "2026-02": createBudget() }, expenses: {} };
    mockGetStorageItem.mockReturnValue(data as never);

    const result = getMonthlyBudget("2026-02");

    expect(result).toEqual(data.budgets["2026-02"]);
  });

  it("setMonthlyBudgetは未登録月の予算を新規作成する", () => {
    mockGenerateId.mockReturnValue("new-budget-id");
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-12T10:00:00.000Z");

    setMonthlyBudget("2026-02", 25000);

    expect(mockSetStorageItem).toHaveBeenCalledWith("budget-data", {
      budgets: {
        "2026-02": {
          id: "new-budget-id",
          month: "2026-02",
          totalAmount: 25000,
          createdAt: "2026-02-12T10:00:00.000Z",
          updatedAt: "2026-02-12T10:00:00.000Z",
        },
      },
      expenses: {},
    });
  });

  it("getMonthlyExpensesは指定月の支出一覧を返す", () => {
    const data = {
      budgets: {},
      expenses: { "2026-02": [{ id: "e1", date: "2026-02-12", amount: 1000 }] },
    };
    mockGetStorageItem.mockReturnValue(data as never);

    const result = getMonthlyExpenses("2026-02");

    expect(result).toEqual(data.expenses["2026-02"]);
  });
});
