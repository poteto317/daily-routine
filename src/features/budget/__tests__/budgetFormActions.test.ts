import {
  createBudgetInputCloseHandler,
  createBudgetInputOpenHandler,
  createExpenseFormCloseHandler,
  createExpenseFormOpenHandler,
} from "../budgetFormActions";

jest.mock("../budgetPageStateLogic", () => ({
  getBudgetInputInitialValue: jest.fn(),
}));

jest.mock("../budgetViewStateActions", () => ({
  createOpenedExpenseFormState: jest.fn(),
}));

jest.mock("../stateActions", () => ({
  closeBudgetInputForm: jest.fn(),
  closeExpenseInputForm: jest.fn(),
  openBudgetInputForm: jest.fn(),
}));

import { getBudgetInputInitialValue } from "../budgetPageStateLogic";
import { createOpenedExpenseFormState } from "../budgetViewStateActions";
import {
  closeBudgetInputForm,
  closeExpenseInputForm,
  openBudgetInputForm,
} from "../stateActions";

describe("budgetFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("入力フォーム open/close handler を構築する", () => {
    const setBudgetInputValue = jest.fn();
    const setShowBudgetInput = jest.fn();
    const setShowExpenseForm = jest.fn();
    const setExpenseAmount = jest.fn();
    const setExpenseDescription = jest.fn();

    createBudgetInputCloseHandler({
      setShowBudgetInput,
      setBudgetInputValue,
    })();
    expect(closeBudgetInputForm).toHaveBeenCalledWith({
      setShowBudgetInput,
      setBudgetInputValue,
    });

    createExpenseFormCloseHandler({
      setShowExpenseForm,
      setExpenseAmount,
      setExpenseDescription,
    })();
    expect(closeExpenseInputForm).toHaveBeenCalledWith({
      setShowExpenseForm,
      setExpenseAmount,
      setExpenseDescription,
    });

    createBudgetInputOpenHandler({
      monthBudget: 30000,
      setBudgetInputValue,
      setShowBudgetInput,
    })();

    expect(openBudgetInputForm).toHaveBeenCalledWith({
      monthBudget: 30000,
      getInitialValue: getBudgetInputInitialValue,
      setBudgetInputValue,
      setShowBudgetInput,
    });

    (createOpenedExpenseFormState as jest.Mock).mockReturnValue({
      showExpenseForm: true,
    });
    createExpenseFormOpenHandler({ setShowExpenseForm })();
    expect(setShowExpenseForm).toHaveBeenCalledWith(true);
  });
});