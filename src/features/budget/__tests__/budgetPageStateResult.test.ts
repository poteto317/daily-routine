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
      {
        id: "category-books",
        name: "書籍",
        createdAt: "2026-03-01T00:00:00.000Z",
      },
    ];
    const closeExpenseForm = jest.fn();
    const goToCurrentMonth = jest.fn();
    const goToNextMonth = jest.fn();
    const goToPreviousMonth = jest.fn();
    const handleAddExpense = jest.fn();
    const handleUpdateExpense = jest.fn();
    const handleDeleteExpense = jest.fn();
    const handleExpenseAmountChange = jest.fn();
    const handleExpenseDateChange = jest.fn();
    const handleExpenseCategoryIdChange = jest.fn();
    const handleEditExpenseAmountChange = jest.fn();
    const handleEditExpenseDateChange = jest.fn();
    const handleEditExpenseCategoryIdChange = jest.fn();
    const handleEditExpenseUsedTimeChange = jest.fn();
    const navigateToCategoryManagement = jest.fn();
    const navigateToSummary = jest.fn();
    const openExpenseForm = jest.fn();
    const startEditExpense = jest.fn();
    const cancelEditExpense = jest.fn();

    expect(
      createBudgetPageStateResult({
        categories,
        closeExpenseForm,
        currentDate,
        dailyRemainingBudget: 1200,
        daysRemaining: 24,
        editingExpenseId: "e1",
        editingExpenseAmount: "3000",
        editingExpenseDate: "2026-03-10",
        editingExpenseCategoryId: "category-books",
        editingExpenseUsedTime: "13:45",
        expenseAmount: "2500",
        expenseDate: "2026-03-05",
        expenseCategoryId: "category-books",
        expenses,
        goToCurrentMonth,
        goToNextMonth,
        goToPreviousMonth,
        handleAddExpense,
        handleUpdateExpense,
        handleDeleteExpense,
        handleExpenseAmountChange,
        handleExpenseDateChange,
        handleExpenseCategoryIdChange,
        handleEditExpenseAmountChange,
        handleEditExpenseDateChange,
        handleEditExpenseCategoryIdChange,
        handleEditExpenseUsedTimeChange,
        isCurrentMonth: true,
        navigateToCategoryManagement,
        navigateToSummary,
        openExpenseForm,
        startEditExpense,
        cancelEditExpense,
        showExpenseForm: false,
        todayExpense: 300,
      }),
    ).toEqual({
      categories,
      closeExpenseForm,
      currentDate,
      dailyRemainingBudget: 1200,
      daysRemaining: 24,
      editingExpenseId: "e1",
      editingExpenseAmount: "3000",
      editingExpenseDate: "2026-03-10",
      editingExpenseCategoryId: "category-books",
      editingExpenseUsedTime: "13:45",
      expenseAmount: "2500",
      expenseDate: "2026-03-05",
      expenseCategoryId: "category-books",
      expenses,
      goToCurrentMonth,
      goToNextMonth,
      goToPreviousMonth,
      handleAddExpense,
      handleUpdateExpense,
      handleDeleteExpense,
      handleExpenseAmountChange,
      handleExpenseDateChange,
      handleExpenseCategoryIdChange,
      handleEditExpenseAmountChange,
      handleEditExpenseDateChange,
      handleEditExpenseCategoryIdChange,
      handleEditExpenseUsedTimeChange,
      isCurrentMonth: true,
      navigateToCategoryManagement,
      navigateToSummary,
      openExpenseForm,
      startEditExpense,
      cancelEditExpense,
      showExpenseForm: false,
      todayExpense: 300,
    });
  });
});
