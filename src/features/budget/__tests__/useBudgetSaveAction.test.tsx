import { act, renderHook } from "@testing-library/react";

jest.mock("../budgetPageStateActions", () => ({
  createBudgetSaveHandler: jest.fn(),
}));

jest.mock("../budgetSaveActionResult", () => ({
  createBudgetSaveActionResult: jest.fn(),
}));

import { createBudgetSaveHandler } from "../budgetPageStateActions";
import { createBudgetSaveActionResult } from "../budgetSaveActionResult";
import { useBudgetSaveAction } from "../useBudgetSaveAction";

describe("useBudgetSaveAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("save handler を組み立てて委譲する", () => {
    const saveHandler = jest.fn();
    const resultShape = { handleSaveBudget: jest.fn(), composed: true };
    (createBudgetSaveHandler as jest.Mock).mockReturnValue(saveHandler);
    (createBudgetSaveActionResult as jest.Mock).mockReturnValue(resultShape);

    const params = {
      currentMonth: "2026-03",
      budgetInputValue: "45000",
      setMonthBudget: jest.fn(),
      closeBudgetInput: jest.fn(),
    };

    const { result } = renderHook(() => useBudgetSaveAction(params));

    expect(result.current).toBe(resultShape);
    expect(createBudgetSaveActionResult).toHaveBeenCalledWith({
      handleSaveBudget: saveHandler,
    });

    const builtHandleSaveBudget = (createBudgetSaveActionResult as jest.Mock)
      .mock.calls[0][0].handleSaveBudget as () => void;

    act(() => {
      builtHandleSaveBudget();
    });

    expect(createBudgetSaveHandler).toHaveBeenCalledWith({
      currentMonth: "2026-03",
      budgetInputValue: "45000",
      setMonthBudget: params.setMonthBudget,
      closeBudgetInput: params.closeBudgetInput,
    });
    expect(saveHandler).toHaveBeenCalled();
  });
});
