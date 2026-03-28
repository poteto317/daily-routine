import { act, renderHook } from "@testing-library/react";
import type { DailyHistory } from "@/types/routine";
import { createAchievementCalendarSelectionStateResult } from "../achievementCalendarSelectionStateResult";
import { useAchievementCalendarSelectionState } from "../useAchievementCalendarSelectionState";

jest.mock("../achievementCalendarSelectionStateResult", () => ({
  createAchievementCalendarSelectionStateResult: jest.fn(),
}));

describe("useAchievementCalendarSelectionState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      createAchievementCalendarSelectionStateResult as jest.Mock
    ).mockImplementation((args) => args);
  });

  it("currentDate と selected state を保持する", () => {
    const selectedHistory: DailyHistory = {
      date: "2024-06-10",
      completedRoutineIds: ["r1"],
      routineSnapshots: [],
    };
    const { result } = renderHook(() => useAchievementCalendarSelectionState());

    expect(createAchievementCalendarSelectionStateResult).toHaveBeenCalledWith({
      currentDate: expect.any(Date),
      selectedDate: null,
      selectedHistory: null,
      setCurrentDate: expect.any(Function),
      setSelectedDate: expect.any(Function),
      setSelectedHistory: expect.any(Function),
    });

    const nextDate = new Date("2024-06-15T00:00:00.000Z");

    act(() => {
      result.current.setCurrentDate(nextDate);
      result.current.setSelectedDate("2024-06-10");
      result.current.setSelectedHistory(selectedHistory);
    });

    expect(result.current.currentDate).toBe(nextDate);
    expect(result.current.selectedDate).toBe("2024-06-10");
    expect(result.current.selectedHistory).toEqual(selectedHistory);
    expect(
      createAchievementCalendarSelectionStateResult,
    ).toHaveBeenLastCalledWith({
      currentDate: nextDate,
      selectedDate: "2024-06-10",
      selectedHistory,
      setCurrentDate: expect.any(Function),
      setSelectedDate: expect.any(Function),
      setSelectedHistory: expect.any(Function),
    });
  });
});
