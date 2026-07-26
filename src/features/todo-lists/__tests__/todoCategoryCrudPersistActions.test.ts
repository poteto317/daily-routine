import {
  createTodoCategoryAndPersist,
  deleteTodoCategoryAndPersist,
  renameTodoCategoryAndPersist,
  reorderTodoCategoriesAndPersist,
  updateTodoCategoryColorAndPersist,
} from "../todoCategoryCrudPersistActions";
import {
  addTodoCategory,
  removeTodoCategory,
  renameTodoCategory,
  reorderTodoCategories,
  updateTodoCategoryColor,
} from "../todoCategoryMutations";

jest.mock("../todoCategoryMutations", () => ({
  addTodoCategory: jest.fn(),
  removeTodoCategory: jest.fn(),
  renameTodoCategory: jest.fn(),
  reorderTodoCategories: jest.fn(),
  updateTodoCategoryColor: jest.fn(),
}));

const mockAddTodoCategory = addTodoCategory as jest.MockedFunction<
  typeof addTodoCategory
>;
const mockRemoveTodoCategory = removeTodoCategory as jest.MockedFunction<
  typeof removeTodoCategory
>;
const mockRenameTodoCategory = renameTodoCategory as jest.MockedFunction<
  typeof renameTodoCategory
>;
const mockReorderTodoCategories = reorderTodoCategories as jest.MockedFunction<
  typeof reorderTodoCategories
>;
const mockUpdateTodoCategoryColor =
  updateTodoCategoryColor as jest.MockedFunction<
    typeof updateTodoCategoryColor
  >;

const category = {
  id: "cat-1",
  name: "仕事",
  color: "bg-blue-50" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("todoCategoryCrudPersistActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTodoCategoryAndPersist", () => {
    it("追加が成功した場合はpersistして新しい配列を返す", () => {
      const categories = [category];
      const nextCategories = [category, { ...category, id: "cat-2" }];
      mockAddTodoCategory.mockReturnValue(nextCategories);
      const persist = jest.fn();

      const result = createTodoCategoryAndPersist({
        categories,
        nameInput: "プライベート",
        color: "bg-green-50",
        persist,
      });

      expect(mockAddTodoCategory).toHaveBeenCalledWith(
        categories,
        "プライベート",
        "bg-green-50",
      );
      expect(persist).toHaveBeenCalledWith(nextCategories);
      expect(result).toBe(nextCategories);
    });

    it("追加されなかった場合はpersistせずnullを返す", () => {
      const categories = [category];
      mockAddTodoCategory.mockReturnValue(categories);
      const persist = jest.fn();

      const result = createTodoCategoryAndPersist({
        categories,
        nameInput: "   ",
        persist,
      });

      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("renameTodoCategoryAndPersist", () => {
    it("有効な名前ならリネームしてpersistする", () => {
      const categories = [category];
      const nextCategories = [{ ...category, name: "業務" }];
      mockRenameTodoCategory.mockReturnValue(nextCategories);
      const persist = jest.fn();

      const result = renameTodoCategoryAndPersist({
        categories,
        categoryId: "cat-1",
        name: "  業務  ",
        persist,
      });

      expect(mockRenameTodoCategory).toHaveBeenCalledWith(
        categories,
        "cat-1",
        "業務",
      );
      expect(persist).toHaveBeenCalledWith(nextCategories);
      expect(result).toBe(nextCategories);
    });

    it("空白のみの名前ではpersistせずnullを返す", () => {
      const categories = [category];
      const persist = jest.fn();

      const result = renameTodoCategoryAndPersist({
        categories,
        categoryId: "cat-1",
        name: "   ",
        persist,
      });

      expect(mockRenameTodoCategory).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("名前が変わらない場合はpersistせずnullを返す", () => {
      const categories = [category];
      const persist = jest.fn();

      const result = renameTodoCategoryAndPersist({
        categories,
        categoryId: "cat-1",
        name: "  仕事  ",
        persist,
      });

      expect(mockRenameTodoCategory).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("categoryIdが存在しない場合はpersistせずnullを返す", () => {
      const categories = [category];
      const persist = jest.fn();

      const result = renameTodoCategoryAndPersist({
        categories,
        categoryId: "cat-404",
        name: "業務",
        persist,
      });

      expect(mockRenameTodoCategory).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("updateTodoCategoryColorAndPersist", () => {
    it("色が変わる場合は更新してpersistする", () => {
      const categories = [category];
      const nextCategories = [{ ...category, color: "bg-red-50" as const }];
      mockUpdateTodoCategoryColor.mockReturnValue(nextCategories);
      const persist = jest.fn();

      const result = updateTodoCategoryColorAndPersist({
        categories,
        categoryId: "cat-1",
        color: "bg-red-50",
        persist,
      });

      expect(mockUpdateTodoCategoryColor).toHaveBeenCalledWith(
        categories,
        "cat-1",
        "bg-red-50",
      );
      expect(persist).toHaveBeenCalledWith(nextCategories);
      expect(result).toBe(nextCategories);
    });

    it("色が変わらない場合はpersistせずnullを返す", () => {
      const categories = [category];
      const persist = jest.fn();

      const result = updateTodoCategoryColorAndPersist({
        categories,
        categoryId: "cat-1",
        color: "bg-blue-50",
        persist,
      });

      expect(mockUpdateTodoCategoryColor).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("categoryIdが存在しない場合はpersistせずnullを返す", () => {
      const categories = [category];
      const persist = jest.fn();

      const result = updateTodoCategoryColorAndPersist({
        categories,
        categoryId: "cat-404",
        color: "bg-red-50",
        persist,
      });

      expect(mockUpdateTodoCategoryColor).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("reorderTodoCategoriesAndPersist", () => {
    it("並び替えが成功した場合はpersistして新しい配列を返す", () => {
      const categories = [category, { ...category, id: "cat-2" }];
      const nextCategories = [{ ...category, id: "cat-2" }, category];
      mockReorderTodoCategories.mockReturnValue(nextCategories);
      const persist = jest.fn();

      const result = reorderTodoCategoriesAndPersist({
        categories,
        fromIndex: 0,
        toIndex: 1,
        persist,
      });

      expect(mockReorderTodoCategories).toHaveBeenCalledWith(
        categories,
        0,
        1,
      );
      expect(persist).toHaveBeenCalledWith(nextCategories);
      expect(result).toBe(nextCategories);
    });

    it("並び替えられなかった場合（同じ配列参照が返る場合）はpersistせずnullを返す", () => {
      const categories = [category];
      mockReorderTodoCategories.mockReturnValue(categories);
      const persist = jest.fn();

      const result = reorderTodoCategoriesAndPersist({
        categories,
        fromIndex: 0,
        toIndex: 0,
        persist,
      });

      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("deleteTodoCategoryAndPersist", () => {
    it("確認でOKされた場合は削除してpersistする", () => {
      const categories = [category];
      const nextCategories: typeof categories = [];
      mockRemoveTodoCategory.mockReturnValue(nextCategories);
      const persist = jest.fn();
      const confirmDelete = jest.fn().mockReturnValue(true);

      const result = deleteTodoCategoryAndPersist({
        categories,
        category,
        message: "削除しますか？",
        persist,
        confirmDelete,
      });

      expect(confirmDelete).toHaveBeenCalledWith("削除しますか？");
      expect(mockRemoveTodoCategory).toHaveBeenCalledWith(categories, "cat-1");
      expect(persist).toHaveBeenCalledWith(nextCategories);
      expect(result).toBe(nextCategories);
    });

    it("確認でキャンセルされた場合はpersistせずnullを返す", () => {
      const categories = [category];
      const persist = jest.fn();
      const confirmDelete = jest.fn().mockReturnValue(false);

      const result = deleteTodoCategoryAndPersist({
        categories,
        category,
        message: "削除しますか？",
        persist,
        confirmDelete,
      });

      expect(mockRemoveTodoCategory).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("confirmDelete省略時はwindow.confirmを直接使う", () => {
      const categories = [category];
      const nextCategories: typeof categories = [];
      mockRemoveTodoCategory.mockReturnValue(nextCategories);
      const persist = jest.fn();
      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

      const result = deleteTodoCategoryAndPersist({
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
