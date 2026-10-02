import { render, screen } from "@testing-library/react";
import * as lazyComponents from "../lazyPageComponents";

describe("lazyPageComponents", () => {
  it("機能ページは読み込み表示を経て描画される", async () => {
    render(<lazyComponents.SettingsPage />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "画面を読み込んでいます...",
    );
    expect(await screen.findByText("⚙️ 設定")).toBeInTheDocument();
  });

  it("すべての機能ページコンポーネントがエクスポートされ描画可能である", () => {
    const components = [
      lazyComponents.SettingsPage,
      lazyComponents.AchievementCalendar,
      lazyComponents.StatisticsPage,
      lazyComponents.PomodoroPage,
      lazyComponents.WorkTrackerPage,
      lazyComponents.JournalPage,
      lazyComponents.WeightTrackerPage,
      lazyComponents.WorkoutTrackerPage,
      lazyComponents.WeatherPage,
      lazyComponents.BudgetPage,
      lazyComponents.BudgetCategoryManagementPage,
      lazyComponents.BudgetAllowanceSettingsPage,
      lazyComponents.BudgetSummaryPage,
      lazyComponents.MealPage,
      lazyComponents.PresetPage,
      lazyComponents.SyncManagementPage,
      lazyComponents.TodoListsPage,
      lazyComponents.TodoListManagementPage,
      lazyComponents.TodoCategoryManagementPage,
      lazyComponents.TestMatrixPage,
      lazyComponents.AccountAdminPage,
      lazyComponents.BugReportPage,
    ];

    for (const Comp of components) {
      expect(Comp).toBeDefined();
      const { unmount } = render(<Comp />);
      unmount();
    }
  });
});
