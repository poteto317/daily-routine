import {
  createExpenseFormCloseHandler,
  createExpenseFormOpenHandler,
} from "../budgetFormActions";

jest.mock("../budgetViewStateActions", () => ({
  createOpenedExpenseFormState: jest.fn(),
}));

jest.mock("../stateActions", () => ({
  closeExpenseInputForm: jest.fn(),
}));

import { createOpenedExpenseFormState } from "../budgetViewStateActions";
import { closeExpenseInputForm } from "../stateActions";

describe("budgetFormActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("支出フォーム open/close handler を構築する", () => {
    const setShowExpenseForm = jest.fn();
    const setExpenseAmount = jest.fn();
    const setExpenseCategoryId = jest.fn();

    createExpenseFormCloseHandler({
      setShowExpenseForm,
      setExpenseAmount,
      setExpenseCategoryId,
    })();
    expect(closeExpenseInputForm).toHaveBeenCalledWith({
      setShowExpenseForm,
      setExpenseAmount,
      setExpenseCategoryId,
    });

    (createOpenedExpenseFormState as jest.Mock).mockReturnValue({
      showExpenseForm: true,
    });
    createExpenseFormOpenHandler({ setShowExpenseForm })();
    expect(setShowExpenseForm).toHaveBeenCalledWith(true);
  });
});
