import { renderHook } from "@testing-library/react";
import { useBudgetAllowanceState } from "../useBudgetAllowanceState";
import { getBudgetIncomeItems, getBudgetExpenseItems } from "../storage";

jest.mock("../storage", () => ({
  getBudgetIncomeItems: jest.fn(),
  getBudgetExpenseItems: jest.fn(),
}));

const mockGetBudgetIncomeItems = getBudgetIncomeItems as jest.MockedFunction<
  typeof getBudgetIncomeItems
>;
const mockGetBudgetExpenseItems = getBudgetExpenseItems as jest.MockedFunction<
  typeof getBudgetExpenseItems
>;

describe("useBudgetAllowanceState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("収入項目・支出項目からmonthlyAllowanceを計算する", () => {
    mockGetBudgetIncomeItems.mockReturnValue([
      { id: "income-1", name: "給与", amount: 300000, createdAt: "2026-05-01T00:00:00.000Z" },
    ]);
    mockGetBudgetExpenseItems.mockReturnValue([
      {
        id: "expense-1",
        name: "家賃",
        amount: 80000,
        kind: "fixed",
        createdAt: "2026-05-01T00:00:00.000Z",
      },
      {
        id: "expense-2",
        name: "食費",
        amount: 30000,
        kind: "variable",
        createdAt: "2026-05-01T00:00:00.000Z",
      },
    ]);

    const { result } = renderHook(() => useBudgetAllowanceState());

    expect(result.current.monthlyAllowance).toEqual({
      totalIncome: 300000,
      totalFixed: 80000,
      totalVariable: 30000,
      totalExpenseItems: 110000,
      allowance: 190000,
    });
  });

  it("項目が0件の場合はすべて0になる", () => {
    mockGetBudgetIncomeItems.mockReturnValue([]);
    mockGetBudgetExpenseItems.mockReturnValue([]);

    const { result } = renderHook(() => useBudgetAllowanceState());

    expect(result.current.monthlyAllowance).toEqual({
      totalIncome: 0,
      totalFixed: 0,
      totalVariable: 0,
      totalExpenseItems: 0,
      allowance: 0,
    });
  });

  it("マウント時に一度だけstorageを読み込む", () => {
    mockGetBudgetIncomeItems.mockReturnValue([]);
    mockGetBudgetExpenseItems.mockReturnValue([]);

    const { rerender } = renderHook(() => useBudgetAllowanceState());
    rerender();
    rerender();

    expect(mockGetBudgetIncomeItems).toHaveBeenCalledTimes(1);
    expect(mockGetBudgetExpenseItems).toHaveBeenCalledTimes(1);
  });
});
