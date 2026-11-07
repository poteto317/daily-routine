import { renderHook } from "@testing-library/react";

jest.mock("@/hooks/useToday", () => ({
  useJstTodayKey: jest.fn(),
}));

jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(() => []),
  getMonthlyHistory: jest.fn(() => ({})),
}));

jest.mock("../statistics", () => ({
  calculateWeeklyGoalProgress: jest.fn(() => []),
}));

import { useJstTodayKey } from "@/hooks/useToday";
import { calculateWeeklyGoalProgress } from "../statistics";
import { useWeeklyGoalProgress } from "../page/useWeeklyGoalProgress";

// 週目標の今日（options.now が無いとき）は、共通フック useJstTodayKey の値で決める。
// 時計（2026-11-04）と違う日をフックから返し、フックの値が使われることを確かめる（L-060）。
// 1・2 件目は直す前では落ちる。3 件目（options.now）は直す前でも通り、注入された時計を優先する挙動の固定
describe("useWeeklyGoalProgress の今日は共通フック useJstTodayKey から取る", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2026-11-04T12:00:00+09:00"));
    (useJstTodayKey as jest.Mock).mockReturnValue("2026-11-16");
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("フックの日付の JST の 0 時を today として渡す", () => {
    const selectedDate = new Date("2026-11-04T12:00:00+09:00");

    renderHook(() => useWeeklyGoalProgress(selectedDate));

    expect(calculateWeeklyGoalProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedDate,
        today: new Date("2026-11-16T00:00:00+09:00"),
      }),
    );
  });

  it("再描画でフックの日付が変わると、同じ選択日のまま計算し直す", () => {
    const selectedDate = new Date("2026-11-04T12:00:00+09:00");
    const { rerender } = renderHook(
      ({ date }: { date: Date }) => useWeeklyGoalProgress(date),
      { initialProps: { date: selectedDate } },
    );

    (useJstTodayKey as jest.Mock).mockReturnValue("2026-11-23");
    rerender({ date: selectedDate });

    expect(calculateWeeklyGoalProgress).toHaveBeenCalledTimes(2);
    expect(calculateWeeklyGoalProgress).toHaveBeenLastCalledWith(
      expect.objectContaining({
        today: new Date("2026-11-23T00:00:00+09:00"),
      }),
    );
  });

  it("options.now を渡したときは、フックの日付ではなく now() の値を使う", () => {
    const injectedToday = new Date("2026-08-19T12:00:00+09:00");

    renderHook(() =>
      useWeeklyGoalProgress(new Date("2026-08-17T12:00:00+09:00"), {
        now: () => injectedToday,
      }),
    );

    expect(calculateWeeklyGoalProgress).toHaveBeenCalledWith(
      expect.objectContaining({ today: injectedToday }),
    );
  });
});
