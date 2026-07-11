import { createBudgetPageStateResult } from "../budgetPageStateResult";

describe("budgetPageStateResult", () => {
  it("budget page の公開 state を組み立てる", () => {
    const currentDate = new Date("2026-03-07T00:00:00.000Z");
    const expenses = [
      {
        id: "e1",
        date: "2026-03-06",
        amount: 1200,
        createdAt: "2026-03-06T00:00:00.000Z",
      },
    ];
    const categories = [
      { id: "category-books", name: "書籍", createdAt: "2026-03-01T00:00:00.000Z" },
    ];
    const closeBudgetInput = jest.fn();
    const closeExpenseForm = jest.fn();
    const goToCurrentMonth = jest.fn();
    const goToNextMonth = jest.fn();
    const goToPreviousMonth = jest.fn();
    const handleAddExpense = jest.fn();
    const handleBudgetInputChange = jest.fn();
    const handleDeleteExpense = jest.fn();
    const handleExpenseAmountChange = jest.fn();
    const handleExpenseDateChange = jest.fn();
    const handleExpenseCategoryIdChange = jest.fn();
    const handleSaveBudget = jest.fn();
    const navigateToCategoryManagement = jest.fn();
    const openBudgetInput = jest.fn();
    const openExpenseForm = jest.fn();

    expect(
      createBudgetPageStateResult({
        budgetInputValue: "45000",
        categories,
        closeBudgetInput,
        closeExpenseForm,
        currentDate,
        dailyBudget: 1000,
        dailyRemainingBudget: 1200,
        daysRemaining: 24,
        expenseAmount: "2500",
        expenseDate: "2026-03-05",
        expenseCategoryId: "category-books",
        expenses,
        goToCurrentMonth,
        goToNextMonth,
        goToPreviousMonth,
        handleAddExpense,
        handleBudgetInputChange,
        handleDeleteExpense,
        handleExpenseAmountChange,
        handleExpenseDateChange,
        handleExpenseCategoryIdChange,
        handleSaveBudget,
        isCurrentMonth: true,
        monthBudget: 45000,
        navigateToCategoryManagement,
        openBudgetInput,
        openExpenseForm,
        remaining: 43800,
        showBudgetInput: true,
        showExpenseForm: false,
        totalExpense: 1200,
      }),
    ).toEqual({
      budgetInputValue: "45000",
      categories,
      closeBudgetInput,
      closeExpenseForm,
      currentDate,
      dailyBudget: 1000,
      dailyRemainingBudget: 1200,
      daysRemaining: 24,
      expenseAmount: "2500",
      expenseDate: "2026-03-05",
      expenseCategoryId: "category-books",
      expenses,
      goToCurrentMonth,
      goToNextMonth,
      goToPreviousMonth,
      handleAddExpense,
      handleBudgetInputChange,
      handleDeleteExpense,
      handleExpenseAmountChange,
      handleExpenseDateChange,
      handleExpenseCategoryIdChange,
      handleSaveBudget,
      isCurrentMonth: true,
      monthBudget: 45000,
      navigateToCategoryManagement,
      openBudgetInput,
      openExpenseForm,
      remaining: 43800,
      showBudgetInput: true,
      showExpenseForm: false,
      totalExpense: 1200,
    });
  });
});
