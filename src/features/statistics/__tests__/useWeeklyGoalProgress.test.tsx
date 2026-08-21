import { renderHook } from "@testing-library/react";

jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(),
  getMonthlyHistory: jest.fn(),
}));

jest.mock("../statistics", () => ({
  calculateWeeklyGoalProgress: jest.fn(),
}));

import { getMonthlyHistory, getRoutines } from "@/features/routine/storage";
import { calculateWeeklyGoalProgress } from "../statistics";
import { useWeeklyGoalProgress } from "../page/useWeeklyGoalProgress";

describe("useWeeklyGoalProgress", () => {
  it("現在のルーティンと全履歴を純粋集計へ渡す", () => {
    const selectedDate = new Date("2026-08-17T12:00:00+09:00");
    const today = new Date("2026-08-19T12:00:00+09:00");
    const routines = [{ id: "exercise" }];
    const history = { "2026-08-17": { date: "2026-08-17" } };
    const calculated = [{ goalId: "exercise", completedCount: 1 }];
    (getRoutines as jest.Mock).mockReturnValue(routines);
    (getMonthlyHistory as jest.Mock).mockReturnValue(history);
    (calculateWeeklyGoalProgress as jest.Mock).mockReturnValue(calculated);

    const { result } = renderHook(() =>
      useWeeklyGoalProgress(selectedDate, { now: () => today }),
    );

    expect(calculateWeeklyGoalProgress).toHaveBeenCalledWith({
      selectedDate,
      today,
      routines,
      history,
    });
    expect(result.current).toBe(calculated);
  });
});
