import { act, renderHook } from "@testing-library/react";
import { useBudgetPageState } from "../useBudgetPageState";

jest.mock("../storage", () => ({
  addExpense: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
  getBudgetCategories: jest.fn(() => []),
  getBudgetIncomeItems: jest.fn(() => [
    { id: "income-1", name: "給与", amount: 300000, createdAt: "2026-01-01T00:00:00.000Z" },
  ]),
  getBudgetExpenseItems: jest.fn(() => [
    {
      id: "expense-1",
      name: "家賃",
      amount: 80000,
      kind: "fixed" as const,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ]),
}));

jest.mock("../budgetPageStateHelpers", () => {
  const actual = jest.requireActual("../budgetPageStateHelpers");

  return {
    ...actual,
    getMonthStateSnapshot: jest.fn(),
  };
});

import { addExpense, deleteExpense, updateExpense } from "../storage";
import { getMonthStateSnapshot } from "../budgetPageStateHelpers";

const mockAddExpense = addExpense as jest.MockedFunction<typeof addExpense>;
const mockUpdateExpense = updateExpense as jest.MockedFunction<
  typeof updateExpense
>;
const mockDeleteExpense = deleteExpense as jest.MockedFunction<
  typeof deleteExpense
>;
const mockGetMonthStateSnapshot = getMonthStateSnapshot as jest.MockedFunction<
  typeof getMonthStateSnapshot
>;

describe("useBudgetPageState", () => {
  let mockNavigate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));

    mockGetMonthStateSnapshot.mockImplementation((date) => {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (monthKey === "2026-04") {
        return {
          monthKey,
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
    const { result } = renderHook(() => useBudgetPageState({ navigate: mockNavigate }));

    expect(result.current.expenses).toHaveLength(1);
    expect(result.current.expenseDate).toBe("2026-03-07");

    act(() => {
      result.current.openExpenseForm();
      result.current.handleExpenseAmountChange("1200");
      result.current.handleExpenseCategoryIdChange("category-lunch");
      result.current.closeExpenseForm();
    });

    expect(result.current.showExpenseForm).toBe(false);
    expect(result.current.expenseAmount).toBe("");
    expect(result.current.expenseCategoryId).toBe("");
  });

  it("有効な支出を追加してフォームをリセットする", () => {
    const { result } = renderHook(() => useBudgetPageState({ navigate: mockNavigate }));

    act(() => {
      result.current.openExpenseForm();
      result.current.handleExpenseAmountChange("2500");
      result.current.handleExpenseCategoryIdChange("category-books");
      result.current.handleExpenseDateChange("2026-03-05");
    });

    act(() => {
      result.current.handleAddExpense();
    });

    expect(mockAddExpense).toHaveBeenCalledWith(
      "2026-03-05",
      2500,
      "category-books",
    );
    expect(result.current.expenses).toEqual([
      expect.objectContaining({ id: "e-mar", amount: 1000 }),
    ]);
    expect(result.current.expenseAmount).toBe("");
    expect(result.current.expenseCategoryId).toBe("");
    expect(result.current.showExpenseForm).toBe(false);
  });

  it("無効な支出では追加しない", () => {
    const { result } = renderHook(() => useBudgetPageState({ navigate: mockNavigate }));

    act(() => {
      result.current.handleExpenseAmountChange("");
      result.current.handleAddExpense();
    });

    expect(mockAddExpense).not.toHaveBeenCalled();
  });

  it("支出削除後に一覧を再取得する", () => {
    const { result } = renderHook(() => useBudgetPageState({ navigate: mockNavigate }));

    act(() => {
      result.current.handleDeleteExpense("e-mar");
    });

    expect(mockDeleteExpense).toHaveBeenCalledWith("2026-03", "e-mar");
    expect(result.current.expenses).toEqual([
      expect.objectContaining({ id: "e-mar", amount: 1000 }),
    ]);
  });

  it("月移動でスナップショット(支出・デフォルト日付)を同期する", () => {
    const { result } = renderHook(() => useBudgetPageState({ navigate: mockNavigate }));

    act(() => {
      result.current.goToNextMonth();
    });

    expect(result.current.currentDate.getMonth()).toBe(3);
    expect(result.current.expenseDate).toBe("2026-04-01");
    expect(result.current.expenses).toEqual([
      expect.objectContaining({ id: "e-apr", amount: 3000 }),
    ]);

    act(() => {
      result.current.goToPreviousMonth();
    });

    expect(result.current.currentDate.getMonth()).toBe(2);

    act(() => {
      result.current.goToCurrentMonth();
    });

    expect(result.current.currentDate.getMonth()).toBe(2);
    expect(result.current.currentDate.getDate()).toBe(7);
  });

  it("支出の編集を開始・入力変更・保存できる", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.startEditExpense({
        id: "e-mar",
        date: "2026-03-03",
        amount: 1000,
        createdAt: "2026-03-03T00:00:00.000Z",
      });
    });

    expect(result.current.editingExpenseId).toBe("e-mar");
    expect(result.current.editingExpenseDate).toBe("2026-03-03");
    expect(result.current.editingExpenseAmount).toBe("1000");
    expect(result.current.editingExpenseCategoryId).toBe("");
    // usedTime未設定の既存支出なので、createdAtの時刻部分（ローカル）へ
    // フォールバックする（"2026-03-03T00:00:00.000Z" はJSTで09:00）。
    expect(result.current.editingExpenseUsedTime).toBe("09:00");

    act(() => {
      result.current.handleEditExpenseDateChange("2026-03-10");
      result.current.handleEditExpenseAmountChange("2000");
      result.current.handleEditExpenseCategoryIdChange("category-books");
    });

    act(() => {
      result.current.handleUpdateExpense();
    });

    expect(mockUpdateExpense).toHaveBeenCalledWith("2026-03", "e-mar", {
      date: "2026-03-10",
      amount: 2000,
      categoryId: "category-books",
      usedTime: "09:00",
    });
    expect(result.current.editingExpenseId).toBeNull();
  });

  it("支出編集で使用時刻を変更して保存すると、新しい使用時刻で保存される", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.startEditExpense({
        id: "e-mar",
        date: "2026-03-03",
        amount: 1000,
        createdAt: "2026-03-03T00:00:00.000Z",
      });
    });

    act(() => {
      result.current.handleEditExpenseUsedTimeChange("21:45");
    });

    expect(result.current.editingExpenseUsedTime).toBe("21:45");

    act(() => {
      result.current.handleUpdateExpense();
    });

    expect(mockUpdateExpense).toHaveBeenCalledWith(
      "2026-03",
      "e-mar",
      expect.objectContaining({ usedTime: "21:45" }),
    );
  });

  it("支出編集を開始する時、既にusedTimeが設定済みの支出はその値をそのまま使う", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.startEditExpense({
        id: "e-mar",
        date: "2026-03-03",
        amount: 1000,
        createdAt: "2026-03-03T00:00:00.000Z",
        usedTime: "15:30",
      });
    });

    expect(result.current.editingExpenseUsedTime).toBe("15:30");
  });

  it("無効な金額では支出の編集を保存せず編集を継続する", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.startEditExpense({
        id: "e-mar",
        date: "2026-03-03",
        amount: 1000,
        createdAt: "2026-03-03T00:00:00.000Z",
      });
    });

    act(() => {
      result.current.handleEditExpenseAmountChange("0");
    });

    act(() => {
      result.current.handleUpdateExpense();
    });

    expect(mockUpdateExpense).not.toHaveBeenCalled();
    expect(result.current.editingExpenseId).toBe("e-mar");
  });

  it("支出の編集をキャンセルすると保存せず編集対象を解除する", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.startEditExpense({
        id: "e-mar",
        date: "2026-03-03",
        amount: 1000,
        createdAt: "2026-03-03T00:00:00.000Z",
      });
    });

    act(() => {
      result.current.cancelEditExpense();
    });

    expect(mockUpdateExpense).not.toHaveBeenCalled();
    expect(result.current.editingExpenseId).toBeNull();
  });

  it("編集開始時に支出追加フォームを閉じる", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.openExpenseForm();
    });
    expect(result.current.showExpenseForm).toBe(true);

    act(() => {
      result.current.startEditExpense({
        id: "e-mar",
        date: "2026-03-03",
        amount: 1000,
        createdAt: "2026-03-03T00:00:00.000Z",
      });
    });

    expect(result.current.showExpenseForm).toBe(false);
    expect(result.current.editingExpenseId).toBe("e-mar");
  });

  it("支出追加フォームを開くと編集中の行をキャンセルする", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.startEditExpense({
        id: "e-mar",
        date: "2026-03-03",
        amount: 1000,
        createdAt: "2026-03-03T00:00:00.000Z",
      });
    });
    expect(result.current.editingExpenseId).toBe("e-mar");

    act(() => {
      result.current.openExpenseForm();
    });

    expect(result.current.editingExpenseId).toBeNull();
    expect(result.current.showExpenseForm).toBe(true);
  });

  it("カテゴリ管理へ遷移できる", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.navigateToCategoryManagement();
    });

    expect(mockNavigate).toHaveBeenCalledWith("budget-category-management");
  });

  it("月次サマリーへ遷移できる", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.navigateToSummary();
    });

    expect(mockNavigate).toHaveBeenCalledWith("budget-summary");
  });
});
