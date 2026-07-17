import {
  addBudgetIncomeItem,
  removeBudgetIncomeItem,
  updateBudgetIncomeItem,
} from "../budgetIncomeItemMutations";
import { createBudgetIncomeItem } from "../budgetIncomeItemFactory";

jest.mock("../budgetIncomeItemFactory", () => ({
  createBudgetIncomeItem: jest.fn(),
}));

const mockCreateBudgetIncomeItem =
  createBudgetIncomeItem as jest.MockedFunction<typeof createBudgetIncomeItem>;

const item = (
  overrides: Partial<{ id: string; name: string; amount: number }> = {},
) => ({
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
  ...overrides,
});

describe("budgetIncomeItemMutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addBudgetIncomeItem", () => {
    it("正規化した名前と金額で収入項目を追加する", () => {
      const items = [item()];
      const created = item({ id: "income-2", name: "副業", amount: 50000 });
      mockCreateBudgetIncomeItem.mockReturnValue(created);

      const result = addBudgetIncomeItem(items, "  副業  ", 50000);

      expect(mockCreateBudgetIncomeItem).toHaveBeenCalledWith("副業", 50000);
      expect(result).toEqual([...items, created]);
    });

    it("空白のみの名前では追加せず同じ配列を返す", () => {
      const items = [item()];

      const result = addBudgetIncomeItem(items, "   ", 1000);

      expect(result).toBe(items);
      expect(mockCreateBudgetIncomeItem).not.toHaveBeenCalled();
    });
  });

  describe("updateBudgetIncomeItem", () => {
    it("指定したidの名前と金額を同時に変更する", () => {
      const items = [
        item({ id: "income-1", name: "給与", amount: 300000 }),
        item({ id: "income-2", name: "副業", amount: 50000 }),
      ];

      const result = updateBudgetIncomeItem(
        items,
        "income-1",
        "本業給与",
        320000,
      );

      expect(result).toEqual([
        item({ id: "income-1", name: "本業給与", amount: 320000 }),
        item({ id: "income-2", name: "副業", amount: 50000 }),
      ]);
    });

    it("該当するidがなければ変更されない", () => {
      const items = [item({ id: "income-1", name: "給与", amount: 300000 })];

      const result = updateBudgetIncomeItem(
        items,
        "income-404",
        "本業給与",
        320000,
      );

      expect(result).toEqual(items);
    });
  });

  describe("removeBudgetIncomeItem", () => {
    it("指定したidの項目を取り除く", () => {
      const items = [
        item({ id: "income-1", name: "給与" }),
        item({ id: "income-2", name: "副業" }),
      ];

      const result = removeBudgetIncomeItem(items, "income-1");

      expect(result).toEqual([item({ id: "income-2", name: "副業" })]);
    });
  });
});
