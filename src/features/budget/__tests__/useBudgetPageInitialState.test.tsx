import { renderHook } from "@testing-library/react";

jest.mock("../budgetPageStateHelpers", () => ({
  getMonthStateSnapshot: jest.fn(() => ({ monthBudget: 32000 })),
}));

jest.mock("../budgetViewStateActions", () => ({
  createInitialBudgetViewState: jest.fn(() => ({
    currentDate: new Date("2026-03-07T00:00:00.000Z"),
  })),
}));

import { getMonthStateSnapshot } from "../budgetPageStateHelpers";
import { createInitialBudgetViewState } from "../budgetViewStateActions";
import { useBudgetPageInitialState } from "../useBudgetPageInitialState";

describe("useBudgetPageInitialState", () => {
  it("初期日付から snapshot と initial state を一度だけ組み立てる", () => {
    const { result, rerender } = renderHook(() => useBudgetPageInitialState());

    expect(getMonthStateSnapshot).toHaveBeenCalledTimes(1);
    expect(createInitialBudgetViewState).toHaveBeenCalledTimes(1);
    expect(createInitialBudgetViewState).toHaveBeenCalledWith(
      expect.any(Date),
      { monthBudget: 32000 },
    );

    rerender();

    expect(getMonthStateSnapshot).toHaveBeenCalledTimes(1);
    expect(createInitialBudgetViewState).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual(
      (createInitialBudgetViewState as jest.Mock).mock.results[0].value,
    );
  });
});
