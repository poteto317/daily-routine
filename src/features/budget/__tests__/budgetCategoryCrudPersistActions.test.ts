import {
  createBudgetCategoryAndPersist,
  deleteBudgetCategoryAndPersist,
  renameBudgetCategoryAndPersist,
} from "../budgetCategoryCrudPersistActions";
import {
  addBudgetCategory,
  removeBudgetCategory,
  renameBudgetCategory,
} from "../budgetCategoryMutations";

jest.mock("../budgetCategoryMutations", () => ({
  addBudgetCategory: jest.fn(),
  removeBudgetCategory: jest.fn(),
  renameBudgetCategory: jest.fn(),
}));

const mockAddBudgetCategory = addBudgetCategory as jest.MockedFunction<
  typeof addBudgetCategory
>;
const mockRemoveBudgetCategory = removeBudgetCategory as jest.MockedFunction<
  typeof removeBudgetCategory
>;
const mockRenameBudgetCategory = renameBudgetCategory as jest.MockedFunction<
  typeof renameBudgetCategory
>;

const category = { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" };

describe("budgetCategoryCrudPersistActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBudgetCategoryAndPersist", () => {
    it("追加が成功した場合はpersistして新しい配列を返す", () => {
      const categories = [category];
      const nextCategories = [category, { ...category, id: "cat-2" }];
      mockAddBudgetCategory.mockReturnValue(nextCategories);
      const persist = jest.fn();

      const result = createBudgetCategoryAndPersist({
        categories,
        nameInput: "交通費",
        persist,
      });

      expect(mockAddBudgetCategory).toHaveBeenCalledWith(categories, "交通費");
      expect(persist).toHaveBeenCalledWith(nextCategories);
      expect(result).toBe(nextCategories);
    });

    it("追加されなかった場合はpersistせずnullを返す", () => {
      const categories = [category];
      mockAddBudgetCategory.mockReturnValue(categories);
      const persist = jest.fn();

      const result = createBudgetCategoryAndPersist({
        categories,
        nameInput: "   ",
        persist,
      });

      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("renameBudgetCategoryAndPersist", () => {
    it("有効な名前ならリネームしてpersistする", () => {
      const categories = [category];
      const nextCategories = [{ ...category, name: "食費" }];
      mockRenameBudgetCategory.mockReturnValue(nextCategories);
      const persist = jest.fn();

      const result = renameBudgetCategoryAndPersist({
        categories,
        categoryId: "cat-1",
        name: "  食費  ",
        persist,
      });

      expect(mockRenameBudgetCategory).toHaveBeenCalledWith(
        categories,
        "cat-1",
        "食費",
      );
      expect(persist).toHaveBeenCalledWith(nextCategories);
      expect(result).toBe(nextCategories);
    });

    it("空白のみの名前ではpersistせずnullを返す", () => {
      const categories = [category];
      const persist = jest.fn();

      const result = renameBudgetCategoryAndPersist({
        categories,
        categoryId: "cat-1",
        name: "   ",
        persist,
      });

      expect(mockRenameBudgetCategory).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("名前が変わらない場合はpersistせずnullを返す", () => {
      const categories = [category];
      const persist = jest.fn();

      const result = renameBudgetCategoryAndPersist({
        categories,
        categoryId: "cat-1",
        name: "  食料品  ",
        persist,
      });

      expect(mockRenameBudgetCategory).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("categoryIdが存在しない場合はpersistせずnullを返す", () => {
      const categories = [category];
      const persist = jest.fn();

      const result = renameBudgetCategoryAndPersist({
        categories,
        categoryId: "cat-404",
        name: "食費",
        persist,
      });

      expect(mockRenameBudgetCategory).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("deleteBudgetCategoryAndPersist", () => {
    it("確認でOKされた場合は削除してpersistする", () => {
      const categories = [category];
      const nextCategories: typeof categories = [];
      mockRemoveBudgetCategory.mockReturnValue(nextCategories);
      const persist = jest.fn();
      const confirmDelete = jest.fn().mockReturnValue(true);

      const result = deleteBudgetCategoryAndPersist({
        categories,
        category,
        message: "削除しますか？",
        persist,
        confirmDelete,
      });

      expect(confirmDelete).toHaveBeenCalledWith("削除しますか？");
      expect(mockRemoveBudgetCategory).toHaveBeenCalledWith(
        categories,
        "cat-1",
      );
      expect(persist).toHaveBeenCalledWith(nextCategories);
      expect(result).toBe(nextCategories);
    });

    it("確認でキャンセルされた場合はpersistせずnullを返す", () => {
      const categories = [category];
      const persist = jest.fn();
      const confirmDelete = jest.fn().mockReturnValue(false);

      const result = deleteBudgetCategoryAndPersist({
        categories,
        category,
        message: "削除しますか？",
        persist,
        confirmDelete,
      });

      expect(mockRemoveBudgetCategory).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("confirmDelete省略時はwindow.confirmを直接使う", () => {
      const categories = [category];
      const nextCategories: typeof categories = [];
      mockRemoveBudgetCategory.mockReturnValue(nextCategories);
      const persist = jest.fn();
      const confirmSpy = jest
        .spyOn(window, "confirm")
        .mockReturnValue(true);

      const result = deleteBudgetCategoryAndPersist({
        categories,
        category,
        message: "削除しますか？",
        persist,
      });

      expect(confirmSpy).toHaveBeenCalledWith("削除しますか？");
      expect(persist).toHaveBeenCalledWith(nextCategories);
      expect(result).toBe(nextCategories);

      confirmSpy.mockRestore();
    });
  });
});
