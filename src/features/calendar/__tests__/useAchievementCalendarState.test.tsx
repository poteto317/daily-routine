import { act, renderHook } from "@testing-library/react";
import type { DailyHistory, PomodoroHistory } from "@/types/routine";

jest.mock("@/features/routine/storage", () => ({
  getDailyHistory: jest.fn(),
  getHistoryForMonth: jest.fn(),
}));

jest.mock("@/features/pomodoro/storage", () => ({
  getPomodoroHistory: jest.fn(),
}));

import {
  getDailyHistory,
  getHistoryForMonth,
} from "@/features/routine/storage";
import { getPomodoroHistory } from "@/features/pomodoro/storage";
import { useAchievementCalendarState } from "../useAchievementCalendarState";

describe("useAchievementCalendarState", () => {
  const history: DailyHistory = {
    date: "2024-06-10",
    completedRoutineIds: ["1"],
    routineSnapshots: [
      { id: "1", title: "Task", startTime: "09:00", category: "health" },
    ],
  };

  const pomodoroHistory: PomodoroHistory = {
    "2024-06-10": {
      date: "2024-06-10",
      completedPomodoros: 2,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-15T00:00:00.000Z"));
    (getHistoryForMonth as jest.Mock).mockReturnValue({ [history.date]: history });
    (getPomodoroHistory as jest.Mock).mockReturnValue(pomodoroHistory);
    (getDailyHistory as jest.Mock).mockReturnValue(history);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("初期状態で今月データを返す", () => {
    const { result } = renderHook(() => useAchievementCalendarState());

    expect(result.current.year).toBe(2024);
    expect(result.current.month).toBe(6);
    expect(result.current.monthHistory).toEqual({ [history.date]: history });
    expect(result.current.pomodoroHistory).toEqual(pomodoroHistory);
  });

  it("月移動時に選択状態をリセットする", () => {
    const { result } = renderHook(() => useAchievementCalendarState());

    act(() => {
      result.current.handleDateClick("2024-06-10");
    });

    expect(result.current.selectedDate).toBe("2024-06-10");
    expect(result.current.selectedHistory).toEqual(history);

    act(() => {
      result.current.goToNextMonth();
    });

    expect(result.current.month).toBe(7);
    expect(result.current.selectedDate).toBeNull();
    expect(result.current.selectedHistory).toBeNull();
  });

  it("前月移動と今日移動ができる", () => {
    const { result } = renderHook(() => useAchievementCalendarState());

    act(() => {
      result.current.goToPreviousMonth();
    });

    expect(result.current.year).toBe(2024);
    expect(result.current.month).toBe(5);

    act(() => {
      result.current.goToToday();
    });

    expect(result.current.year).toBe(2024);
    expect(result.current.month).toBe(6);
  });

  it("日付クリックで詳細履歴を読み込む", () => {
    const { result } = renderHook(() => useAchievementCalendarState());

    act(() => {
      result.current.handleDateClick("2024-06-10");
    });

    expect(getDailyHistory).toHaveBeenCalledWith("2024-06-10");
    expect(result.current.selectedDate).toBe("2024-06-10");
    expect(result.current.selectedHistory).toEqual(history);
  });
});
