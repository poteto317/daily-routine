import { createAchievementCalendarStateResult } from "../achievementCalendarStateResult";

describe("achievementCalendarStateResult", () => {
  it("calendar state の公開 shape を組み立てる", () => {
    const goToNextMonth = jest.fn();
    const goToPreviousMonth = jest.fn();
    const goToToday = jest.fn();
    const handleDateClick = jest.fn();
    const history = {
      "2024-06-10": {
        date: "2024-06-10",
        completedRoutineIds: ["1"],
        routineSnapshots: [],
      },
    };
    const pomodoroHistory = {
      "2024-06-10": {
        date: "2024-06-10",
        completedPomodoros: 2,
      },
    };

    expect(
      createAchievementCalendarStateResult({
        year: 2024,
        month: 6,
        monthHistory: history,
        pomodoroHistory,
        selectedDate: "2024-06-10",
        selectedHistory: history["2024-06-10"],
        goToNextMonth,
        goToPreviousMonth,
        goToToday,
        handleDateClick,
      }),
    ).toEqual({
      year: 2024,
      month: 6,
      monthHistory: history,
      pomodoroHistory,
      selectedDate: "2024-06-10",
      selectedHistory: history["2024-06-10"],
      goToNextMonth,
      goToPreviousMonth,
      goToToday,
      handleDateClick,
    });
  });
});
