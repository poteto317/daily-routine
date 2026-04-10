import { createHistory } from "./statisticsTestUtils";
import {
  buildDailyStatsForDates,
  buildDateRange,
  summarizeDailyStats,
} from "../statistics/dailyAggregation";

jest.mock("../statistics/daily", () => ({
  calculateDailyStats: jest.fn(),
}));

import { calculateDailyStats } from "../statistics/daily";

const mockCalculateDailyStats = calculateDailyStats as jest.MockedFunction<
  typeof calculateDailyStats
>;

describe("dailyAggregation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCalculateDailyStats.mockImplementation((date) => ({
      date,
      completedCount: 0,
      totalCount: 0,
      achievementRate: 0,
    }));
  });

  it("開始日と終了日を含む日付範囲を構築する", () => {
    const start = new Date("2024-01-30");
    const end = new Date("2024-02-02");

    const result = buildDateRange(start, end);

    expect(result.map((date) => date.toISOString().split("T")[0])).toEqual([
      "2024-01-30",
      "2024-01-31",
      "2024-02-01",
      "2024-02-02",
    ]);
    expect(result[0]).not.toBe(start);
    expect(result[0].getTime()).toBe(start.getTime());
  });

  it("開始日が終了日より後なら空配列を返す", () => {
    expect(
      buildDateRange(new Date("2024-02-02"), new Date("2024-01-30")),
    ).toEqual([]);
  });

  it("日付配列を日別統計に変換する", () => {
    mockCalculateDailyStats
      .mockReturnValueOnce({
        date: "2024-01-10",
        completedCount: 1,
        totalCount: 2,
        achievementRate: 50,
      })
      .mockReturnValueOnce({
        date: "2024-01-11",
        completedCount: 2,
        totalCount: 2,
        achievementRate: 100,
      });

    const historyMap = {
      "2024-01-10": createHistory({
        date: "2024-01-10",
        completedRoutineIds: ["1"],
        routineSnapshots: [
          { id: "1", title: "R1", category: "health", startTime: "09:00" },
          { id: "2", title: "R2", category: "work", startTime: "10:00" },
        ],
      }),
    };

    const result = buildDailyStatsForDates(
      [new Date("2024-01-10"), new Date("2024-01-11")],
      historyMap,
    );

    expect(result).toEqual([
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
    ]);
    expect(mockCalculateDailyStats).toHaveBeenNthCalledWith(
      1,
      "2024-01-10",
      historyMap["2024-01-10"],
    );
    expect(mockCalculateDailyStats).toHaveBeenNthCalledWith(
      2,
      "2024-01-11",
      null,
    );
  });

  it("日別統計を合算して総数と平均達成率を返す", () => {
    expect(
      summarizeDailyStats([
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
      ]),
    ).toEqual({
      totalCompleted: 3,
      totalRoutines: 4,
      averageAchievementRate: 75,
    });
  });

  it("集計対象が空なら0埋めの結果を返す", () => {
    expect(summarizeDailyStats([])).toEqual({
      totalCompleted: 0,
      totalRoutines: 0,
      averageAchievementRate: 0,
    });
  });
});
