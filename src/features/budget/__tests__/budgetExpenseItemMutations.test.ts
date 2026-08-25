import {
  addBudgetExpenseItem,
  removeBudgetExpenseItem,
  updateBudgetExpenseItem,
  updateBudgetExpenseItemKind,
} from "../budgetExpenseItemMutations";
import { createBudgetExpenseItem } from "../budgetExpenseItemFactory";

jest.mock("../budgetExpenseItemFactory", () => ({
  createBudgetExpenseItem: jest.fn(),
}));

const mockCreateBudgetExpenseItem =
  createBudgetExpenseItem as jest.MockedFunction<
    typeof createBudgetExpenseItem
  >;

const item = (
  overrides: Partial<{
    id: string;
    name: string;
    amount: number;
    kind: "fixed" | "variable";
  }> = {},
) => ({
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
  ...overrides,
});

describe("budgetExpenseItemMutations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addBudgetExpenseItem", () => {
    it("正規化した名前・金額・kindで支出項目を追加する", () => {
      const items = [item()];
      const created = item({
        id: "expense-2",
        name: "食費",
        amount: 30000,
        kind: "variable",
      });
      mockCreateBudgetExpenseItem.mockReturnValue(created);

      const result = addBudgetExpenseItem(items, "  食費  ", 30000, "variable");

      expect(mockCreateBudgetExpenseItem).toHaveBeenCalledWith(
        "食費",
        30000,
        "variable",
      );
      expect(result).toEqual([...items, created]);
    });

    it("空白のみの名前では追加せず同じ配列を返す", () => {
      const items = [item()];

      const result = addBudgetExpenseItem(items, "   ", 1000, "fixed");

      expect(result).toBe(items);
      expect(mockCreateBudgetExpenseItem).not.toHaveBeenCalled();
    });
  });

  describe("updateBudgetExpenseItem", () => {
    it("指定したidの名前と金額を同時に変更する", () => {
      const items = [
        item({ id: "expense-1", name: "家賃", amount: 80000 }),
        item({
          id: "expense-2",
          name: "食費",
          amount: 30000,
          kind: "variable",
        }),
      ];

      const result = updateBudgetExpenseItem(
        items,
        "expense-1",
        "マンション家賃",
        85000,
      );

      expect(result).toEqual([
        item({ id: "expense-1", name: "マンション家賃", amount: 85000 }),
        item({
          id: "expense-2",
          name: "食費",
          amount: 30000,
          kind: "variable",
        }),
      ]);
    });

    it("該当するidがなければ変更されない", () => {
      const items = [item({ id: "expense-1", name: "家賃", amount: 80000 })];

      const result = updateBudgetExpenseItem(
        items,
        "expense-404",
        "マンション家賃",
        85000,
      );

      expect(result).toEqual(items);
    });
  });

  describe("updateBudgetExpenseItemKind", () => {
    it("指定したidの分類（固定費/変動費）だけを変更する", () => {
      const items = [item({ id: "expense-1", kind: "fixed" })];

      const result = updateBudgetExpenseItemKind(
        items,
        "expense-1",
        "variable",
      );

      expect(result).toEqual([item({ id: "expense-1", kind: "variable" })]);
    });
  });

  describe("removeBudgetExpenseItem", () => {
    it("指定したidの項目を取り除く", () => {
      const items = [
        item({ id: "expense-1", name: "家賃" }),
        item({ id: "expense-2", name: "食費", kind: "variable" }),
      ];

      const result = removeBudgetExpenseItem(items, "expense-1");

      expect(result).toEqual([
        item({ id: "expense-2", name: "食費", kind: "variable" }),
      ]);
    });
  });
});
