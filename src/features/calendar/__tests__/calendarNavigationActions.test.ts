import {
  createAchievementCalendarMonthHandler,
  createAchievementCalendarTodayHandler,
} from "../calendarNavigationActions";

describe("calendarNavigationActions", () => {
  it("月移動 handler が currentDate と選択状態を更新する", () => {
    const setCurrentDate = jest.fn();
    const setSelectedDate = jest.fn();
    const setSelectedHistory = jest.fn();

    createAchievementCalendarMonthHandler({
      year: 2024,
      month: 6,
      monthOffset: 1,
      setters: { setCurrentDate, setSelectedDate, setSelectedHistory },
    })();

    expect(setCurrentDate).toHaveBeenCalledWith(new Date(2024, 6, 1));
    expect(setSelectedDate).toHaveBeenCalledWith(null);
    expect(setSelectedHistory).toHaveBeenCalledWith(null);
  });

  it("今日移動 handler が today navigation を適用する", () => {
    const setCurrentDate = jest.fn();
    const setSelectedDate = jest.fn();
    const setSelectedHistory = jest.fn();
    const today = new Date("2024-06-15T00:00:00.000Z");

    createAchievementCalendarTodayHandler({
      setters: { setCurrentDate, setSelectedDate, setSelectedHistory },
      createTodayNavigation: () => ({
        currentDate: today,
        selectedDate: null,
        selectedHistory: null,
      }),
    })();

    expect(setCurrentDate).toHaveBeenCalledWith(today);
    expect(setSelectedDate).toHaveBeenCalledWith(null);
    expect(setSelectedHistory).toHaveBeenCalledWith(null);
  });
});
