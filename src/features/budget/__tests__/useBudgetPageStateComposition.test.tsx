import { renderHook } from "@testing-library/react";

jest.mock("../budgetPageActionBindings", () => ({
  createBudgetPageActionBindings: jest.fn(),
}));

jest.mock("../budgetPageInputHandlers", () => ({
  createBudgetPageInputHandlers: jest.fn(),
}));

jest.mock("../budgetPageStateResult", () => ({
  createBudgetPageStateResult: jest.fn(),
}));

jest.mock("../useBudgetPageActionHandlers", () => ({
  useBudgetPageActionHandlers: jest.fn(),
}));

jest.mock("../useBudgetPageFormState", () => ({
  useBudgetPageFormState: jest.fn(),
}));

jest.mock("../useBudgetMonthAndMetricsState", () => ({
  useBudgetMonthAndMetricsState: jest.fn(),
}));

jest.mock("../useBudgetCategoriesState", () => ({
  useBudgetCategoriesState: jest.fn(),
}));

import { createBudgetPageActionBindings } from "../budgetPageActionBindings";
import { createBudgetPageInputHandlers } from "../budgetPageInputHandlers";
import { createBudgetPageStateResult } from "../budgetPageStateResult";
import { useBudgetPageActionHandlers } from "../useBudgetPageActionHandlers";
import { useBudgetPageFormState } from "../useBudgetPageFormState";
import { useBudgetMonthAndMetricsState } from "../useBudgetMonthAndMetricsState";
import { useBudgetCategoriesState } from "../useBudgetCategoriesState";
import { useBudgetPageState } from "../useBudgetPageState";

const monthlyAllowance = {
  totalIncome: 300000,
  totalFixed: 80000,
  totalVariable: 30000,
  totalExpenseItems: 110000,
  allowance: 190000,
};

describe("useBudgetPageState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useBudgetMonthAndMetricsState as jest.Mock).mockReturnValue({
      initialState: {
        expenseAmount: "",
        expenseCategoryId: "",
        showExpenseForm: false,
      },
      monthState: {
        currentDate: new Date("2026-03-07T00:00:00.000Z"),
        currentMonth: "2026-03",
        expenseDate: "2026-03-07",
        expenses: [],
        goToCurrentMonth: jest.fn(),
        goToNextMonth: jest.fn(),
        goToPreviousMonth: jest.fn(),
        setExpenseDate: jest.fn(),
        setExpenses: jest.fn(),
      },
      monthlyAllowance,
      metrics: {
        dailyBudget: 1000,
        dailyRemainingBudget: 1200,
        isCurrentMonth: true,
        remaining: 28800,
        todayExpense: 400,
        totalExpense: 1200,
        unenteredDays: 24,
      },
    });
    (useBudgetPageFormState as jest.Mock).mockReturnValue({
      closeExpenseForm: jest.fn(),
      expenseAmount: "",
      expenseCategoryId: "",
      openExpenseForm: jest.fn(),
      setExpenseAmount: jest.fn(),
      setExpenseCategoryId: jest.fn(),
      showExpenseForm: false,
    });
    (createBudgetPageActionBindings as jest.Mock).mockReturnValue({
      bound: true,
    });
    (useBudgetPageActionHandlers as jest.Mock).mockReturnValue({
      handleAddExpense: jest.fn(),
      handleUpdateExpense: jest.fn(),
      handleDeleteExpense: jest.fn(),
    });
    (createBudgetPageInputHandlers as jest.Mock).mockReturnValue({
      handleExpenseAmountChange: jest.fn(),
      handleExpenseDateChange: jest.fn(),
      handleExpenseCategoryIdChange: jest.fn(),
      handleEditExpenseAmountChange: jest.fn(),
      handleEditExpenseDateChange: jest.fn(),
      handleEditExpenseCategoryIdChange: jest.fn(),
    });
    (createBudgetPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
    (useBudgetCategoriesState as jest.Mock).mockReturnValue({
      categories: [
        { id: "cat-1", name: "食料品", createdAt: "2026-05-01T00:00:00.000Z" },
      ],
    });
  });

  it("monthAndMetrics/form/actions/result を compose する", () => {
    const navigate = jest.fn();
    const { result } = renderHook(() => useBudgetPageState({ navigate }));

    expect(useBudgetMonthAndMetricsState).toHaveBeenCalledTimes(1);
    expect(useBudgetPageFormState).toHaveBeenCalledWith({
      initialState: expect.objectContaining({
        expenseAmount: "",
      }),
    });
    expect(createBudgetPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        currentMonth: "2026-03",
        expenseDate: "2026-03-07",
      }),
    );
    expect(useBudgetPageActionHandlers).toHaveBeenCalledWith({ bound: true });
    expect(createBudgetPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        editingExpenseId: null,
        editingExpenseAmount: "",
        editingExpenseDate: "",
        editingExpenseCategoryId: "",
        closeExpenseEdit: expect.any(Function),
      }),
    );
    expect(createBudgetPageInputHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        setExpenseAmount: expect.any(Function),
        setEditingExpenseAmount: expect.any(Function),
        setEditingExpenseDate: expect.any(Function),
        setEditingExpenseCategoryId: expect.any(Function),
      }),
    );
    expect(useBudgetCategoriesState).toHaveBeenCalledTimes(1);
    expect(createBudgetPageStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        currentDate: expect.any(Date),
        categories: [
          {
            id: "cat-1",
            name: "食料品",
            createdAt: "2026-05-01T00:00:00.000Z",
          },
        ],
        navigateToCategoryManagement: expect.any(Function),
        navigateToSummary: expect.any(Function),
        todayExpense: 400,
        handleUpdateExpense: expect.any(Function),
        editingExpenseId: null,
        handleEditExpenseAmountChange: expect.any(Function),
        handleEditExpenseDateChange: expect.any(Function),
        handleEditExpenseCategoryIdChange: expect.any(Function),
        startEditExpense: expect.any(Function),
        cancelEditExpense: expect.any(Function),
      }),
    );
    expect(result.current).toEqual({ composed: true });

    const { navigateToCategoryManagement, navigateToSummary } = (
      createBudgetPageStateResult as jest.Mock
    ).mock.calls[0][0];
    navigateToCategoryManagement();
    expect(navigate).toHaveBeenCalledWith("budget-category-management");
    navigateToSummary();
    expect(navigate).toHaveBeenCalledWith("budget-summary");
  });
});
