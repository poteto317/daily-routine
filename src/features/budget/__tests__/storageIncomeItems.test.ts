import { getBudgetIncomeItems, saveBudgetIncomeItems } from "../storage";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;

describe("budget income item storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getBudgetIncomeItemsは保存済みの収入項目一覧を取得する", () => {
    const items = [
      { id: "income-1", name: "給与", amount: 300000, createdAt: "2026-05-01T00:00:00.000Z" },
    ];
    mockGetStorageItem.mockReturnValue(items);

    const result = getBudgetIncomeItems();

    expect(result).toEqual(items);
    expect(mockGetStorageItem).toHaveBeenCalledWith("budget-income-items", []);
  });

  it("saveBudgetIncomeItemsは収入項目一覧を保存する", () => {
    const items = [
      { id: "income-1", name: "給与", amount: 300000, createdAt: "2026-05-01T00:00:00.000Z" },
    ];

    saveBudgetIncomeItems(items);

    expect(mockSetStorageItem).toHaveBeenCalledWith(
      "budget-income-items",
      items,
    );
  });
});
