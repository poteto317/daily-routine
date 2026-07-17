import {
  createBudgetExpenseItemAndPersist,
  deleteBudgetExpenseItemAndPersist,
  renameBudgetExpenseItemAndPersist,
  updateBudgetExpenseItemAmountAndPersist,
  updateBudgetExpenseItemKindAndPersist,
} from "../budgetExpenseItemCrudPersistActions";
import {
  addBudgetExpenseItem,
  removeBudgetExpenseItem,
  renameBudgetExpenseItem,
  updateBudgetExpenseItemAmount,
  updateBudgetExpenseItemKind,
} from "../budgetExpenseItemMutations";

jest.mock("../budgetExpenseItemMutations", () => ({
  addBudgetExpenseItem: jest.fn(),
  removeBudgetExpenseItem: jest.fn(),
  renameBudgetExpenseItem: jest.fn(),
  updateBudgetExpenseItemAmount: jest.fn(),
  updateBudgetExpenseItemKind: jest.fn(),
}));

const mockAddBudgetExpenseItem = addBudgetExpenseItem as jest.MockedFunction<
  typeof addBudgetExpenseItem
>;
const mockRemoveBudgetExpenseItem =
  removeBudgetExpenseItem as jest.MockedFunction<
    typeof removeBudgetExpenseItem
  >;
const mockRenameBudgetExpenseItem =
  renameBudgetExpenseItem as jest.MockedFunction<
    typeof renameBudgetExpenseItem
  >;
const mockUpdateBudgetExpenseItemAmount =
  updateBudgetExpenseItemAmount as jest.MockedFunction<
    typeof updateBudgetExpenseItemAmount
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
      const nextItems = [item, { ...item, id: "expense-2", kind: "variable" as const }];
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

  describe("renameBudgetExpenseItemAndPersist", () => {
    it("有効な名前ならリネームしてpersistする", () => {
      const items = [item];
      const nextItems = [{ ...item, name: "マンション家賃" }];
      mockRenameBudgetExpenseItem.mockReturnValue(nextItems);
      const persist = jest.fn();

      const result = renameBudgetExpenseItemAndPersist({
        items,
        itemId: "expense-1",
        name: "  マンション家賃  ",
        persist,
      });

      expect(mockRenameBudgetExpenseItem).toHaveBeenCalledWith(
        items,
        "expense-1",
        "マンション家賃",
      );
      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("名前が変わらない場合はpersistせずnullを返す", () => {
      const items = [item];
      const persist = jest.fn();

      const result = renameBudgetExpenseItemAndPersist({
        items,
        itemId: "expense-1",
        name: "  家賃  ",
        persist,
      });

      expect(mockRenameBudgetExpenseItem).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("updateBudgetExpenseItemAmountAndPersist", () => {
    it("金額が変わる場合はpersistする", () => {
      const items = [item];
      const nextItems = [{ ...item, amount: 85000 }];
      mockUpdateBudgetExpenseItemAmount.mockReturnValue(nextItems);
      const persist = jest.fn();

      const result = updateBudgetExpenseItemAmountAndPersist({
        items,
        itemId: "expense-1",
        amount: 85000,
        persist,
      });

      expect(mockUpdateBudgetExpenseItemAmount).toHaveBeenCalledWith(
        items,
        "expense-1",
        85000,
      );
      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("金額が変わらない場合はpersistせずnullを返す", () => {
      const items = [item];
      const persist = jest.fn();

      const result = updateBudgetExpenseItemAmountAndPersist({
        items,
        itemId: "expense-1",
        amount: 80000,
        persist,
      });

      expect(mockUpdateBudgetExpenseItemAmount).not.toHaveBeenCalled();
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
