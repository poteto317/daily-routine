import { act, renderHook } from "@testing-library/react";
import { useBudgetPageState } from "../useBudgetPageState";

jest.mock("../storage", () => ({
  addExpense: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
  getBudgetCategories: jest.fn(() => []),
  getBudgetIncomeItems: jest.fn(() => [
    {
      id: "income-1",
      name: "給与",
      amount: 300000,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
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
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

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
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

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
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.handleExpenseAmountChange("");
      result.current.handleAddExpense();
    });

    expect(mockAddExpense).not.toHaveBeenCalled();
  });

  it("今日より前の日付なら、0 円の支出（支出が無かった日）を追加できる", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.openExpenseForm();
      result.current.handleExpenseAmountChange("0");
      result.current.handleExpenseDateChange("2026-03-05");
    });

    act(() => {
      result.current.handleAddExpense();
    });

    expect(mockAddExpense).toHaveBeenCalledWith("2026-03-05", 0, undefined);
    expect(result.current.showExpenseForm).toBe(false);
  });

  it("今日の日付では、0 円の支出を追加せず、フォームを開いたままにする", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.openExpenseForm();
      result.current.handleExpenseAmountChange("0");
      result.current.handleExpenseDateChange("2026-03-07");
    });

    act(() => {
      result.current.handleAddExpense();
    });

    expect(mockAddExpense).not.toHaveBeenCalled();
    expect(result.current.showExpenseForm).toBe(true);
  });

  it("支出削除後に一覧を再取得する", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

    act(() => {
      result.current.handleDeleteExpense("e-mar");
    });

    expect(mockDeleteExpense).toHaveBeenCalledWith("2026-03", "e-mar");
    expect(result.current.expenses).toEqual([
      expect.objectContaining({ id: "e-mar", amount: 1000 }),
    ]);
  });

  it("月移動でスナップショット(支出・デフォルト日付)を同期する", () => {
    const { result } = renderHook(() =>
      useBudgetPageState({ navigate: mockNavigate }),
    );

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
    });
    expect(result.current.editingExpenseId).toBeNull();
  });

  it("支出を編集して保存しても、追加時刻（usedTime）は更新内容に含めない（既存の値が保たれる）", () => {
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
    expect(result.current).not.toHaveProperty("editingExpenseUsedTime");
    expect(result.current).not.toHaveProperty(
      "handleEditExpenseUsedTimeChange",
    );

    act(() => {
      result.current.handleUpdateExpense();
    });

    expect(mockUpdateExpense).toHaveBeenCalledTimes(1);
    expect(mockUpdateExpense.mock.calls[0][2]).not.toHaveProperty("usedTime");
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
      result.current.handleEditExpenseAmountChange("-100");
    });

    act(() => {
      result.current.handleUpdateExpense();
    });

    expect(mockUpdateExpense).not.toHaveBeenCalled();
    expect(result.current.editingExpenseId).toBe("e-mar");
  });

  it("支出の編集で、過去の日付の金額を 0 円にして保存できる", () => {
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

    expect(mockUpdateExpense).toHaveBeenCalledWith(
      "2026-03",
      "e-mar",
      expect.objectContaining({ amount: 0, date: "2026-03-03" }),
    );
    expect(result.current.editingExpenseId).toBeNull();
  });

  it("支出の編集で、日付を今日にして金額を 0 円にすると、保存せず編集を継続する", () => {
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
      result.current.handleEditExpenseDateChange("2026-03-07");
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

  describe("未入力の日", () => {
    it("今月の 1 日〜昨日のうち、支出の記録が無い日を返す。次月へ移動すると [] になる", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      // 今日は 2026-03-07。3 日だけ記録がある
      expect(result.current.missingExpenseDates).toEqual([
        "2026-03-01",
        "2026-03-02",
        "2026-03-04",
        "2026-03-05",
        "2026-03-06",
      ]);

      act(() => {
        result.current.goToNextMonth();
      });

      expect(result.current.missingExpenseDates).toEqual([]);
    });

    it("startAddExpenseOnDate で、その日付を入れて追加フォームを開く", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.startAddExpenseOnDate("2026-03-02");
      });

      expect(result.current.showExpenseForm).toBe(true);
      expect(result.current.expenseDate).toBe("2026-03-02");
    });

    it("編集中に startAddExpenseOnDate を呼ぶと、編集を閉じて追加フォームを開く", () => {
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
        result.current.startAddExpenseOnDate("2026-03-04");
      });

      expect(result.current.editingExpenseId).toBeNull();
      expect(result.current.showExpenseForm).toBe(true);
      expect(result.current.expenseDate).toBe("2026-03-04");
    });

    it("追加フォームに金額を入れたまま別の日付で開き直すと、日付だけが変わり金額とカテゴリは残る", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.startAddExpenseOnDate("2026-03-01");
        result.current.handleExpenseAmountChange("800");
        result.current.handleExpenseCategoryIdChange("category-lunch");
      });
      act(() => {
        result.current.startAddExpenseOnDate("2026-03-05");
      });

      expect(result.current.expenseDate).toBe("2026-03-05");
      expect(result.current.expenseAmount).toBe("800");
      expect(result.current.expenseCategoryId).toBe("category-lunch");
      expect(result.current.showExpenseForm).toBe(true);
    });

    it("日付ボタンで開いてキャンセルしたあと「➕」で開くと、押した日付ではなく今日の日付で開く", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.startAddExpenseOnDate("2026-03-03");
      });
      expect(result.current.expenseDate).toBe("2026-03-03");

      act(() => {
        result.current.closeExpenseForm();
      });
      act(() => {
        result.current.openExpenseForm();
      });

      expect(result.current.showExpenseForm).toBe(true);
      expect(result.current.expenseDate).toBe("2026-03-07");
    });

    it("日付欄を手で変えて閉じたあと「➕」で開いても、今日の日付に戻る", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.openExpenseForm();
        result.current.handleExpenseDateChange("2026-03-05");
      });
      expect(result.current.expenseDate).toBe("2026-03-05");

      act(() => {
        result.current.closeExpenseForm();
      });
      act(() => {
        result.current.openExpenseForm();
      });

      expect(result.current.expenseDate).toBe("2026-03-07");
    });

    it("今月以外を表示中は、「➕」で開くとその月の 1 日の日付で開く", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.goToNextMonth();
      });
      act(() => {
        result.current.openExpenseForm();
      });
      act(() => {
        result.current.handleExpenseDateChange("2026-04-15");
      });
      expect(result.current.expenseDate).toBe("2026-04-15");
      act(() => {
        result.current.closeExpenseForm();
      });
      act(() => {
        result.current.openExpenseForm();
      });

      expect(result.current.expenseDate).toBe("2026-04-01");
    });

    it("startAddExpenseOnDate は、直前に「➕」で開いていても押した日付で開く", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.openExpenseForm();
      });
      act(() => {
        result.current.startAddExpenseOnDate("2026-03-02");
      });

      expect(result.current.showExpenseForm).toBe(true);
      expect(result.current.expenseDate).toBe("2026-03-02");
    });
  });
  describe("formOpenRequest（フォームを開く操作のカウンタ）", () => {
    it("初期値は 0", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      expect(result.current.formOpenRequest).toBe(0);
    });

    it("startAddExpenseOnDate のたびに 1 増える（同じ日付の押し直しでも増える）", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.startAddExpenseOnDate("2026-03-02");
      });
      expect(result.current.formOpenRequest).toBe(1);

      act(() => {
        result.current.startAddExpenseOnDate("2026-03-02");
      });
      expect(result.current.formOpenRequest).toBe(2);

      act(() => {
        result.current.startAddExpenseOnDate("2026-03-04");
      });
      expect(result.current.formOpenRequest).toBe(3);
    });

    it("openExpenseForm（「➕」）のたびに 1 増える", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.openExpenseForm();
      });
      expect(result.current.formOpenRequest).toBe(1);

      act(() => {
        result.current.closeExpenseForm();
      });
      act(() => {
        result.current.openExpenseForm();
      });
      expect(result.current.formOpenRequest).toBe(2);
    });

    it("月の移動・日付欄の手動変更・編集の開始では増えない", () => {
      const { result } = renderHook(() =>
        useBudgetPageState({ navigate: mockNavigate }),
      );

      act(() => {
        result.current.startAddExpenseOnDate("2026-03-02");
      });
      expect(result.current.formOpenRequest).toBe(1);

      act(() => {
        result.current.goToPreviousMonth();
      });
      act(() => {
        result.current.goToNextMonth();
      });
      act(() => {
        result.current.goToCurrentMonth();
      });
      act(() => {
        result.current.handleExpenseDateChange("2026-03-05");
      });
      act(() => {
        result.current.startEditExpense({
          id: "e-mar",
          date: "2026-03-03",
          amount: 1000,
          createdAt: "2026-03-03T00:00:00.000Z",
        });
      });

      expect(result.current.formOpenRequest).toBe(1);
    });
  });
});
