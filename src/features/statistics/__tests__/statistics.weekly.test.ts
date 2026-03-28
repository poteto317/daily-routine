import { mockGetMonthlyHistory } from "./statisticsTestUtils";
import { calculateWeeklyStats } from "../statistics";

describe("calculateWeeklyStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMonthlyHistory.mockReturnValue({});
  });

  it("週の開始日を月曜日に調整して7日分を返す", () => {
    const result = calculateWeeklyStats(new Date("2024-01-17"));
    expect(result.weekStart).toBe("2024-01-15");
    expect(result.weekEnd).toBe("2024-01-21");
    expect(result.days).toHaveLength(7);
  });

  it("データがない場合は達成率0%", () => {
    const result = calculateWeeklyStats(new Date("2024-01-17"));
    expect(result.averageAchievementRate).toBe(0);
    expect(result.totalCompleted).toBe(0);
    expect(result.totalRoutines).toBe(0);
  });

  it("履歴データがある場合、正しく集計する", () => {
    mockGetMonthlyHistory.mockReturnValue({
      "2024-01-15": {
        date: "2024-01-15",
        completedRoutineIds: ["1", "2"],
        routineSnapshots: [
          { id: "1", title: "R1", category: "health", startTime: "09:00" },
          { id: "2", title: "R2", category: "work", startTime: "10:00" },
        ],
      },
      "2024-01-16": {
        date: "2024-01-16",
        completedRoutineIds: ["1"],
        routineSnapshots: [
          { id: "1", title: "R1", category: "health", startTime: "09:00" },
          { id: "2", title: "R2", category: "work", startTime: "10:00" },
        ],
      },
    });

    const result = calculateWeeklyStats(new Date("2024-01-17"));
    expect(result.totalCompleted).toBe(3);
    expect(result.totalRoutines).toBe(4);
    expect(result.averageAchievementRate).toBe(75);
  });
});
