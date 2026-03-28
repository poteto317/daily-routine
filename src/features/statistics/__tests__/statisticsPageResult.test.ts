import { createStatisticsPageStateResult } from "../page/statisticsPageResult";

describe("statisticsPageResult", () => {
  it("page state result をそのまま返す", () => {
    const today = new Date("2026-03-08T12:00:00.000Z");
    const params = {
      viewMode: "week" as const,
      setViewMode: jest.fn(),
      year: 2026,
      month: 3,
      weeklyStats: { totalCompleted: 1 },
      monthlyStats: { totalCompleted: 2 },
      categoryStats: [{ category: "work", totalCompleted: 3 }],
      goToPreviousPeriod: jest.fn(() => today),
      goToNextPeriod: jest.fn(() => today),
      goToToday: jest.fn(() => today),
    };

    expect(createStatisticsPageStateResult(params)).toEqual(params);
  });
});
