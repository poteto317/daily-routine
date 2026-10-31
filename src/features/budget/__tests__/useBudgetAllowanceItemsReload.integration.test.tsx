import { act, renderHook } from "@testing-library/react";
import {
  getBudgetExpenseItems,
  getBudgetIncomeItems,
  saveBudgetExpenseItems,
  saveBudgetIncomeItems,
} from "../storage";
import { useBudgetExpenseItemManagementPageState } from "../useBudgetExpenseItemManagementPageState";
import { useBudgetIncomeItemManagementPageState } from "../useBudgetIncomeItemManagementPageState";

const incomeItem = {
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
};
const reloadedIncomeItem = {
  id: "income-2",
  name: "読み込んだ収入",
  amount: 100000,
  createdAt: "2026-05-02T00:00:00.000Z",
};
const expenseItem = {
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed" as const,
  createdAt: "2026-05-01T00:00:00.000Z",
};
const reloadedExpenseItem = {
  id: "expense-2",
  name: "読み込んだ支出",
  amount: 20000,
  kind: "variable" as const,
  createdAt: "2026-05-02T00:00:00.000Z",
};

describe("収入項目の reloadItems", () => {
  beforeEach(() => {
    localStorage.clear();
    saveBudgetIncomeItems([incomeItem]);
  });

  it("開いたフォームと編集中の行を閉じる", () => {
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementPageState(),
    );
    act(() => {
      result.current.openForm();
      result.current.startEditItem(incomeItem);
    });
    expect(result.current.showForm).toBe(true);
    expect(result.current.editingItemId).toBe("income-1");

    act(() => {
      result.current.reloadItems();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.editingItemId).toBeNull();
  });

  it("読み直した後に項目を追加しても、読み直した項目が残る", () => {
    // 古い一覧を基に保存すると、取り込んだ内容が消えてしまう
    const { result } = renderHook(() =>
      useBudgetIncomeItemManagementPageState(),
    );
    saveBudgetIncomeItems([reloadedIncomeItem]);

    act(() => {
      result.current.reloadItems();
    });
    expect(result.current.items).toEqual([reloadedIncomeItem]);

    act(() => {
      result.current.openForm();
      result.current.setNameInput("副業");
      result.current.setAmountInput("50000");
    });
    act(() => {
      result.current.handleCreate();
    });

    expect(getBudgetIncomeItems().map((item) => item.name)).toEqual([
      "読み込んだ収入",
      "副業",
    ]);
  });
});

describe("支出項目の reloadItems", () => {
  beforeEach(() => {
    localStorage.clear();
    saveBudgetExpenseItems([expenseItem]);
  });

  it("開いたフォームと編集中の行を閉じる", () => {
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementPageState(),
    );
    act(() => {
      result.current.openForm("fixed");
      result.current.startEditItem(expenseItem);
    });
    expect(result.current.showForm).toBe(true);
    expect(result.current.editingItemId).toBe("expense-1");

    act(() => {
      result.current.reloadItems();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.editingItemId).toBeNull();
  });

  it("読み直した後に項目を追加しても、読み直した項目が残る", () => {
    // 古い一覧を基に保存すると、取り込んだ内容が消えてしまう
    const { result } = renderHook(() =>
      useBudgetExpenseItemManagementPageState(),
    );
    saveBudgetExpenseItems([reloadedExpenseItem]);

    act(() => {
      result.current.reloadItems();
    });
    expect(result.current.items).toEqual([reloadedExpenseItem]);

    act(() => {
      result.current.openForm("fixed");
      result.current.setNameInput("保険");
      result.current.setAmountInput("5000");
    });
    act(() => {
      result.current.handleCreate();
    });

    expect(getBudgetExpenseItems().map((item) => item.name)).toEqual([
      "読み込んだ支出",
      "保険",
    ]);
  });
});
