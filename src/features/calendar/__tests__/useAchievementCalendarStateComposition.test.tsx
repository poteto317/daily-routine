import { renderHook } from "@testing-library/react";

jest.mock("../useAchievementCalendarSelectionState", () => ({
  useAchievementCalendarSelectionState: jest.fn(),
}));

jest.mock("../useAchievementCalendarData", () => ({
  useAchievementCalendarData: jest.fn(),
}));

jest.mock("../useAchievementCalendarActions", () => ({
  useAchievementCalendarActions: jest.fn(),
}));

jest.mock("../achievementCalendarStateResult", () => ({
  createAchievementCalendarStateResult: jest.fn(),
}));

import { createAchievementCalendarStateResult } from "../achievementCalendarStateResult";
import { useAchievementCalendarActions } from "../useAchievementCalendarActions";
import { useAchievementCalendarData } from "../useAchievementCalendarData";
import { useAchievementCalendarSelectionState } from "../useAchievementCalendarSelectionState";
import { useAchievementCalendarState } from "../useAchievementCalendarState";

describe("useAchievementCalendarState composition", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAchievementCalendarSelectionState as jest.Mock).mockReturnValue({
      currentDate: new Date("2024-06-15T00:00:00.000Z"),
      selectedDate: "2024-06-10",
      selectedHistory: { date: "2024-06-10" },
      setCurrentDate: jest.fn(),
      setSelectedDate: jest.fn(),
      setSelectedHistory: jest.fn(),
    });
    (useAchievementCalendarData as jest.Mock).mockReturnValue({
      getDailyHistory: jest.fn(),
      monthHistory: { "2024-06-10": { date: "2024-06-10" } },
      pomodoroHistory: {
        "2024-06-10": { date: "2024-06-10", completedPomodoros: 2 },
      },
    });
    (useAchievementCalendarActions as jest.Mock).mockReturnValue({
      goToNextMonth: jest.fn(),
      goToPreviousMonth: jest.fn(),
      goToToday: jest.fn(),
      handleDateClick: jest.fn(),
    });
    (createAchievementCalendarStateResult as jest.Mock).mockImplementation(
      (params) => params,
    );
  });

  it("selection/data/actions と result builder を compose する", () => {
    const { result } = renderHook(() => useAchievementCalendarState());

    expect(useAchievementCalendarData).toHaveBeenCalledWith(2024, 6);
    expect(useAchievementCalendarActions).toHaveBeenCalledWith({
      year: 2024,
      month: 6,
      getDailyHistory: expect.any(Function),
      setCurrentDate: expect.any(Function),
      setSelectedDate: expect.any(Function),
      setSelectedHistory: expect.any(Function),
    });
    expect(createAchievementCalendarStateResult).toHaveBeenCalledWith({
      year: 2024,
      month: 6,
      monthHistory: { "2024-06-10": { date: "2024-06-10" } },
      pomodoroHistory: {
        "2024-06-10": { date: "2024-06-10", completedPomodoros: 2 },
      },
      selectedDate: "2024-06-10",
      selectedHistory: { date: "2024-06-10" },
      goToNextMonth: expect.any(Function),
      goToPreviousMonth: expect.any(Function),
      goToToday: expect.any(Function),
      handleDateClick: expect.any(Function),
    });
    expect(result.current).toEqual({
      year: 2024,
      month: 6,
      monthHistory: { "2024-06-10": { date: "2024-06-10" } },
      pomodoroHistory: {
        "2024-06-10": { date: "2024-06-10", completedPomodoros: 2 },
      },
      selectedDate: "2024-06-10",
      selectedHistory: { date: "2024-06-10" },
      goToNextMonth: expect.any(Function),
      goToPreviousMonth: expect.any(Function),
      goToToday: expect.any(Function),
      handleDateClick: expect.any(Function),
    });
  });
});
