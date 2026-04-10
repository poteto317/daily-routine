import { act, renderHook } from "@testing-library/react";
import { useBudgetPageState } from "../useBudgetPageState";

jest.mock("../storage", () => ({
  addExpense: jest.fn(),
  deleteExpense: jest.fn(),
  setMonthlyBudget: jest.fn(),
}));

jest.mock("../budgetPageStateHelpers", () => {
  const actual = jest.requireActual("../budgetPageStateHelpers");

  return {
    ...actual,
    getMonthStateSnapshot: jest.fn(),
  };
});

import { addExpense, deleteExpense, setMonthlyBudget } from "../storage";
import { getMonthStateSnapshot } from "../budgetPageStateHelpers";

const mockAddExpense = addExpense as jest.MockedFunction<typeof addExpense>;
const mockDeleteExpense = deleteExpense as jest.MockedFunction<
  typeof deleteExpense
>;
const mockSetMonthlyBudget = setMonthlyBudget as jest.MockedFunction<
  typeof setMonthlyBudget
>;
const mockGetMonthStateSnapshot = getMonthStateSnapshot as jest.MockedFunction<
  typeof getMonthStateSnapshot
>;

describe("useBudgetPageState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));

    mockGetMonthStateSnapshot.mockImplementation((date) => {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (monthKey === "2026-04") {
        return {
          monthKey,
          monthBudget: 50000,
          expenses: [
            {
              id: "e-apr",
              date: "2026-04-01",
              amount: 3000,
              createdAt: "2026-04-01T00:00:00.000Z",
            },
          ],
          defaultExpenseDate: "2026-04-01",
        };
      }

      return {
        monthKey,
        monthBudget: 30000,
        expenses: [
          {
            id: "e-mar",
            date: "2026-03-03",
            amount: 1000,
            createdAt: "2026-03-03T00:00:00.000Z",
          },
        ],
        defaultExpenseDate: "2026-03-07",
      };
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("初期状態とフォーム開閉を扱える", () => {
    const { result } = renderHook(() => useBudgetPageState());

    expect(result.current.monthBudget).toBe(30000);
    expect(result.current.expenses).toHaveLength(1);
    expect(result.current.expenseDate).toBe("2026-03-07");

    act(() => {
      result.current.openBudgetInput();
    });
    expect(result.current.showBudgetInput).toBe(true);
    expect(result.current.budgetInputValue).toBe("30000");

    act(() => {
      result.current.closeBudgetInput();
      result.current.openExpenseForm();
      result.current.handleExpenseAmountChange("1200");
      result.current.handleExpenseDescriptionChange("ランチ");
      result.current.closeExpenseForm();
    });

    expect(result.current.showBudgetInput).toBe(false);
    expect(result.current.showExpenseForm).toBe(false);
    expect(result.current.expenseAmount).toBe("");
    expect(result.current.expenseDescription).toBe("");
  });

  it("有効な予算入力を保存する", () => {
    const { result } = renderHook(() => useBudgetPageState());

    act(() => {
      result.current.openBudgetInput();
      result.current.handleBudgetInputChange("45000");
    });

    act(() => {
      result.current.handleSaveBudget();
    });

    expect(mockSetMonthlyBudget).toHaveBeenCalledWith("2026-03", 45000);
    expect(result.current.monthBudget).toBe(45000);
    expect(result.current.budgetInputValue).toBe("");
    expect(result.current.showBudgetInput).toBe(false);
  });

  it("無効な予算入力では保存しない", () => {
    const { result } = renderHook(() => useBudgetPageState());

    act(() => {
      result.current.handleBudgetInputChange("0");
      result.current.handleSaveBudget();
    });

    expect(mockSetMonthlyBudget).not.toHaveBeenCalled();
  });

  it("有効な支出を追加してフォームをリセットする", () => {
    const { result } = renderHook(() => useBudgetPageState());

    act(() => {
      result.current.openExpenseForm();
      result.current.handleExpenseAmountChange("2500");
      result.current.handleExpenseDescriptionChange("書籍");
      result.current.handleExpenseDateChange("2026-03-05");
    });

    act(() => {
      result.current.handleAddExpense();
    });

    expect(mockAddExpense).toHaveBeenCalledWith(
      "2026-03-05",
      2500,
      undefined,
      "書籍",
    );
    expect(result.current.expenses).toEqual([
      expect.objectContaining({ id: "e-mar", amount: 1000 }),
    ]);
    expect(result.current.expenseAmount).toBe("");
    expect(result.current.expenseDescription).toBe("");
    expect(result.current.showExpenseForm).toBe(false);
  });

  it("無効な支出では追加しない", () => {
    const { result } = renderHook(() => useBudgetPageState());

    act(() => {
      result.current.handleExpenseAmountChange("");
      result.current.handleAddExpense();
    });

    expect(mockAddExpense).not.toHaveBeenCalled();
  });

  it("支出削除後に一覧を再取得する", () => {
    const { result } = renderHook(() => useBudgetPageState());

    act(() => {
      result.current.handleDeleteExpense("e-mar");
    });

    expect(mockDeleteExpense).toHaveBeenCalledWith("2026-03", "e-mar");
    expect(result.current.expenses).toEqual([
      expect.objectContaining({ id: "e-mar", amount: 1000 }),
    ]);
  });

  it("月移動でスナップショットを同期する", () => {
    const { result } = renderHook(() => useBudgetPageState());

    act(() => {
      result.current.goToNextMonth();
    });

    expect(result.current.currentDate.getMonth()).toBe(3);
    expect(result.current.monthBudget).toBe(50000);
    expect(result.current.expenseDate).toBe("2026-04-01");
    expect(result.current.expenses).toEqual([
      expect.objectContaining({ id: "e-apr", amount: 3000 }),
    ]);

    act(() => {
      result.current.goToPreviousMonth();
    });

    expect(result.current.currentDate.getMonth()).toBe(2);
    expect(result.current.monthBudget).toBe(30000);

    act(() => {
      result.current.goToCurrentMonth();
    });

    expect(result.current.currentDate.getMonth()).toBe(2);
    expect(result.current.currentDate.getDate()).toBe(7);
  });
});
