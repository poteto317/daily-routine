import {
  createBudgetIncomeItemAndPersist,
  deleteBudgetIncomeItemAndPersist,
  updateBudgetIncomeItemAndPersist,
} from "../budgetIncomeItemCrudPersistActions";
import {
  addBudgetIncomeItem,
  removeBudgetIncomeItem,
  updateBudgetIncomeItem,
} from "../budgetIncomeItemMutations";

jest.mock("../budgetIncomeItemMutations", () => ({
  addBudgetIncomeItem: jest.fn(),
  removeBudgetIncomeItem: jest.fn(),
  updateBudgetIncomeItem: jest.fn(),
}));

const mockAddBudgetIncomeItem = addBudgetIncomeItem as jest.MockedFunction<
  typeof addBudgetIncomeItem
>;
const mockRemoveBudgetIncomeItem =
  removeBudgetIncomeItem as jest.MockedFunction<typeof removeBudgetIncomeItem>;
const mockUpdateBudgetIncomeItem =
  updateBudgetIncomeItem as jest.MockedFunction<typeof updateBudgetIncomeItem>;

const item = {
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
};

describe("budgetIncomeItemCrudPersistActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBudgetIncomeItemAndPersist", () => {
    it("追加が成功した場合はpersistして新しい配列を返す", () => {
      const items = [item];
      const nextItems = [item, { ...item, id: "income-2" }];
      mockAddBudgetIncomeItem.mockReturnValue(nextItems);
      const persist = jest.fn();

      const result = createBudgetIncomeItemAndPersist({
        items,
        nameInput: "副業",
        amount: 50000,
        persist,
      });

      expect(mockAddBudgetIncomeItem).toHaveBeenCalledWith(
        items,
        "副業",
        50000,
      );
      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("追加されなかった場合はpersistせずnullを返す", () => {
      const items = [item];
      mockAddBudgetIncomeItem.mockReturnValue(items);
      const persist = jest.fn();

      const result = createBudgetIncomeItemAndPersist({
        items,
        nameInput: "   ",
        amount: 1000,
        persist,
      });

      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("updateBudgetIncomeItemAndPersist", () => {
    it("名前と金額が両方変わる場合は1回のpersistで両方反映する", () => {
      const items = [item];
      const nextItems = [{ ...item, name: "本業給与", amount: 320000 }];
      mockUpdateBudgetIncomeItem.mockReturnValue(nextItems);
      const persist = jest.fn();

      const result = updateBudgetIncomeItemAndPersist({
        items,
        itemId: "income-1",
        name: "  本業給与  ",
        amount: 320000,
        persist,
      });

      expect(mockUpdateBudgetIncomeItem).toHaveBeenCalledWith(
        items,
        "income-1",
        "本業給与",
        320000,
      );
      expect(persist).toHaveBeenCalledTimes(1);
      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("名前だけが変わる場合もpersistする", () => {
      const items = [item];
      const nextItems = [{ ...item, name: "本業給与" }];
      mockUpdateBudgetIncomeItem.mockReturnValue(nextItems);
      const persist = jest.fn();

      const result = updateBudgetIncomeItemAndPersist({
        items,
        itemId: "income-1",
        name: "本業給与",
        amount: 300000,
        persist,
      });

      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("金額だけが変わる場合もpersistする", () => {
      const items = [item];
      const nextItems = [{ ...item, amount: 320000 }];
      mockUpdateBudgetIncomeItem.mockReturnValue(nextItems);
      const persist = jest.fn();

      const result = updateBudgetIncomeItemAndPersist({
        items,
        itemId: "income-1",
        name: "給与",
        amount: 320000,
        persist,
      });

      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("名前・金額とも変わらない場合はpersistせずnullを返す", () => {
      const items = [item];
      const persist = jest.fn();

      const result = updateBudgetIncomeItemAndPersist({
        items,
        itemId: "income-1",
        name: "  給与  ",
        amount: 300000,
        persist,
      });

      expect(mockUpdateBudgetIncomeItem).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("名前が空白のみの場合はpersistせずnullを返す", () => {
      const items = [item];
      const persist = jest.fn();

      const result = updateBudgetIncomeItemAndPersist({
        items,
        itemId: "income-1",
        name: "   ",
        amount: 320000,
        persist,
      });

      expect(mockUpdateBudgetIncomeItem).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("itemIdが存在しない場合はpersistせずnullを返す", () => {
      const items = [item];
      const persist = jest.fn();

      const result = updateBudgetIncomeItemAndPersist({
        items,
        itemId: "income-404",
        name: "本業給与",
        amount: 320000,
        persist,
      });

      expect(mockUpdateBudgetIncomeItem).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("deleteBudgetIncomeItemAndPersist", () => {
    it("確認でOKされた場合は削除してpersistする", () => {
      const items = [item];
      const nextItems: typeof items = [];
      mockRemoveBudgetIncomeItem.mockReturnValue(nextItems);
      const persist = jest.fn();
      const confirmDelete = jest.fn().mockReturnValue(true);

      const result = deleteBudgetIncomeItemAndPersist({
        items,
        item,
        message: "削除しますか？",
        persist,
        confirmDelete,
      });

      expect(confirmDelete).toHaveBeenCalledWith("削除しますか？");
      expect(mockRemoveBudgetIncomeItem).toHaveBeenCalledWith(
        items,
        "income-1",
      );
      expect(persist).toHaveBeenCalledWith(nextItems);
      expect(result).toBe(nextItems);
    });

    it("確認でキャンセルされた場合はpersistせずnullを返す", () => {
      const items = [item];
      const persist = jest.fn();
      const confirmDelete = jest.fn().mockReturnValue(false);

      const result = deleteBudgetIncomeItemAndPersist({
        items,
        item,
        message: "削除しますか？",
        persist,
        confirmDelete,
      });

      expect(mockRemoveBudgetIncomeItem).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("confirmDelete省略時はwindow.confirmを直接使う", () => {
      const items = [item];
      const nextItems: typeof items = [];
      mockRemoveBudgetIncomeItem.mockReturnValue(nextItems);
      const persist = jest.fn();
      const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

      const result = deleteBudgetIncomeItemAndPersist({
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
