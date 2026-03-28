import { renderHook } from "@testing-library/react";
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
import { useAchievementCalendarData } from "../useAchievementCalendarData";

describe("useAchievementCalendarData", () => {
  it("指定年月の monthHistory と pomodoroHistory を返す", () => {
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
    (getHistoryForMonth as jest.Mock).mockReturnValue({
      [history.date]: history,
    });
    (getPomodoroHistory as jest.Mock).mockReturnValue(pomodoroHistory);

    const { result } = renderHook(() => useAchievementCalendarData(2024, 6));

    expect(getHistoryForMonth).toHaveBeenCalledWith(2024, 6);
    expect(result.current.getDailyHistory).toBe(getDailyHistory);
    expect(result.current.monthHistory).toEqual({ [history.date]: history });
    expect(result.current.pomodoroHistory).toEqual(pomodoroHistory);
  });
});
