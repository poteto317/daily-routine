import { renderHook } from "@testing-library/react";
import { useBudgetCategoriesState } from "../useBudgetCategoriesState";
import { getBudgetCategories } from "../storage";

jest.mock("../storage", () => ({
  getBudgetCategories: jest.fn(),
}));

const mockGetBudgetCategories = getBudgetCategories as jest.MockedFunction<
  typeof getBudgetCategories
>;

describe("useBudgetCategoriesState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getBudgetCategoriesで読み込んだカテゴリ一覧を返す", () => {
    const categories = [
      { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
    ];
    mockGetBudgetCategories.mockReturnValue(categories);

    const { result } = renderHook(() => useBudgetCategoriesState());

    expect(result.current.categories).toEqual(categories);
    expect(mockGetBudgetCategories).toHaveBeenCalledTimes(1);
  });
});
