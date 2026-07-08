import {
  addBudgetCategory,
  removeBudgetCategory,
  renameBudgetCategory,
} from "../budgetCategoryMutations";
import { createBudgetCategory } from "../budgetCategoryFactory";

jest.mock("../budgetCategoryFactory", () => ({
  createBudgetCategory: jest.fn(),
}));

const mockCreateBudgetCategory = createBudgetCategory as jest.MockedFunction<
  typeof createBudgetCategory
>;

const category = (overrides: Partial<{ id: string; name: string }> = {}) => ({
  id: "cat-1",
  name: "食料品",
  createdAt: "2026-05-01T00:00:00.000Z",
  ...overrides,
});

describe("budgetCategoryMutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addBudgetCategory", () => {
    it("正規化した名前でカテゴリを追加する", () => {
      const categories = [category()];
      const created = category({ id: "cat-2", name: "交通費" });
      mockCreateBudgetCategory.mockReturnValue(created);

      const result = addBudgetCategory(categories, "  交通費  ");

      expect(mockCreateBudgetCategory).toHaveBeenCalledWith("交通費");
      expect(result).toEqual([...categories, created]);
    });

    it("空白のみの名前では追加せず同じ配列を返す", () => {
      const categories = [category()];

      const result = addBudgetCategory(categories, "   ");

      expect(result).toBe(categories);
      expect(mockCreateBudgetCategory).not.toHaveBeenCalled();
    });
  });

  describe("renameBudgetCategory", () => {
    it("指定したidのカテゴリ名だけを変更する", () => {
      const categories = [
        category({ id: "cat-1", name: "食料品" }),
        category({ id: "cat-2", name: "交通費" }),
      ];

      const result = renameBudgetCategory(categories, "cat-1", "食費");

      expect(result).toEqual([
        category({ id: "cat-1", name: "食費" }),
        category({ id: "cat-2", name: "交通費" }),
      ]);
    });

    it("該当するidがなければ変更されない", () => {
      const categories = [category({ id: "cat-1", name: "食料品" })];

      const result = renameBudgetCategory(categories, "cat-404", "食費");

      expect(result).toEqual(categories);
    });
  });

  describe("removeBudgetCategory", () => {
    it("指定したidのカテゴリを取り除く", () => {
      const categories = [
        category({ id: "cat-1", name: "食料品" }),
        category({ id: "cat-2", name: "交通費" }),
      ];

      const result = removeBudgetCategory(categories, "cat-1");

      expect(result).toEqual([category({ id: "cat-2", name: "交通費" })]);
    });
  });
});
