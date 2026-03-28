import { mockGetHistoryForMonth } from "./statisticsTestUtils";
import { calculateCategoryStats } from "../statistics";
describe("calculateCategoryStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHistoryForMonth.mockReturnValue({});
  });

  it("データがない場合、空配列を返す", () => {
    expect(calculateCategoryStats(2024, 1)).toEqual([]);
  });

  it("カテゴリ別統計を正しく計算する", () => {
    mockGetHistoryForMonth.mockReturnValue({
      "2024-01-10": {
        date: "2024-01-10",
        completedRoutineIds: ["1", "3"],
        routineSnapshots: [
          { id: "1", title: "R1", category: "health", startTime: "09:00" },
          { id: "2", title: "R2", category: "health", startTime: "10:00" },
          { id: "3", title: "R3", category: "work", startTime: "11:00" },
        ],
      },
      "2024-01-11": {
        date: "2024-01-11",
        completedRoutineIds: ["1", "2"],
        routineSnapshots: [
          { id: "1", title: "R1", category: "health", startTime: "09:00" },
          { id: "2", title: "R2", category: "health", startTime: "10:00" },
        ],
      },
    });

    const result = calculateCategoryStats(2024, 1);
    expect(result.find((s) => s.category === "health")).toEqual({
      category: "health",
      completed: 3,
      total: 4,
      achievementRate: 75,
    });
    expect(result.find((s) => s.category === "work")).toEqual({
      category: "work",
      completed: 1,
      total: 1,
      achievementRate: 100,
    });
  });
});
