import { getBudgetExpenseItems, saveBudgetExpenseItems } from "../storage";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;

describe("budget expense item storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getBudgetExpenseItemsは保存済みの支出項目一覧を取得する", () => {
    const items = [
      {
        id: "expense-1",
        name: "家賃",
        amount: 80000,
        kind: "fixed" as const,
        createdAt: "2026-05-01T00:00:00.000Z",
      },
    ];
    mockGetStorageItem.mockReturnValue(items);

    const result = getBudgetExpenseItems();

    expect(result).toEqual(items);
    expect(mockGetStorageItem).toHaveBeenCalledWith("budget-expense-items", []);
  });

  it("saveBudgetExpenseItemsは支出項目一覧を保存する", () => {
    const items = [
      {
        id: "expense-1",
        name: "食費",
        amount: 30000,
        kind: "variable" as const,
        createdAt: "2026-05-01T00:00:00.000Z",
      },
    ];

    saveBudgetExpenseItems(items);

    expect(mockSetStorageItem).toHaveBeenCalledWith(
      "budget-expense-items",
      items,
    );
  });
});
