import { getBudgetCategories, saveBudgetCategories } from "../storage";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;

describe("budget category storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getBudgetCategoriesは保存済みカテゴリ一覧を取得する", () => {
    const categories = [
      { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
    ];
    mockGetStorageItem.mockReturnValue(categories);

    const result = getBudgetCategories();

    expect(result).toEqual(categories);
    expect(mockGetStorageItem).toHaveBeenCalledWith("budget-categories", []);
  });

  it("saveBudgetCategoriesはカテゴリ一覧を保存する", () => {
    const categories = [
      { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
    ];

    saveBudgetCategories(categories);

    expect(mockSetStorageItem).toHaveBeenCalledWith(
      "budget-categories",
      categories,
    );
  });
});
