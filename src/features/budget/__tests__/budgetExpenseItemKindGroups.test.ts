import { groupBudgetExpenseItemsByKind } from "../budgetExpenseItemKindGroups";
import type { BudgetExpenseItem } from "@/types/routine";

const fixedItem = (overrides: Partial<BudgetExpenseItem> = {}): BudgetExpenseItem => ({
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed",
  createdAt: "2026-05-01T00:00:00.000Z",
  ...overrides,
});

const variableItem = (overrides: Partial<BudgetExpenseItem> = {}): BudgetExpenseItem => ({
  id: "expense-2",
  name: "食費",
  amount: 30000,
  kind: "variable",
  createdAt: "2026-05-01T00:00:00.000Z",
  ...overrides,
});

describe("groupBudgetExpenseItemsByKind", () => {
  it("空配列の場合はどちらも空配列になる", () => {
    expect(groupBudgetExpenseItemsByKind([])).toEqual({
      fixedItems: [],
      variableItems: [],
    });
  });

  it("固定費のみの場合、variableItemsは空になる", () => {
    const items = [fixedItem(), fixedItem({ id: "expense-3", name: "保険料" })];

    expect(groupBudgetExpenseItemsByKind(items)).toEqual({
      fixedItems: items,
      variableItems: [],
    });
  });

  it("変動費のみの場合、fixedItemsは空になる", () => {
    const items = [variableItem(), variableItem({ id: "expense-4", name: "娯楽費" })];

    expect(groupBudgetExpenseItemsByKind(items)).toEqual({
      fixedItems: [],
      variableItems: items,
    });
  });

  it("固定費・変動費が混在する場合、それぞれ元の並び順を保ったまま分類する", () => {
    const fixed1 = fixedItem();
    const variable1 = variableItem();
    const fixed2 = fixedItem({ id: "expense-3", name: "保険料" });

    const result = groupBudgetExpenseItemsByKind([fixed1, variable1, fixed2]);

    expect(result.fixedItems).toEqual([fixed1, fixed2]);
    expect(result.variableItems).toEqual([variable1]);
  });
});
