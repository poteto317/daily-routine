import { calculateMonthlyAllowance } from "../utils/monthlyAllowance";
import type { BudgetExpenseItem, BudgetIncomeItem } from "@/types/routine";

const incomeItem = (
  overrides: Partial<BudgetIncomeItem> = {},
): BudgetIncomeItem => ({
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
  ...overrides,
});

const expenseItem = (
  overrides: Partial<BudgetExpenseItem> = {},
): BudgetExpenseItem => ({
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed",
  createdAt: "2026-05-01T00:00:00.000Z",
  ...overrides,
});

describe("calculateMonthlyAllowance", () => {
  it("収入0件・支出項目0件なら全て0になる", () => {
    expect(calculateMonthlyAllowance([], [])).toEqual({
      totalIncome: 0,
      totalFixed: 0,
      totalVariable: 0,
      totalExpenseItems: 0,
      allowance: 0,
    });
  });

  it("収入のみの場合、allowanceは収入合計と一致する", () => {
    const result = calculateMonthlyAllowance(
      [incomeItem({ amount: 300000 }), incomeItem({ id: "income-2", amount: 50000 })],
      [],
    );

    expect(result).toEqual({
      totalIncome: 350000,
      totalFixed: 0,
      totalVariable: 0,
      totalExpenseItems: 0,
      allowance: 350000,
    });
  });

  it("固定費のみの場合、totalVariableは0でallowanceに反映される", () => {
    const result = calculateMonthlyAllowance(
      [incomeItem({ amount: 300000 })],
      [
        expenseItem({ id: "expense-1", amount: 80000, kind: "fixed" }),
        expenseItem({ id: "expense-2", amount: 1000, kind: "fixed" }),
      ],
    );

    expect(result).toEqual({
      totalIncome: 300000,
      totalFixed: 81000,
      totalVariable: 0,
      totalExpenseItems: 81000,
      allowance: 219000,
    });
  });

  it("変動費のみの場合、totalFixedは0でallowanceに反映される", () => {
    const result = calculateMonthlyAllowance(
      [incomeItem({ amount: 300000 })],
      [
        expenseItem({ id: "expense-1", amount: 30000, kind: "variable" }),
        expenseItem({ id: "expense-2", amount: 10000, kind: "variable" }),
      ],
    );

    expect(result).toEqual({
      totalIncome: 300000,
      totalFixed: 0,
      totalVariable: 40000,
      totalExpenseItems: 40000,
      allowance: 260000,
    });
  });

  it("収入・固定費・変動費すべてある場合、正しく合算・按分する", () => {
    const result = calculateMonthlyAllowance(
      [incomeItem({ amount: 300000 }), incomeItem({ id: "income-2", amount: 50000 })],
      [
        expenseItem({ id: "expense-1", amount: 80000, kind: "fixed" }),
        expenseItem({ id: "expense-2", amount: 1000, kind: "fixed" }),
        expenseItem({ id: "expense-3", amount: 30000, kind: "variable" }),
      ],
    );

    expect(result).toEqual({
      totalIncome: 350000,
      totalFixed: 81000,
      totalVariable: 30000,
      totalExpenseItems: 111000,
      allowance: 239000,
    });
  });

  it("固定費・変動費が配列内で交互に並んでいても正しく按分する（単一ループでの集計を検証）", () => {
    const result = calculateMonthlyAllowance(
      [incomeItem({ amount: 300000 })],
      [
        expenseItem({ id: "expense-1", amount: 30000, kind: "variable" }),
        expenseItem({ id: "expense-2", amount: 80000, kind: "fixed" }),
        expenseItem({ id: "expense-3", amount: 10000, kind: "variable" }),
        expenseItem({ id: "expense-4", amount: 1000, kind: "fixed" }),
      ],
    );

    expect(result).toEqual({
      totalIncome: 300000,
      totalFixed: 81000,
      totalVariable: 40000,
      totalExpenseItems: 121000,
      allowance: 179000,
    });
  });

  it("支出が収入を上回る場合、allowanceは負の値になる（赤字）", () => {
    const result = calculateMonthlyAllowance(
      [incomeItem({ amount: 100000 })],
      [
        expenseItem({ id: "expense-1", amount: 80000, kind: "fixed" }),
        expenseItem({ id: "expense-2", amount: 30000, kind: "variable" }),
      ],
    );

    expect(result.allowance).toBe(-10000);
  });
});
