import type { DailyStats } from "../statistics/types";
import {
  accumulateMonthlyTotals,
  buildMonthlyDailyStats,
  buildMonthlyStats,
  findMonthlyAchievementExtremes,
  getDaysInMonth,
} from "../statistics/monthlyAggregation";

jest.mock("../statistics/daily", () => ({
  calculateDailyStats: jest.fn(),
}));

import { calculateDailyStats } from "../statistics/daily";

const mockCalculateDailyStats = calculateDailyStats as jest.MockedFunction<
  typeof calculateDailyStats
>;

describe("monthlyAggregation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateDailyStats.mockImplementation((date) => ({
      date,
      completedCount: 0,
      totalCount: 0,
      achievementRate: 0,
    }));
  });

  it("月の日数を返す", () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it("月次の日別統計をその月の日数分だけ組み立てる", () => {
    const result = buildMonthlyDailyStats(2024, 2, {});

    expect(result).toHaveLength(29);
    expect(mockCalculateDailyStats).toHaveBeenCalledWith("2024-02-01", null);
    expect(mockCalculateDailyStats).toHaveBeenCalledWith("2024-02-29", null);
  });

  it("月次の合計値と平均達成率を集計する", () => {
    const days: DailyStats[] = [
      {
        date: "2024-01-01",
        completedCount: 1,
        totalCount: 2,
        achievementRate: 50,
      },
      {
        date: "2024-01-02",
        completedCount: 3,
        totalCount: 3,
        achievementRate: 100,
      },
    ];

    expect(accumulateMonthlyTotals(days)).toEqual({
      totalCompleted: 4,
      totalRoutines: 5,
      averageAchievementRate: 80,
    });
  });

  it("実データがある日の best/worst を選ぶ", () => {
    const days: DailyStats[] = [
      {
        date: "2024-01-01",
        completedCount: 0,
        totalCount: 0,
        achievementRate: 0,
      },
      {
        date: "2024-01-02",
        completedCount: 1,
        totalCount: 2,
        achievementRate: 50,
      },
      {
        date: "2024-01-03",
        completedCount: 2,
        totalCount: 2,
        achievementRate: 100,
      },
      {
        date: "2024-01-04",
        completedCount: 0,
        totalCount: 1,
        achievementRate: 0,
      },
    ];

    expect(findMonthlyAchievementExtremes(days)).toEqual({
      bestDay: days[2],
      worstDay: days[3],
    });
  });

  it("日別統計から月次DTOを組み立てる", () => {
    const days: DailyStats[] = [
      {
        date: "2024-01-10",
        completedCount: 1,
        totalCount: 2,
        achievementRate: 50,
      },
      {
        date: "2024-01-11",
        completedCount: 2,
        totalCount: 2,
        achievementRate: 100,
      },
    ];

    expect(buildMonthlyStats(2024, 1, days)).toEqual({
      year: 2024,
      month: 1,
      days,
      totalCompleted: 3,
      totalRoutines: 4,
      averageAchievementRate: 75,
      bestDay: days[1],
      worstDay: days[0],
    });
  });
});
