import {
  createBudgetMonthNavigationHandler,
  createBudgetMonthSyncAction,
} from "../budgetMonthActions";

jest.mock("../budgetPageStateHelpers", () => ({
  getMonthStateSnapshot: jest.fn(),
}));

jest.mock("../budgetViewStateActions", () => ({
  createBudgetMonthNavigationDate: jest.fn(),
}));

jest.mock("../stateActions", () => ({
  navigateBudgetMonth: jest.fn(),
  syncBudgetMonthData: jest.fn(),
}));

import { getMonthStateSnapshot } from "../budgetPageStateHelpers";
import { createBudgetMonthNavigationDate } from "../budgetViewStateActions";
import { navigateBudgetMonth, syncBudgetMonthData } from "../stateActions";

describe("budgetMonthActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("月同期 action が snapshot 同期を委譲する", () => {
    const setExpenses = jest.fn();
    const setExpenseDate = jest.fn();
    const date = new Date("2026-03-07T00:00:00.000Z");

    createBudgetMonthSyncAction({
      setExpenses,
      setExpenseDate,
    })(date);

    expect(syncBudgetMonthData).toHaveBeenCalledWith({
      date,
      getSnapshot: getMonthStateSnapshot,
      setExpenses,
      setExpenseDate,
    });
  });

  it("月移動 handler が移動 action を構築する", () => {
    const setCurrentDate = jest.fn();
    const syncMonthData = jest.fn();
    const currentDate = new Date("2026-03-07T00:00:00.000Z");
    const nextDate = new Date("2026-04-07T00:00:00.000Z");

    (createBudgetMonthNavigationDate as jest.Mock).mockReturnValue(nextDate);

    createBudgetMonthNavigationHandler({
      direction: "next",
      currentDate,
      setCurrentDate,
      syncMonthData,
    })();

    expect(createBudgetMonthNavigationDate).toHaveBeenCalledWith({
      direction: "next",
      currentDate,
    });
    expect(navigateBudgetMonth).toHaveBeenCalledWith({
      nextDate,
      setCurrentDate,
      syncMonthData,
    });
  });
});
