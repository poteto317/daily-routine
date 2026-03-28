import { calculateDailyStats } from "../statistics";
import { createHistory } from "./statisticsTestUtils";

describe("calculateDailyStats", () => {
  it("履歴がnullの場合、すべて0の統計を返す", () => {
    expect(calculateDailyStats("2024-01-15", null)).toEqual({
      date: "2024-01-15",
      completedCount: 0,
      totalCount: 0,
      achievementRate: 0,
    });
  });

  it("ルーティンが空の場合、すべて0の統計を返す", () => {
    expect(calculateDailyStats("2024-01-15", createHistory({}))).toEqual({
      date: "2024-01-15",
      completedCount: 0,
      totalCount: 0,
      achievementRate: 0,
    });
  });

  it("完了数と達成率を正しく計算する", () => {
    const history = createHistory({
      completedRoutineIds: ["1", "3"],
      routineSnapshots: [
        { id: "1", title: "R1", category: "health", startTime: "09:00" },
        { id: "2", title: "R2", category: "work", startTime: "10:00" },
        { id: "3", title: "R3", category: "study", startTime: "11:00" },
        { id: "4", title: "R4", category: "life", startTime: "12:00" },
      ],
    });

    expect(calculateDailyStats("2024-01-15", history)).toEqual({
      date: "2024-01-15",
      completedCount: 2,
      totalCount: 4,
      achievementRate: 50,
    });
  });
});
