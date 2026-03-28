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

jest.mock("../useBudgetPageInitialState", () => ({
  useBudgetPageInitialState: jest.fn(),
}));

jest.mock("../useBudgetPageMetricsState", () => ({
  useBudgetPageMetricsState: jest.fn(),
}));

jest.mock("../useBudgetMonthState", () => ({
  useBudgetMonthState: jest.fn(),
}));

import { createBudgetPageActionBindings } from "../budgetPageActionBindings";
import { createBudgetPageInputHandlers } from "../budgetPageInputHandlers";
import { createBudgetPageStateResult } from "../budgetPageStateResult";
import { useBudgetPageActionHandlers } from "../useBudgetPageActionHandlers";
import { useBudgetPageFormState } from "../useBudgetPageFormState";
import { useBudgetPageInitialState } from "../useBudgetPageInitialState";
import { useBudgetPageMetricsState } from "../useBudgetPageMetricsState";
import { useBudgetMonthState } from "../useBudgetMonthState";
import { useBudgetPageState } from "../useBudgetPageState";

describe("useBudgetPageState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useBudgetPageInitialState as jest.Mock).mockReturnValue({
      budgetInputValue: "",
      expenseAmount: "",
      expenseDescription: "",
      showBudgetInput: false,
      showExpenseForm: false,
    });
    (useBudgetMonthState as jest.Mock).mockReturnValue({
      currentDate: new Date("2026-03-07T00:00:00.000Z"),
      currentMonth: "2026-03",
      expenseDate: "2026-03-07",
      expenses: [],
      monthBudget: 30000,
      goToCurrentMonth: jest.fn(),
      goToNextMonth: jest.fn(),
      goToPreviousMonth: jest.fn(),
      setExpenseDate: jest.fn(),
      setExpenses: jest.fn(),
      setMonthBudget: jest.fn(),
    });
    (useBudgetPageFormState as jest.Mock).mockReturnValue({
      budgetInputValue: "",
      closeBudgetInput: jest.fn(),
      closeExpenseForm: jest.fn(),
      expenseAmount: "",
      expenseDescription: "",
      openBudgetInput: jest.fn(),
      openExpenseForm: jest.fn(),
      setBudgetInputValue: jest.fn(),
      setExpenseAmount: jest.fn(),
      setExpenseDescription: jest.fn(),
      showBudgetInput: false,
      showExpenseForm: false,
    });
    (useBudgetPageMetricsState as jest.Mock).mockReturnValue({
      dailyBudget: 1000,
      dailyRemainingBudget: 1200,
      daysRemaining: 24,
      isCurrentMonth: true,
      remaining: 28800,
      totalExpense: 1200,
    });
    (createBudgetPageActionBindings as jest.Mock).mockReturnValue({
      bound: true,
    });
    (useBudgetPageActionHandlers as jest.Mock).mockReturnValue({
      handleAddExpense: jest.fn(),
      handleDeleteExpense: jest.fn(),
      handleSaveBudget: jest.fn(),
    });
    (createBudgetPageInputHandlers as jest.Mock).mockReturnValue({
      handleBudgetInputChange: jest.fn(),
      handleExpenseAmountChange: jest.fn(),
      handleExpenseDateChange: jest.fn(),
      handleExpenseDescriptionChange: jest.fn(),
    });
    (createBudgetPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("initial/month/form/metrics/actions/result を compose する", () => {
    const { result } = renderHook(() => useBudgetPageState());

    expect(useBudgetPageInitialState).toHaveBeenCalledTimes(1);
    expect(useBudgetMonthState).toHaveBeenCalledWith({
      initialState: expect.objectContaining({
        budgetInputValue: "",
      }),
    });
    expect(useBudgetPageFormState).toHaveBeenCalledWith({
      initialState: expect.objectContaining({
        budgetInputValue: "",
        expenseAmount: "",
      }),
      monthBudget: 30000,
    });
    expect(useBudgetPageMetricsState).toHaveBeenCalledWith({
      currentDate: expect.any(Date),
      monthBudget: 30000,
      expenses: [],
    });
    expect(createBudgetPageActionBindings).toHaveBeenCalledWith(
      expect.objectContaining({
        currentMonth: "2026-03",
        expenseDate: "2026-03-07",
      }),
    );
    expect(useBudgetPageActionHandlers).toHaveBeenCalledWith({ bound: true });
    expect(createBudgetPageInputHandlers).toHaveBeenCalledWith(
      expect.objectContaining({
        setBudgetInputValue: expect.any(Function),
        setExpenseAmount: expect.any(Function),
      }),
    );
    expect(createBudgetPageStateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        currentDate: expect.any(Date),
        monthBudget: 30000,
        dailyBudget: 1000,
      }),
    );
    expect(result.current).toEqual({ composed: true });
  });
});
