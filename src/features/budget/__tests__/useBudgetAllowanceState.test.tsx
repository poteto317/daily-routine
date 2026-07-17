import { act, renderHook } from "@testing-library/react";
import { useBudgetAllowanceState } from "../useBudgetAllowanceState";
import { getBudgetIncomeItems, getBudgetExpenseItems } from "../storage";
import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";

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

  it("LOCAL_DATA_UPDATED_AT_EVENTを受け取るとstorageを再読み込みし最新値を反映する（クラウド同期・他タブでの更新対応）", () => {
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
    ]);

    const { result } = renderHook(() => useBudgetAllowanceState());

    expect(result.current.monthlyAllowance.allowance).toBe(220000);

    mockGetBudgetIncomeItems.mockReturnValue([
      { id: "income-1", name: "給与", amount: 350000, createdAt: "2026-05-01T00:00:00.000Z" },
    ]);
    mockGetBudgetExpenseItems.mockReturnValue([
      {
        id: "expense-1",
        name: "家賃",
        amount: 100000,
        kind: "fixed",
        createdAt: "2026-05-01T00:00:00.000Z",
      },
    ]);

    act(() => {
      window.dispatchEvent(new CustomEvent(LOCAL_DATA_UPDATED_AT_EVENT));
    });

    expect(mockGetBudgetIncomeItems).toHaveBeenCalledTimes(2);
    expect(mockGetBudgetExpenseItems).toHaveBeenCalledTimes(2);
    expect(result.current.monthlyAllowance.allowance).toBe(250000);
  });

  it("内容が変わっていないLOCAL_DATA_UPDATED_AT_EVENTでは再レンダーしない（無関係なstorage更新による無駄な再計算を防ぐ）", () => {
    const incomeItems = [
      { id: "income-1", name: "給与", amount: 300000, createdAt: "2026-05-01T00:00:00.000Z" },
    ];
    const expenseItems = [
      {
        id: "expense-1",
        name: "家賃",
        amount: 80000,
        kind: "fixed" as const,
        createdAt: "2026-05-01T00:00:00.000Z",
      },
    ];
    mockGetBudgetIncomeItems.mockReturnValue(incomeItems);
    mockGetBudgetExpenseItems.mockReturnValue(expenseItems);

    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount++;
      return useBudgetAllowanceState();
    });

    expect(renderCount).toBe(1);
    const monthlyAllowanceBefore = result.current.monthlyAllowance;

    // LOCAL_DATA_UPDATED_AT_EVENTはアプリ内の無関係なstorage更新でも発火するため、
    // 収入・支出項目の内容自体は変わらないケースを再現する。getBudgetIncomeItems等は
    // storageからJSON.parseされるたびに新しい配列参照を返すが、内容は同一とする。
    mockGetBudgetIncomeItems.mockReturnValue([...incomeItems]);
    mockGetBudgetExpenseItems.mockReturnValue([...expenseItems]);

    act(() => {
      window.dispatchEvent(new CustomEvent(LOCAL_DATA_UPDATED_AT_EVENT));
    });

    expect(mockGetBudgetIncomeItems).toHaveBeenCalledTimes(2);
    expect(mockGetBudgetExpenseItems).toHaveBeenCalledTimes(2);
    expect(renderCount).toBe(1);
    expect(result.current.monthlyAllowance).toBe(monthlyAllowanceBefore);
  });

  it("アンマウント後はLOCAL_DATA_UPDATED_AT_EVENTのリスナーを解除する", () => {
    mockGetBudgetIncomeItems.mockReturnValue([]);
    mockGetBudgetExpenseItems.mockReturnValue([]);

    const { unmount } = renderHook(() => useBudgetAllowanceState());
    unmount();

    mockGetBudgetIncomeItems.mockClear();
    mockGetBudgetExpenseItems.mockClear();

    act(() => {
      window.dispatchEvent(new CustomEvent(LOCAL_DATA_UPDATED_AT_EVENT));
    });

    expect(mockGetBudgetIncomeItems).not.toHaveBeenCalled();
    expect(mockGetBudgetExpenseItems).not.toHaveBeenCalled();
  });
});
