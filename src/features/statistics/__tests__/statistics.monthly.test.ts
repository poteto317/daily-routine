import { mockGetHistoryForMonth } from "./statisticsTestUtils";
import { calculateMonthlyStats } from "../statistics";

describe("calculateMonthlyStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHistoryForMonth.mockReturnValue({});
  });

  it("その月の日数分の統計と年月を返す", () => {
    expect(calculateMonthlyStats(2024, 1).days).toHaveLength(31);
    expect(calculateMonthlyStats(2024, 2).days).toHaveLength(29);
    const result = calculateMonthlyStats(2024, 6);
    expect(result.year).toBe(2024);
    expect(result.month).toBe(6);
  });

  it("データがない場合、bestDayとworstDayはnull", () => {
    const result = calculateMonthlyStats(2024, 1);
    expect(result.bestDay).toBeNull();
    expect(result.worstDay).toBeNull();
  });

  it("bestDay/worstDayと平均達成率を正しく計算する", () => {
    mockGetHistoryForMonth.mockReturnValue({
      "2024-01-10": {
        date: "2024-01-10",
        completedRoutineIds: ["1"],
        routineSnapshots: [
          { id: "1", title: "R1", category: "health", startTime: "09:00" },
          { id: "2", title: "R2", category: "work", startTime: "10:00" },
        ],
      },
      "2024-01-15": {
        date: "2024-01-15",
        completedRoutineIds: ["1", "2"],
        routineSnapshots: [
          { id: "1", title: "R1", category: "health", startTime: "09:00" },
          { id: "2", title: "R2", category: "work", startTime: "10:00" },
        ],
      },
      "2024-01-20": {
        date: "2024-01-20",
        completedRoutineIds: [],
        routineSnapshots: [
          { id: "1", title: "R1", category: "health", startTime: "09:00" },
        ],
      },
    });

    const result = calculateMonthlyStats(2024, 1);
    expect(result.bestDay?.date).toBe("2024-01-15");
    expect(result.bestDay?.achievementRate).toBe(100);
    expect(result.worstDay?.date).toBe("2024-01-20");
    expect(result.worstDay?.achievementRate).toBe(0);
    expect(result.totalCompleted).toBe(3);
    expect(result.totalRoutines).toBe(5);
    expect(result.averageAchievementRate).toBe(60);
  });
});
