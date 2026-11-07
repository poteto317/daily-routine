import { renderHook } from "@testing-library/react";

jest.mock("@/features/routine/storage", () => ({
  getRoutines: jest.fn(),
  getMonthlyHistory: jest.fn(),
}));

jest.mock("../statistics", () => ({
  calculateWeeklyGoalProgress: jest.fn(),
}));

import { getMonthlyHistory, getRoutines } from "@/features/routine/storage";
import { calculateWeeklyGoalProgress } from "../statistics";
import { useWeeklyGoalProgress } from "../page/useWeeklyGoalProgress";

describe("useWeeklyGoalProgress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("現在のルーティンと全履歴を純粋集計へ渡す", () => {
    const selectedDate = new Date("2026-08-17T12:00:00+09:00");
    const today = new Date("2026-08-19T12:00:00+09:00");
    const routines = [{ id: "exercise" }];
    const history = { "2026-08-17": { date: "2026-08-17" } };
    const calculated = [{ goalId: "exercise", completedCount: 1 }];
    (getRoutines as jest.Mock).mockReturnValue(routines);
    (getMonthlyHistory as jest.Mock).mockReturnValue(history);
    (calculateWeeklyGoalProgress as jest.Mock).mockReturnValue(calculated);

    const { result } = renderHook(() =>
      useWeeklyGoalProgress(selectedDate, { now: () => today }),
    );

    expect(calculateWeeklyGoalProgress).toHaveBeenCalledWith({
      selectedDate,
      today,
      routines,
      history,
    });
    expect(result.current).toBe(calculated);
  });

  describe("options.now が無いときの今日（JST）", () => {
    beforeEach(() => {
      (getRoutines as jest.Mock).mockReturnValue([]);
      (getMonthlyHistory as jest.Mock).mockReturnValue({});
      (calculateWeeklyGoalProgress as jest.Mock).mockReturnValue([]);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("今日の JST の 0 時の Date を渡す", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-11-04T15:30:00+09:00"));
      const selectedDate = new Date("2026-11-04T12:00:00+09:00");

      renderHook(() => useWeeklyGoalProgress(selectedDate));

      expect(calculateWeeklyGoalProgress).toHaveBeenCalledTimes(1);
      expect(calculateWeeklyGoalProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedDate,
          today: new Date("2026-11-04T00:00:00+09:00"),
        }),
      );
    });

    // 手書きの useMemo は Jest でも依存を尊重するので、今日のキーが依存に無い形（直す前）では
    // このテストは落ちる（本物の赤）。rerender の前後で selectedDate に同じ Date のインスタンスを渡す
    // （毎回新しい Date を渡すと、依存が変わって直す前でも計算し直され、通ってしまう）。
    // またぐ前に渡す today の確認は「今日の JST の 0 時の Date を渡す」が担う（ここで確かめると、
    // 直す前は時刻つきの today の不一致で先に落ち、依存の不足による赤にならない）
    it("JST の月曜 0 時をまたいだ後の再描画で、同じ選択日のまま新しい週の今日で計算し直す", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-11-08T23:59:00+09:00"));
      const selectedDate = new Date("2026-11-08T12:00:00+09:00");
      const { rerender } = renderHook(
        ({ date }: { date: Date }) => useWeeklyGoalProgress(date),
        { initialProps: { date: selectedDate } },
      );
      expect(calculateWeeklyGoalProgress).toHaveBeenCalledTimes(1);

      jest.setSystemTime(new Date("2026-11-09T00:01:00+09:00"));
      rerender({ date: selectedDate });

      expect(calculateWeeklyGoalProgress).toHaveBeenCalledTimes(2);
      expect(calculateWeeklyGoalProgress).toHaveBeenLastCalledWith(
        expect.objectContaining({
          selectedDate,
          today: new Date("2026-11-09T00:00:00+09:00"),
        }),
      );
    });

    // 直す前でも通る（依存に毎回変わる値を入れて、同じ日の再描画でも計算し直す形にしないためのガード）
    it("同じ日のうちの再描画（今日も選択日も同じ）では、計算し直さない", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-11-09T08:00:00+09:00"));
      const selectedDate = new Date("2026-11-09T12:00:00+09:00");
      const { rerender } = renderHook(
        ({ date }: { date: Date }) => useWeeklyGoalProgress(date),
        { initialProps: { date: selectedDate } },
      );

      jest.setSystemTime(new Date("2026-11-09T21:00:00+09:00"));
      rerender({ date: selectedDate });

      expect(calculateWeeklyGoalProgress).toHaveBeenCalledTimes(1);
    });
  });
});
