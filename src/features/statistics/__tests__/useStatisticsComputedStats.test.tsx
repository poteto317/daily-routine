import { renderHook } from "@testing-library/react";
import { useStatisticsComputedStats } from "../page/useStatisticsComputedStats";

jest.mock("../page/useWeeklyStats", () => ({
  useWeeklyStats: jest.fn(),
}));

jest.mock("../page/useMonthlyStats", () => ({
  useMonthlyStats: jest.fn(),
}));

jest.mock("../page/useCategoryStats", () => ({
  useCategoryStats: jest.fn(),
}));

jest.mock("../page/useWeeklyGoalProgress", () => ({
  useWeeklyGoalProgress: jest.fn(),
}));

import { useCategoryStats } from "../page/useCategoryStats";
import { useMonthlyStats } from "../page/useMonthlyStats";
import { useWeeklyStats } from "../page/useWeeklyStats";
import { useWeeklyGoalProgress } from "../page/useWeeklyGoalProgress";

describe("useStatisticsComputedStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWeeklyStats as jest.Mock).mockReturnValue({ weekStart: "2026-03-02" });
    (useMonthlyStats as jest.Mock).mockReturnValue({ totalCompleted: 20 });
    (useCategoryStats as jest.Mock).mockReturnValue([
      { category: "work", totalCompleted: 10 },
    ]);
    (useWeeklyGoalProgress as jest.Mock).mockReturnValue([
      { goalId: "exercise", completedCount: 2 },
    ]);
  });

  it("週・月・カテゴリ集計 hook を compose する", () => {
    const currentDate = new Date("2026-03-08T12:00:00.000Z");
    const { result } = renderHook(() =>
      useStatisticsComputedStats({
        currentDate,
        month: 3,
        year: 2026,
      }),
    );

    expect(useWeeklyStats).toHaveBeenCalledWith(currentDate);
    expect(useMonthlyStats).toHaveBeenCalledWith(2026, 3);
    expect(useCategoryStats).toHaveBeenCalledWith(2026, 3);
    expect(useWeeklyGoalProgress).toHaveBeenCalledWith(currentDate);
    expect(result.current).toEqual({
      weeklyStats: { weekStart: "2026-03-02" },
      monthlyStats: { totalCompleted: 20 },
      categoryStats: [{ category: "work", totalCompleted: 10 }],
      weeklyGoalProgress: [{ goalId: "exercise", completedCount: 2 }],
    });
  });
});
