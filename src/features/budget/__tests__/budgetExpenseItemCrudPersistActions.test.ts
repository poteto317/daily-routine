import {
  createBudgetExpenseItemAndPersist,
  deleteBudgetExpenseItemAndPersist,
  updateBudgetExpenseItemAndPersist,
  updateBudgetExpenseItemKindAndPersist,
} from "../budgetExpenseItemCrudPersistActions";
import {
  addBudgetExpenseItem,
  removeBudgetExpenseItem,
  updateBudgetExpenseItem,
  updateBudgetExpenseItemKind,
} from "../budgetExpenseItemMutations";

jest.mock("../budgetExpenseItemMutations", () => ({
  addBudgetExpenseItem: jest.fn(),
  removeBudgetExpenseItem: jest.fn(),
  updateBudgetExpenseItem: jest.fn(),
  updateBudgetExpenseItemKind: jest.fn(),
}));

const mockAddBudgetExpenseItem = addBudgetExpenseItem as jest.MockedFunction<
  typeof addBudgetExpenseItem
>;
const mockRemoveBudgetExpenseItem =
  removeBudgetExpenseItem as jest.MockedFunction<
    typeof removeBudgetExpenseItem
  >;
const mockUpdateBudgetExpenseItem =
  updateBudgetExpenseItem as jest.MockedFunction<
    typeof updateBudgetExpenseItem
  >;
const mockUpdateBudgetExpenseItemKind =
  updateBudgetExpenseItemKind as jest.MockedFunction<
    typeof updateBudgetExpenseItemKind
  >;

const item = {
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("budgetExpenseItemCrudPersistActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBudgetExpenseItemAndPersist", () => {
    it("追加が成功した場合はpersistして新しい配列を返す", () => {
      const items = [item];
      const nextItems = [
        item,
        { ...item, id: "expense-2", kind: "variable" as const },
      ];
      mockAddBudgetExpenseItem.mockReturnValue(nextItems);
      const persist = jest.fn();

      const result = createBudgetExpenseItemAndPersist({
        items,
        nameInput: "食費",
        amount: 30000,
        kind: "variable",
        persist,
      });

      expect(mockAddBudgetExpenseItem).toHaveBeenCalledWith(
        items,
        "食費",
        30000,
        "variable",
      );
      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("追加されなかった場合はpersistせずnullを返す", () => {
      const items = [item];
      mockAddBudgetExpenseItem.mockReturnValue(items);
      const persist = jest.fn();

      const result = createBudgetExpenseItemAndPersist({
        items,
        nameInput: "   ",
        amount: 1000,
        kind: "fixed",
        persist,
      });

      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("updateBudgetExpenseItemAndPersist", () => {
    it("名前と金額が両方変わる場合は1回のpersistで両方反映する", () => {
      const items = [item];
      const nextItems = [{ ...item, name: "マンション家賃", amount: 85000 }];
      mockUpdateBudgetExpenseItem.mockReturnValue(nextItems);
      const persist = jest.fn();

      const result = updateBudgetExpenseItemAndPersist({
        items,
        itemId: "expense-1",
        name: "  マンション家賃  ",
        amount: 85000,
        persist,
      });

      expect(mockUpdateBudgetExpenseItem).toHaveBeenCalledWith(
        items,
        "expense-1",
        "マンション家賃",
        85000,
      );
      expect(persist).toHaveBeenCalledTimes(1);
      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("名前だけが変わる場合もpersistする", () => {
      const items = [item];
      const nextItems = [{ ...item, name: "マンション家賃" }];
      mockUpdateBudgetExpenseItem.mockReturnValue(nextItems);
      const persist = jest.fn();

      const result = updateBudgetExpenseItemAndPersist({
        items,
        itemId: "expense-1",
        name: "マンション家賃",
        amount: 80000,
        persist,
      });

      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("金額だけが変わる場合もpersistする", () => {
      const items = [item];
      const nextItems = [{ ...item, amount: 85000 }];
      mockUpdateBudgetExpenseItem.mockReturnValue(nextItems);
      const persist = jest.fn();

      const result = updateBudgetExpenseItemAndPersist({
        items,
        itemId: "expense-1",
        name: "家賃",
        amount: 85000,
        persist,
      });

      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("名前・金額とも変わらない場合はpersistせずnullを返す", () => {
      const items = [item];
      const persist = jest.fn();

      const result = updateBudgetExpenseItemAndPersist({
        items,
        itemId: "expense-1",
        name: "  家賃  ",
        amount: 80000,
        persist,
      });

      expect(mockUpdateBudgetExpenseItem).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("名前が空白のみの場合はpersistせずnullを返す", () => {
      const items = [item];
      const persist = jest.fn();

      const result = updateBudgetExpenseItemAndPersist({
        items,
        itemId: "expense-1",
        name: "   ",
        amount: 85000,
        persist,
      });

      expect(mockUpdateBudgetExpenseItem).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("itemIdが存在しない場合はpersistせずnullを返す", () => {
      const items = [item];
      const persist = jest.fn();

      const result = updateBudgetExpenseItemAndPersist({
        items,
        itemId: "expense-404",
        name: "マンション家賃",
        amount: 85000,
        persist,
      });

      expect(mockUpdateBudgetExpenseItem).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("updateBudgetExpenseItemKindAndPersist", () => {
    it("分類が変わる場合はpersistする", () => {
      const items = [item];
      const nextItems = [{ ...item, kind: "variable" as const }];
      mockUpdateBudgetExpenseItemKind.mockReturnValue(nextItems);
      const persist = jest.fn();

      const result = updateBudgetExpenseItemKindAndPersist({
        items,
        itemId: "expense-1",
        kind: "variable",
        persist,
      });

      expect(mockUpdateBudgetExpenseItemKind).toHaveBeenCalledWith(
        items,
        "expense-1",
        "variable",
      );
      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("分類が変わらない場合はpersistせずnullを返す", () => {
      const items = [item];
      const persist = jest.fn();

      const result = updateBudgetExpenseItemKindAndPersist({
        items,
        itemId: "expense-1",
        kind: "fixed",
        persist,
      });

      expect(mockUpdateBudgetExpenseItemKind).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("deleteBudgetExpenseItemAndPersist", () => {
    it("確認でOKされた場合は削除してpersistする", () => {
      const items = [item];
      const nextItems: typeof items = [];
      mockRemoveBudgetExpenseItem.mockReturnValue(nextItems);
      const persist = jest.fn();
      const confirmDelete = jest.fn().mockReturnValue(true);

      const result = deleteBudgetExpenseItemAndPersist({
        items,
        item,
        message: "削除しますか？",
        persist,
        confirmDelete,
      });

      expect(confirmDelete).toHaveBeenCalledWith("削除しますか？");
      expect(mockRemoveBudgetExpenseItem).toHaveBeenCalledWith(
        items,
        "expense-1",
      );
      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("確認でキャンセルされた場合はpersistせずnullを返す", () => {
      const items = [item];
      const persist = jest.fn();
      const confirmDelete = jest.fn().mockReturnValue(false);

      const result = deleteBudgetExpenseItemAndPersist({
        items,
        item,
        message: "削除しますか？",
        persist,
        confirmDelete,
      });

      expect(mockRemoveBudgetExpenseItem).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("confirmDelete省略時はwindow.confirmを直接使う", () => {
      const items = [item];
      const nextItems: typeof items = [];
      mockRemoveBudgetExpenseItem.mockReturnValue(nextItems);
      const persist = jest.fn();
      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

      const result = deleteBudgetExpenseItemAndPersist({
        items,
        item,
        message: "削除しますか？",
        persist,
      });

      expect(confirmSpy).toHaveBeenCalledWith("削除しますか？");
      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);

      confirmSpy.mockRestore();
    });
  });
});
