import { fireEvent, screen } from "@testing-library/react";
import {
  mockGetDailyHistory,
  mockGetHistoryForMonth,
  renderCalendar,
  sampleHistory,
  setupCalendarTest,
} from "./achievementCalendarTestUtils";

describe("AchievementCalendar details", () => {
  setupCalendarTest();

  it("過去日クリックで詳細を表示する", () => {
    const history = sampleHistory({
      routineSnapshots: [
        {
          id: "1",
          title: "Morning Routine",
          startTime: "09:00",
          category: "health",
        },
        { id: "2", title: "Work Task", startTime: "10:00", category: "work" },
      ],
    });
    mockGetHistoryForMonth.mockReturnValue({ "2024-06-10": history });
    mockGetDailyHistory.mockReturnValue(history);

    renderCalendar();
    fireEvent.click(screen.getByText("10"));

    expect(screen.getByText("2024-06-10 の達成記録")).toBeInTheDocument();
    expect(screen.getByText("Morning Routine")).toBeInTheDocument();
    expect(screen.getByText("Work Task")).toBeInTheDocument();
  });

  it("記録なし/未完了/達成率を正しく表示する", () => {
    renderCalendar();
    mockGetDailyHistory.mockReturnValue(null);
    fireEvent.click(screen.getByText("10"));
    expect(
      screen.getByText("2024-06-10 の記録はありません"),
    ).toBeInTheDocument();

    const detail = sampleHistory({
      completedRoutineIds: ["1", "2"],
      routineSnapshots: [
        { id: "1", title: "Task 1", startTime: "09:00", category: "health" },
        { id: "2", title: "Task 2", startTime: "10:00", category: "work" },
        { id: "3", title: "Task 3", startTime: "11:00", category: "other" },
      ],
    });
    mockGetDailyHistory.mockReturnValue(detail);
    fireEvent.click(screen.getByText("10"));
    expect(screen.getAllByText("✅").length).toBeGreaterThan(0);
    expect(screen.getByText("⬜")).toBeInTheDocument();
    expect(screen.getByText(/達成率: 67% \(2\/3\)/)).toBeInTheDocument();
  });

  it("ルーティン0件メッセージを表示する", () => {
    mockGetDailyHistory.mockReturnValue(
      sampleHistory({ completedRoutineIds: [], routineSnapshots: [] }),
    );

    renderCalendar();
    fireEvent.click(screen.getByText("10"));

    expect(
      screen.getByText("この日のルーティンはありませんでした"),
    ).toBeInTheDocument();
  });
});
