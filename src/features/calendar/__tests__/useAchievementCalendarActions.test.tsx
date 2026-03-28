import { act, renderHook } from "@testing-library/react";

jest.mock("../calendarNavigationActions", () => ({
  createAchievementCalendarMonthHandler: jest.fn(),
  createAchievementCalendarTodayHandler: jest.fn(),
}));

jest.mock("../calendarSelectionActions", () => ({
  createAchievementCalendarDateClickHandler: jest.fn(),
}));

import {
  createAchievementCalendarMonthHandler,
  createAchievementCalendarTodayHandler,
} from "../calendarNavigationActions";
import { createAchievementCalendarDateClickHandler } from "../calendarSelectionActions";
import { useAchievementCalendarActions } from "../useAchievementCalendarActions";

describe("useAchievementCalendarActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("month/today/dateClick handler を組み立てて委譲する", () => {
    const nextMonthAction = jest.fn();
    const prevMonthAction = jest.fn();
    const todayAction = jest.fn();
    const dateClickAction = jest.fn();
    (createAchievementCalendarMonthHandler as jest.Mock)
      .mockReturnValueOnce(nextMonthAction)
      .mockReturnValueOnce(prevMonthAction);
    (createAchievementCalendarTodayHandler as jest.Mock).mockReturnValue(
      todayAction,
    );
    (createAchievementCalendarDateClickHandler as jest.Mock).mockReturnValue(
      dateClickAction,
    );

    const params = {
      year: 2024,
      month: 6,
      getDailyHistory: jest.fn(),
      setCurrentDate: jest.fn(),
      setSelectedDate: jest.fn(),
      setSelectedHistory: jest.fn(),
    };
    const { result } = renderHook(() => useAchievementCalendarActions(params));

    act(() => {
      result.current.goToNextMonth();
      result.current.goToPreviousMonth();
      result.current.goToToday();
      result.current.handleDateClick("2024-06-10");
    });

    expect(createAchievementCalendarMonthHandler).toHaveBeenNthCalledWith(1, {
      year: 2024,
      month: 6,
      monthOffset: 1,
      setters: {
        setCurrentDate: params.setCurrentDate,
        setSelectedDate: params.setSelectedDate,
        setSelectedHistory: params.setSelectedHistory,
      },
    });
    expect(createAchievementCalendarMonthHandler).toHaveBeenNthCalledWith(2, {
      year: 2024,
      month: 6,
      monthOffset: -1,
      setters: {
        setCurrentDate: params.setCurrentDate,
        setSelectedDate: params.setSelectedDate,
        setSelectedHistory: params.setSelectedHistory,
      },
    });
    expect(createAchievementCalendarTodayHandler).toHaveBeenCalledWith({
      setters: {
        setCurrentDate: params.setCurrentDate,
        setSelectedDate: params.setSelectedDate,
        setSelectedHistory: params.setSelectedHistory,
      },
    });
    expect(createAchievementCalendarDateClickHandler).toHaveBeenCalledWith({
      getDailyHistory: params.getDailyHistory,
      setters: {
        setSelectedDate: params.setSelectedDate,
        setSelectedHistory: params.setSelectedHistory,
      },
    });
    expect(nextMonthAction).toHaveBeenCalled();
    expect(prevMonthAction).toHaveBeenCalled();
    expect(todayAction).toHaveBeenCalled();
    expect(dateClickAction).toHaveBeenCalledWith("2024-06-10");
  });
});
