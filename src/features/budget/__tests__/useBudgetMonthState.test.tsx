import { act, renderHook } from "@testing-library/react";
import { useBudgetMonthState } from "../useBudgetMonthState";

jest.mock("../budgetPageStateActions", () => ({
  createBudgetMonthNavigationHandler: jest.fn(),
  createBudgetMonthSyncAction: jest.fn(),
}));

import {
  createBudgetMonthNavigationHandler,
  createBudgetMonthSyncAction,
} from "../budgetPageStateActions";

const mockCreateBudgetMonthNavigationHandler =
  createBudgetMonthNavigationHandler as jest.MockedFunction<
    typeof createBudgetMonthNavigationHandler
  >;
const mockCreateBudgetMonthSyncAction =
  createBudgetMonthSyncAction as jest.MockedFunction<
    typeof createBudgetMonthSyncAction
  >;

describe("useBudgetMonthState", () => {
  const initialState = {
    currentDate: new Date("2026-03-07T00:00:00+09:00"),
    expenses: [
      {
        id: "e-mar",
        date: "2026-03-03",
        amount: 1000,
        createdAt: "2026-03-03T00:00:00.000Z",
      },
    ],
    expenseDate: "2026-03-07",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateBudgetMonthSyncAction.mockReturnValue(jest.fn());
    mockCreateBudgetMonthNavigationHandler
      .mockReturnValueOnce(jest.fn())
      .mockReturnValueOnce(jest.fn())
      .mockReturnValueOnce(jest.fn());
  });

  it("月データの初期 state と navigation handler を組み立てる", () => {
    const { result } = renderHook(() => useBudgetMonthState({ initialState }));

    expect(result.current.currentMonth).toBe("2026-03");
    expect(result.current.expenses).toEqual(initialState.expenses);
    expect(result.current.expenseDate).toBe("2026-03-07");
    expect(mockCreateBudgetMonthSyncAction).toHaveBeenCalledWith({
      setExpenses: expect.any(Function),
      setExpenseDate: expect.any(Function),
    });
    expect(mockCreateBudgetMonthNavigationHandler).toHaveBeenNthCalledWith(1, {
      direction: "current",
      currentDate: result.current.currentDate,
      setCurrentDate: expect.any(Function),
      syncMonthData: expect.any(Function),
    });
    expect(mockCreateBudgetMonthNavigationHandler).toHaveBeenNthCalledWith(2, {
      direction: "next",
      currentDate: result.current.currentDate,
      setCurrentDate: expect.any(Function),
      syncMonthData: expect.any(Function),
    });
    expect(mockCreateBudgetMonthNavigationHandler).toHaveBeenNthCalledWith(3, {
      direction: "previous",
      currentDate: result.current.currentDate,
      setCurrentDate: expect.any(Function),
      syncMonthData: expect.any(Function),
    });
  });

  it("月データ setter で state を更新できる", () => {
    const { result } = renderHook(() => useBudgetMonthState({ initialState }));

    act(() => {
      result.current.setExpenses([
        {
          id: "e-apr",
          date: "2026-04-01",
          amount: 3000,
          createdAt: "2026-04-01T00:00:00.000Z",
        },
      ]);
      result.current.setExpenseDate("2026-04-01");
    });

    expect(result.current.expenses).toEqual([
      expect.objectContaining({ id: "e-apr", amount: 3000 }),
    ]);
    expect(result.current.expenseDate).toBe("2026-04-01");
  });
});
