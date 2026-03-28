import {
  calculateSessionStats,
  formatDuration,
  formatTimer,
  formatTimerLong,
  generateId,
  minutesToTime,
  timeToMinutes,
} from "../core";

describe("storage/core utils", () => {
  it("timeToMinutes/minutesToTimeが相互変換できる", () => {
    expect(timeToMinutes("12:34")).toBe(754);
    expect(minutesToTime(754)).toBe("12:34");
  });

  it("generateIdはprefixを含むIDを生成する", () => {
    const id = generateId("routine");
    expect(id.startsWith("routine-")).toBe(true);
  });

  it("formatDuration/formatTimer/formatTimerLongが表示形式を返す", () => {
    expect(formatDuration(30)).toBe("30分");
    expect(formatDuration(60)).toBe("1時間");
    expect(formatDuration(90)).toBe("1時間30分");

    expect(formatTimer(125)).toBe("02:05");
    expect(formatTimerLong(3661)).toBe("01:01:01");
  });

  it("calculateSessionStatsは空配列でfirst、複数件でトレンドを計算する", () => {
    const empty = calculateSessionStats([]);
    expect(empty).toEqual({
      count: 0,
      averageDuration: 0,
      bestDuration: 0,
      latestDuration: 0,
      trend: "first",
    });

    const improving = calculateSessionStats([100, 110, 120]);
    expect(improving.count).toBe(3);
    expect(["improving", "stable", "declining"]).toContain(improving.trend);

    const withZero = calculateSessionStats([0, 0, 150]);
    expect(withZero.count).toBe(3);
    expect(withZero.bestDuration).toBe(150);
    expect(withZero.latestDuration).toBe(150);
  });
});
