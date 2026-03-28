import type { DailyHistory } from "@/types/routine";
import { createAchievementCalendarDateClickHandler } from "../calendarSelectionActions";

const history: DailyHistory = {
  date: "2024-06-10",
  completedRoutineIds: ["1"],
  routineSnapshots: [
    { id: "1", title: "Task", startTime: "09:00", category: "health" },
  ],
};

describe("calendarSelectionActions", () => {
  it("日付クリック handler が履歴選択を更新する", () => {
    const setSelectedDate = jest.fn();
    const setSelectedHistory = jest.fn();
    const getDailyHistory = jest.fn(() => history);

    createAchievementCalendarDateClickHandler({
      getDailyHistory,
      setters: { setSelectedDate, setSelectedHistory },
    })("2024-06-10");

    expect(getDailyHistory).toHaveBeenCalledWith("2024-06-10");
    expect(setSelectedDate).toHaveBeenCalledWith("2024-06-10");
    expect(setSelectedHistory).toHaveBeenCalledWith(history);
  });
});
