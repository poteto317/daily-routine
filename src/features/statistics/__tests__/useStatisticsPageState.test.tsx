import { renderHook } from "@testing-library/react";
import { useStatisticsPageState } from "../page/useStatisticsPageState";

jest.mock("../page/statisticsPageResult", () => ({
  createStatisticsPageStateResult: jest.fn(),
}));

jest.mock("../page/useStatisticsComputedStats", () => ({
  useStatisticsComputedStats: jest.fn(),
}));

jest.mock("../page/useStatisticsPeriodState", () => ({
  useStatisticsPeriodState: jest.fn(),
}));

import { createStatisticsPageStateResult } from "../page/statisticsPageResult";
import { useStatisticsComputedStats } from "../page/useStatisticsComputedStats";
import { useStatisticsPeriodState } from "../page/useStatisticsPeriodState";

describe("useStatisticsPageState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useStatisticsPeriodState as jest.Mock).mockReturnValue({
      currentDate: new Date("2026-03-08T12:00:00.000Z"),
      goToNextPeriod: jest.fn(),
      goToPreviousPeriod: jest.fn(),
      goToToday: jest.fn(),
      month: 3,
      setViewMode: jest.fn(),
      viewMode: "week",
      year: 2026,
    });
    (useStatisticsComputedStats as jest.Mock).mockReturnValue({
      weeklyStats: { weekStart: "2026-03-02", weekEnd: "2026-03-08" },
      monthlyStats: { totalCompleted: 20 },
      categoryStats: [{ category: "work", totalCompleted: 10 }],
    });
    (createStatisticsPageStateResult as jest.Mock).mockReturnValue({
      composed: true,
    });
  });

  it("period/computed/result を compose する", () => {
    const { result } = renderHook(() => useStatisticsPageState());

    expect(useStatisticsComputedStats).toHaveBeenCalledWith({
      currentDate: expect.any(Date),
      month: 3,
      year: 2026,
    });
    expect(createStatisticsPageStateResult).toHaveBeenCalledWith({
      viewMode: "week",
      setViewMode: expect.any(Function),
      year: 2026,
      month: 3,
      weeklyStats: { weekStart: "2026-03-02", weekEnd: "2026-03-08" },
      monthlyStats: { totalCompleted: 20 },
      categoryStats: [{ category: "work", totalCompleted: 10 }],
      goToPreviousPeriod: expect.any(Function),
      goToNextPeriod: expect.any(Function),
      goToToday: expect.any(Function),
    });
    expect(result.current).toEqual({ composed: true });
  });
});
