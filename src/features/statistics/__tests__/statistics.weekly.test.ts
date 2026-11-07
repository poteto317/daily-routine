import { createHistory, mockGetMonthlyHistory } from "./statisticsTestUtils";
import { calculateWeeklyStats } from "../statistics";
import {
  addDaysToDateKey,
  getWeekStartKey,
} from "../statistics/weeklyGoalDateKeys";

// 端末のタイムゾーンに依らず、JST のその時刻を指す（`+09:00` を付ける。L-181、L-695）
const jst = (dateTime: string) => new Date(`${dateTime}+09:00`);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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

  describe("週は JST の月曜〜日曜（日曜日はその日を含む週）", () => {
    const WEEK_DATES = [
      "2026-11-09",
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
    ];

    it.each([
      ["月", "2026-11-09T12:00:00"],
      ["火", "2026-11-10T12:00:00"],
      ["水", "2026-11-11T12:00:00"],
      ["木", "2026-11-12T12:00:00"],
      ["金", "2026-11-13T12:00:00"],
      ["土", "2026-11-14T12:00:00"],
      ["日", "2026-11-15T12:00:00"],
    ])("%s曜日を開くと、その日を含む月曜〜日曜の週になる", (_label, at) => {
      const result = calculateWeeklyStats(jst(at));

      expect(result.weekStart).toBe("2026-11-09");
      expect(result.weekEnd).toBe("2026-11-15");
      expect(result.days.map((day) => day.date)).toEqual(WEEK_DATES);
    });

    it("日曜日に開いても、翌週（11/16〜11/22）にならない", () => {
      const result = calculateWeeklyStats(jst("2026-11-15T12:00:00"));

      expect(result.weekStart).not.toBe("2026-11-16");
      expect(result.weekEnd).not.toBe("2026-11-22");
    });

    it("JST の日付が変わる前後で、日曜は前の週・月曜は次の週になる", () => {
      expect(calculateWeeklyStats(jst("2026-11-15T23:30:00")).weekStart).toBe(
        "2026-11-09",
      );
      expect(calculateWeeklyStats(jst("2026-11-16T00:30:00")).weekStart).toBe(
        "2026-11-16",
      );
      expect(calculateWeeklyStats(jst("2026-11-08T23:59:59")).weekStart).toBe(
        "2026-11-02",
      );
    });

    it("日曜日から7日ずつ前後へ動いても、週は重ならず飛ばずに並ぶ", () => {
      const sunday = jst("2026-11-15T12:00:00").getTime();
      const weeks = [-3, -2, -1, 0, 1, 2, 3].map((step) =>
        calculateWeeklyStats(new Date(sunday + step * WEEK_MS)),
      );

      expect(weeks[3]?.weekStart).toBe("2026-11-09");
      weeks.slice(1).forEach((week, index) => {
        const previous = weeks[index]!;
        expect(addDaysToDateKey(previous.weekEnd, 1)).toBe(week.weekStart);
      });
    });

    it("週の開始日は、週間目標の週（getWeekStartKey）と一致する", () => {
      const keys = Array.from({ length: 14 }, (_, offset) =>
        addDaysToDateKey("2026-11-09", offset),
      );
      const times = ["T00:30:00", "T12:00:00", "T23:30:00"];

      keys.forEach((key) => {
        times.forEach((time) => {
          const date = jst(`${key}${time}`);
          expect(calculateWeeklyStats(date).weekStart).toBe(
            getWeekStartKey(date),
          );
        });
      });
    });

    it("日曜日の履歴は、その週の最後の日に集計され、翌週には集計されない", () => {
      mockGetMonthlyHistory.mockReturnValue({
        "2026-11-15": createHistory({
          date: "2026-11-15",
          completedRoutineIds: ["1"],
          routineSnapshots: [
            { id: "1", title: "R1", category: "health", startTime: "09:00" },
          ],
        }),
      });

      const sundayWeek = calculateWeeklyStats(jst("2026-11-15T12:00:00"));
      const nextWeek = calculateWeeklyStats(jst("2026-11-16T12:00:00"));

      expect(sundayWeek.days[6]?.date).toBe("2026-11-15");
      expect(sundayWeek.days[6]?.completedCount).toBe(1);
      expect(sundayWeek.totalCompleted).toBe(1);
      expect(nextWeek.totalCompleted).toBe(0);
    });
  });
});
