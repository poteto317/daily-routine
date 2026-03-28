import { fireEvent, screen } from "@testing-library/react";
import {
  clickNextMonth,
  clickPrevMonth,
  mockGetDailyHistory,
  mockGetHistoryForMonth,
  renderCalendar,
  sampleHistory,
  setupCalendarTest,
} from "./achievementCalendarTestUtils";

describe("AchievementCalendar navigation", () => {
  setupCalendarTest();

  it("前月/翌月へ移動できる", () => {
    renderCalendar();

    clickPrevMonth();
    expect(screen.getByText("2024年 5月")).toBeInTheDocument();

    clickNextMonth();
    expect(screen.getByText("2024年 6月")).toBeInTheDocument();
  });

  it("今月ボタンで現在月に戻る", () => {
    renderCalendar();

    clickPrevMonth();
    fireEvent.click(screen.getByText("今月"));

    expect(screen.getByText("2024年 6月")).toBeInTheDocument();
  });

  it("月移動時に選択状態がリセットされる", () => {
    const history = sampleHistory({
      routineSnapshots: [
        { id: "1", title: "Task", startTime: "09:00", category: "health" },
      ],
    });
    mockGetDailyHistory.mockReturnValue(history);
    mockGetHistoryForMonth.mockReturnValue({ "2024-06-10": history });

    renderCalendar();
    fireEvent.click(screen.getByText("10"));
    expect(screen.getByText("2024-06-10 の達成記録")).toBeInTheDocument();

    clickPrevMonth();
    expect(screen.queryByText("2024-06-10 の達成記録")).not.toBeInTheDocument();
  });
});
