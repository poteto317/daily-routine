import type { DailyHistory } from "@/types/routine";
import { createAchievementCalendarSelectionStateResult } from "../achievementCalendarSelectionStateResult";

describe("achievementCalendarSelectionStateResult", () => {
  it("selection state の公開 shape を返す", () => {
    const selectedHistory: DailyHistory = {
      date: "2024-06-10",
      completedRoutineIds: ["r1"],
      routineSnapshots: [],
    };
    const setCurrentDate = jest.fn();
    const setSelectedDate = jest.fn();
    const setSelectedHistory = jest.fn();

    expect(
      createAchievementCalendarSelectionStateResult({
        currentDate: new Date("2024-06-15T00:00:00.000Z"),
        selectedDate: "2024-06-10",
        selectedHistory,
        setCurrentDate,
        setSelectedDate,
        setSelectedHistory,
      }),
    ).toEqual({
      currentDate: new Date("2024-06-15T00:00:00.000Z"),
      selectedDate: "2024-06-10",
      selectedHistory,
      setCurrentDate,
      setSelectedDate,
      setSelectedHistory,
    });
  });
});
