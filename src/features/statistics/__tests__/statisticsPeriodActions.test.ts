import {
  createStatisticsNextPeriodAction,
  createStatisticsPreviousPeriodAction,
  createStatisticsTodayAction,
} from "../page/statisticsPeriodActions";

describe("statisticsPeriodActions", () => {
  it("週表示の前後移動 action を作る", () => {
    const setCurrentDate = jest.fn();
    const currentDate = new Date("2026-03-08T00:00:00.000Z");

    const previous = createStatisticsPreviousPeriodAction({
      viewMode: "week",
      currentDate,
      year: 2026,
      month: 3,
      setCurrentDate,
    })();
    expect(previous.toISOString()).toBe("2026-03-01T00:00:00.000Z");
    expect(setCurrentDate).toHaveBeenCalledWith(previous);

    const next = createStatisticsNextPeriodAction({
      viewMode: "week",
      currentDate,
      year: 2026,
      month: 3,
      setCurrentDate,
    })();
    expect(next.toISOString()).toBe("2026-03-15T00:00:00.000Z");
  });

  it("月/カテゴリ表示の前後移動 action を作る", () => {
    const setCurrentDate = jest.fn();
    const currentDate = new Date("2026-03-08T00:00:00.000Z");

    const previous = createStatisticsPreviousPeriodAction({
      viewMode: "month",
      currentDate,
      year: 2026,
      month: 3,
      setCurrentDate,
    })();
    expect(previous.getFullYear()).toBe(2026);
    expect(previous.getMonth()).toBe(1);
    expect(previous.getDate()).toBe(1);

    const next = createStatisticsNextPeriodAction({
      viewMode: "category",
      currentDate,
      year: 2026,
      month: 3,
      setCurrentDate,
    })();
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(3);
    expect(next.getDate()).toBe(1);
  });

  it("today action を作る", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-08T12:00:00.000Z"));

    const setCurrentDate = jest.fn();
    const today = createStatisticsTodayAction(setCurrentDate)();
    expect(today.toISOString()).toBe("2026-03-08T12:00:00.000Z");
    expect(setCurrentDate).toHaveBeenCalledWith(today);

    jest.useRealTimers();
  });
});
