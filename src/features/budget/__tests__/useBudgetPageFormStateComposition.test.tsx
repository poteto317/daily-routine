import { renderHook } from "@testing-library/react";

jest.mock("../budgetPageFormStateResult", () => ({
  createBudgetPageFormStateResult: jest.fn(),
}));

jest.mock("../useBudgetPageFormActions", () => ({
  useBudgetPageFormActions: jest.fn(),
}));

jest.mock("../useBudgetPageFormVisibilityState", () => ({
  useBudgetPageFormVisibilityState: jest.fn(),
}));

jest.mock("../useBudgetPageInputState", () => ({
  useBudgetPageInputState: jest.fn(),
}));

import { createBudgetPageFormStateResult } from "../budgetPageFormStateResult";
import { useBudgetPageFormActions } from "../useBudgetPageFormActions";
import { useBudgetPageFormVisibilityState } from "../useBudgetPageFormVisibilityState";
import { useBudgetPageInputState } from "../useBudgetPageInputState";
import { useBudgetPageFormState } from "../useBudgetPageFormState";

describe("useBudgetPageFormState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("form state と form action hook を compose する", () => {
    const actions = {
      closeBudgetInput: jest.fn(),
      closeExpenseForm: jest.fn(),
      openBudgetInput: jest.fn(),
      openExpenseForm: jest.fn(),
    };
    const visibilityState = {
      showBudgetInput: false,
      showExpenseForm: false,
      setShowBudgetInput: jest.fn(),
      setShowExpenseForm: jest.fn(),
    };
    const inputState = {
      budgetInputValue: "",
      expenseAmount: "",
      expenseCategoryId: "",
      setBudgetInputValue: jest.fn(),
      setExpenseAmount: jest.fn(),
      setExpenseCategoryId: jest.fn(),
    };
    (useBudgetPageFormActions as jest.Mock).mockReturnValue(actions);
    (useBudgetPageFormVisibilityState as jest.Mock).mockReturnValue(
      visibilityState,
    );
    (useBudgetPageInputState as jest.Mock).mockReturnValue(inputState);
    const resultState = {
      ...inputState,
      ...visibilityState,
      closeBudgetInput: actions.closeBudgetInput,
      closeExpenseForm: actions.closeExpenseForm,
      openBudgetInput: actions.openBudgetInput,
      openExpenseForm: actions.openExpenseForm,
    };
    (createBudgetPageFormStateResult as jest.Mock).mockReturnValue(resultState);

    const initialState = {
      showBudgetInput: false,
      budgetInputValue: "",
      showExpenseForm: false,
      expenseAmount: "",
      expenseCategoryId: "",
    };

    const { result } = renderHook(() =>
      useBudgetPageFormState({
        initialState,
        monthBudget: 30000,
      }),
    );

    expect(useBudgetPageFormVisibilityState).toHaveBeenCalledWith({
      initialShowBudgetInput: false,
      initialShowExpenseForm: false,
    });
    expect(useBudgetPageInputState).toHaveBeenCalledWith({
      initialBudgetInputValue: "",
      initialExpenseAmount: "",
      initialExpenseCategoryId: "",
    });
    expect(useBudgetPageFormActions).toHaveBeenCalledWith({
      monthBudget: 30000,
      setShowBudgetInput: visibilityState.setShowBudgetInput,
      setBudgetInputValue: inputState.setBudgetInputValue,
      setShowExpenseForm: visibilityState.setShowExpenseForm,
      setExpenseAmount: inputState.setExpenseAmount,
      setExpenseCategoryId: inputState.setExpenseCategoryId,
    });
    expect(createBudgetPageFormStateResult).toHaveBeenCalledWith({
      visibilityState,
      inputState,
      closeBudgetInput: actions.closeBudgetInput,
      closeExpenseForm: actions.closeExpenseForm,
      openBudgetInput: actions.openBudgetInput,
      openExpenseForm: actions.openExpenseForm,
    });
    expect(result.current).toBe(resultState);
  });
});
