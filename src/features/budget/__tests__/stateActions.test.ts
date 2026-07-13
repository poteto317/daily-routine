import type { MonthStateSnapshot } from "../budgetPageStateHelpers";
import {
  addExpenseFromInput,
  applyMonthSnapshot,
  closeBudgetInputForm,
  closeExpenseInputForm,
  deleteExpenseAndRefresh,
  navigateBudgetMonth,
  openBudgetInputForm,
  saveBudgetFromInput,
  syncBudgetMonthData,
  updateExpenseFromInput,
} from "../stateActions";

const snapshot: MonthStateSnapshot = {
  monthKey: "2026-03",
  monthBudget: 30000,
  expenses: [
    {
      id: "e1",
      date: "2026-03-07",
      amount: 1200,
      createdAt: "2026-03-07T00:00:00.000Z",
    },
  ],
  defaultExpenseDate: "2026-03-07",
};

describe("budget stateActions", () => {
  it("月スナップショットを state setter へ反映する", () => {
    const setMonthBudget = jest.fn();
    const setExpenses = jest.fn();
    const setExpenseDate = jest.fn();

    applyMonthSnapshot({
      snapshot,
      setMonthBudget,
      setExpenses,
      setExpenseDate,
    });

    expect(setMonthBudget).toHaveBeenCalledWith(30000);
    expect(setExpenses).toHaveBeenCalledWith(snapshot.expenses);
    expect(setExpenseDate).toHaveBeenCalledWith("2026-03-07");
  });

  it("日付から月スナップショットを再同期する", () => {
    const getSnapshot = jest.fn(() => snapshot);
    const setMonthBudget = jest.fn();
    const setExpenses = jest.fn();
    const setExpenseDate = jest.fn();
    const date = new Date("2026-03-07T00:00:00.000Z");

    expect(
      syncBudgetMonthData({
        date,
        getSnapshot,
        setMonthBudget,
        setExpenses,
        setExpenseDate,
      }),
    ).toBe(snapshot);

    expect(getSnapshot).toHaveBeenCalledWith(date);
    expect(setMonthBudget).toHaveBeenCalledWith(30000);
  });

  it("予算入力フォームを開閉する", () => {
    const setBudgetInputValue = jest.fn();
    const setShowBudgetInput = jest.fn();

    openBudgetInputForm({
      monthBudget: 30000,
      getInitialValue: (value) => String(value),
      setBudgetInputValue,
      setShowBudgetInput,
    });

    expect(setBudgetInputValue).toHaveBeenCalledWith("30000");
    expect(setShowBudgetInput).toHaveBeenCalledWith(true);

    closeBudgetInputForm({ setShowBudgetInput, setBudgetInputValue });

    expect(setShowBudgetInput).toHaveBeenLastCalledWith(false);
    expect(setBudgetInputValue).toHaveBeenLastCalledWith("");
  });

  it("支出フォームを閉じると入力をリセットする", () => {
    const setShowExpenseForm = jest.fn();
    const setExpenseAmount = jest.fn();
    const setExpenseCategoryId = jest.fn();

    closeExpenseInputForm({
      setShowExpenseForm,
      setExpenseAmount,
      setExpenseCategoryId,
    });

    expect(setShowExpenseForm).toHaveBeenCalledWith(false);
    expect(setExpenseAmount).toHaveBeenCalledWith("");
    expect(setExpenseCategoryId).toHaveBeenCalledWith("");
  });

  it("月移動時に日付更新と再同期を行う", () => {
    const setCurrentDate = jest.fn();
    const syncMonthData = jest.fn();
    const nextDate = new Date("2026-04-01T00:00:00.000Z");

    navigateBudgetMonth({ nextDate, setCurrentDate, syncMonthData });

    expect(setCurrentDate).toHaveBeenCalledWith(nextDate);
    expect(syncMonthData).toHaveBeenCalledWith(nextDate);
  });

  it("有効な予算入力だけ保存する", () => {
    const saveBudget = jest.fn();
    const setMonthBudget = jest.fn();
    const closeBudgetInput = jest.fn();

    expect(
      saveBudgetFromInput({
        currentMonth: "2026-03",
        budgetInputValue: "45000",
        buildPayload: (monthKey, value) => ({
          monthKey,
          amount: Number(value),
        }),
        saveBudget,
        setMonthBudget,
        closeBudgetInput,
      }),
    ).toBe(true);

    expect(saveBudget).toHaveBeenCalledWith("2026-03", 45000);
    expect(setMonthBudget).toHaveBeenCalledWith(45000);
    expect(closeBudgetInput).toHaveBeenCalled();

    expect(
      saveBudgetFromInput({
        currentMonth: "2026-03",
        budgetInputValue: "0",
        buildPayload: () => null,
        saveBudget,
        setMonthBudget,
        closeBudgetInput,
      }),
    ).toBe(false);
  });

  it("有効な支出入力だけ保存して一覧を更新する", () => {
    const saveExpense = jest.fn();
    const getSnapshot = jest.fn(() => snapshot);
    const setExpenses = jest.fn();
    const closeExpenseForm = jest.fn();
    const currentDate = new Date("2026-03-07T00:00:00.000Z");

    expect(
      addExpenseFromInput({
        expenseAmount: "2500",
        expenseDate: "2026-03-05",
        expenseCategoryId: "category-books",
        buildPayload: ({ expenseAmount, expenseDate, expenseCategoryId }) => ({
          amount: Number(expenseAmount),
          date: expenseDate,
          categoryId: expenseCategoryId || undefined,
        }),
        saveExpense,
        currentDate,
        getSnapshot,
        setExpenses,
        closeExpenseForm,
      }),
    ).toBe(true);

    expect(saveExpense).toHaveBeenCalledWith(
      "2026-03-05",
      2500,
      "category-books",
    );
    expect(setExpenses).toHaveBeenCalledWith(snapshot.expenses);
    expect(closeExpenseForm).toHaveBeenCalled();

    expect(
      addExpenseFromInput({
        expenseAmount: "",
        expenseDate: "2026-03-05",
        expenseCategoryId: "",
        buildPayload: () => null,
        saveExpense,
        currentDate,
        getSnapshot,
        setExpenses,
        closeExpenseForm,
      }),
    ).toBe(false);
  });

  it("有効な支出編集だけ保存して一覧を更新し編集を閉じる", () => {
    const saveExpense = jest.fn();
    const getSnapshot = jest.fn(() => snapshot);
    const setExpenses = jest.fn();
    const closeExpenseEdit = jest.fn();
    const currentDate = new Date("2026-03-07T00:00:00.000Z");

    expect(
      updateExpenseFromInput({
        currentMonth: "2026-03",
        expenseId: "e1",
        expenseAmount: "2500",
        expenseDate: "2026-03-05",
        expenseCategoryId: "category-books",
        buildPayload: ({ expenseAmount, expenseDate, expenseCategoryId }) => ({
          amount: Number(expenseAmount),
          date: expenseDate,
          categoryId: expenseCategoryId || undefined,
        }),
        saveExpense,
        currentDate,
        getSnapshot,
        setExpenses,
        closeExpenseEdit,
      }),
    ).toBe(true);

    expect(saveExpense).toHaveBeenCalledWith(
      "2026-03",
      "e1",
      "2026-03-05",
      2500,
      "category-books",
    );
    expect(setExpenses).toHaveBeenCalledWith(snapshot.expenses);
    expect(closeExpenseEdit).toHaveBeenCalled();
  });

  it("無効な支出編集では何も保存せず編集を開いたままにする", () => {
    const saveExpense = jest.fn();
    const getSnapshot = jest.fn(() => snapshot);
    const setExpenses = jest.fn();
    const closeExpenseEdit = jest.fn();

    expect(
      updateExpenseFromInput({
        currentMonth: "2026-03",
        expenseId: "e1",
        expenseAmount: "",
        expenseDate: "2026-03-05",
        expenseCategoryId: "",
        buildPayload: () => null,
        saveExpense,
        currentDate: new Date("2026-03-07T00:00:00.000Z"),
        getSnapshot,
        setExpenses,
        closeExpenseEdit,
      }),
    ).toBe(false);

    expect(saveExpense).not.toHaveBeenCalled();
    expect(setExpenses).not.toHaveBeenCalled();
    expect(closeExpenseEdit).not.toHaveBeenCalled();
  });

  it("支出削除後に一覧を更新する", () => {
    const removeExpense = jest.fn();
    const getSnapshot = jest.fn(() => snapshot);
    const setExpenses = jest.fn();
    const currentDate = new Date("2026-03-07T00:00:00.000Z");

    deleteExpenseAndRefresh({
      currentMonth: "2026-03",
      expenseId: "e1",
      deleteExpense: removeExpense,
      currentDate,
      getSnapshot,
      setExpenses,
    });

    expect(removeExpense).toHaveBeenCalledWith("2026-03", "e1");
    expect(setExpenses).toHaveBeenCalledWith(snapshot.expenses);
  });
});
