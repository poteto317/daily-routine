import type { DailyHistory, PomodoroHistory } from "@/types/routine";
import {
  buildAchievementCalendarData,
  createAchievementCalendarMonthNavigation,
  createAchievementCalendarTodayNavigation,
  createEmptyAchievementCalendarSelection,
  selectAchievementCalendarDate,
} from "../achievementCalendarStateActions";

describe("achievementCalendarStateActions", () => {
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
      completedPomodoros: 3,
    },
  };

  it("空の選択状態を返す", () => {
    expect(createEmptyAchievementCalendarSelection()).toEqual({
      selectedDate: null,
      selectedHistory: null,
    });
  });

  it("月移動状態を作る", () => {
    const result = createAchievementCalendarMonthNavigation(2024, 6, 1);

    expect(result.currentDate).toEqual(new Date(2024, 6, 1));
    expect(result.selectedDate).toBeNull();
    expect(result.selectedHistory).toBeNull();
  });

  it("今日移動状態を作る", () => {
    const today = new Date("2024-06-15T00:00:00.000Z");

    expect(createAchievementCalendarTodayNavigation(today)).toEqual({
      currentDate: today,
      selectedDate: null,
      selectedHistory: null,
    });
  });

  it("日付選択状態を作る", () => {
    expect(selectAchievementCalendarDate("2024-06-10", history)).toEqual({
      selectedDate: "2024-06-10",
      selectedHistory: history,
    });
  });

  it("月データをまとめて読み込む", () => {
    const getHistoryForMonth = jest.fn(() => ({ [history.date]: history }));
    const getPomodoroHistory = jest.fn(() => pomodoroHistory);

    expect(
      buildAchievementCalendarData({
        year: 2024,
        month: 6,
        getHistoryForMonth,
        getPomodoroHistory,
      }),
    ).toEqual({
      monthHistory: { [history.date]: history },
      pomodoroHistory,
    });
    expect(getHistoryForMonth).toHaveBeenCalledWith(2024, 6);
    expect(getPomodoroHistory).toHaveBeenCalled();
  });
});
