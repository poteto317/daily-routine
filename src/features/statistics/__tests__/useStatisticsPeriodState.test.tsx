import { act, renderHook } from "@testing-library/react";
import { useStatisticsPeriodState } from "../page/useStatisticsPeriodState";

describe("useStatisticsPeriodState", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-08T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("初期の表示モードと年月を保持する", () => {
    const { result } = renderHook(() => useStatisticsPeriodState());

    expect(result.current.viewMode).toBe("week");
    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(3);
  });

  it("週表示で前後移動と今日移動を扱う", () => {
    const { result } = renderHook(() => useStatisticsPeriodState());

    act(() => {
      result.current.goToPreviousPeriod();
    });
    expect(result.current.month).toBe(3);

    act(() => {
      result.current.goToNextPeriod();
    });
    expect(result.current.month).toBe(3);

    act(() => {
      result.current.goToToday();
    });
    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(3);
  });

  it("月/カテゴリ表示で月移動を扱う", () => {
    const { result } = renderHook(() => useStatisticsPeriodState());

    act(() => {
      result.current.setViewMode("month");
    });

    act(() => {
      result.current.goToPreviousPeriod();
    });
    expect(result.current.month).toBe(2);

    act(() => {
      result.current.setViewMode("category");
    });

    act(() => {
      result.current.goToNextPeriod();
    });
    expect(result.current.month).toBe(3);
  });
});
