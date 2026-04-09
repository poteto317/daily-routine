import { screen } from "@testing-library/react";
import { type DailyHistory } from "@/types/routine";
import {
  mockGetHistoryForMonth,
  mockGetPomodoroHistory,
  mockIsHoliday,
  renderCalendar,
  setupCalendarTest,
} from "./achievementCalendarTestUtils";

describe("AchievementCalendar status", () => {
  setupCalendarTest();

  it("全達成・一部達成・ポモドーロが表示される", () => {
    const history: Record<string, DailyHistory> = {
      "2024-06-10": {
        date: "2024-06-10",
        completedRoutineIds: ["1", "2"],
        routineSnapshots: [
          {
            id: "1",
            title: "Routine 1",
            startTime: "09:00",
            category: "health",
          },
          { id: "2", title: "Routine 2", startTime: "10:00", category: "work" },
        ],
      },
      "2024-06-11": {
        date: "2024-06-11",
        completedRoutineIds: ["1"],
        routineSnapshots: [
          {
            id: "1",
            title: "Routine 1",
            startTime: "09:00",
            category: "health",
          },
          { id: "2", title: "Routine 2", startTime: "10:00", category: "work" },
        ],
      },
    };
    mockGetHistoryForMonth.mockReturnValue(history);
    mockGetPomodoroHistory.mockReturnValue({
      "2024-06-10": {
        date: "2024-06-10",
        completedPomodoros: 8,
        totalMinutes: 200,
      },
    });

    renderCalendar();

    expect(screen.getByText("2/2")).toBeInTheDocument();
    expect(screen.getByText("1/2")).toBeInTheDocument();
    expect(screen.getByText("🍅")).toBeInTheDocument();
  });

  it("未来日はクリック不可・休日と週末は赤表示", () => {
    mockIsHoliday.mockImplementation((date: Date) => date.getDate() === 10);
    renderCalendar();

    expect(screen.getByText("20").closest("button")).toBeDisabled();
    expect(screen.getByText("10").className).toContain("text-red");
    expect(screen.getByText("1").className).toContain("text-red");
    expect(screen.getByText("2").className).toContain("text-red");
  });
});
