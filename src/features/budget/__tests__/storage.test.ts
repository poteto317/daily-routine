import { getBudgetData, saveBudgetData, getMonthlyExpenses } from "../storage";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;

describe("budget storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStorageItem.mockReturnValue({ expenses: {} } as never);
  });

  it("getBudgetDataは家計簿データを取得する", () => {
    const data = {
      expenses: { "2026-02": [] },
    };
    mockGetStorageItem.mockReturnValue(data as never);

    const result = getBudgetData();

    expect(result).toEqual(data);
    expect(mockGetStorageItem).toHaveBeenCalledWith("budget-data", {
      expenses: {},
    });
  });

  it("saveBudgetDataは家計簿データを保存する", () => {
    const data = {
      expenses: { "2026-02": [] },
    };

    saveBudgetData(data);

    expect(mockSetStorageItem).toHaveBeenCalledWith("budget-data", data);
  });

  it("getMonthlyExpensesは指定月の支出一覧を返す", () => {
    const data = {
      expenses: { "2026-02": [{ id: "e1", date: "2026-02-12", amount: 1000 }] },
    };
    mockGetStorageItem.mockReturnValue(data as never);

    const result = getMonthlyExpenses("2026-02");

    expect(result).toEqual(data.expenses["2026-02"]);
  });
});
