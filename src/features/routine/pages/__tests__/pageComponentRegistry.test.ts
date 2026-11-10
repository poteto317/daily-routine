import {
  AccountAdminPage,
  AchievementCalendar,
  BudgetAllowanceSettingsPage,
  BudgetCategoryManagementPage,
  BudgetPage,
  BudgetSummaryPage,
  BugReportPage,
  JournalPage,
  MealPage,
  PomodoroPage,
  PresetPage,
  SettingsPage,
  StatisticsPage,
  SyncManagementPage,
  TestMatrixPage,
  TodoCategoryManagementPage,
  TodoListManagementPage,
  TodoListsPage,
  WeatherPage,
  WeeklyLogPage,
  WeightTrackerPage,
  WorkoutTrackerPage,
  WorkTrackerPage,
} from "../lazyPageComponents";
import { PAGE_COMPONENTS } from "../pageComponentRegistry";
import { VALID_PAGES } from "../types";

describe("PAGE_COMPONENTS", () => {
  it("各ページを対応する遅延コンポーネントへ割り当てる", () => {
    expect(PAGE_COMPONENTS).toEqual({
      settings: SettingsPage,
      calendar: AchievementCalendar,
      statistics: StatisticsPage,
      pomodoro: PomodoroPage,
      worktracker: WorkTrackerPage,
      journal: JournalPage,
      "weekly-log": WeeklyLogPage,
      "weight-tracker": WeightTrackerPage,
      "workout-tracker": WorkoutTrackerPage,
      meal: MealPage,
      budget: BudgetPage,
      "budget-category-management": BudgetCategoryManagementPage,
      "budget-allowance-settings": BudgetAllowanceSettingsPage,
      "budget-summary": BudgetSummaryPage,
      weather: WeatherPage,
      preset: PresetPage,
      "todo-lists": TodoListsPage,
      "todo-list-management": TodoListManagementPage,
      "todo-category-management": TodoCategoryManagementPage,
      "sync-management": SyncManagementPage,
      "test-matrix": TestMatrixPage,
      "account-admin": AccountAdminPage,
      "bug-report": BugReportPage,
    });
  });

  it("VALID_PAGES は home とレジストリの全ページに一致する（足し忘れるとメニューの項目とページ復元が home に戻る）", () => {
    expect(new Set(VALID_PAGES)).toEqual(
      new Set(["home", ...Object.keys(PAGE_COMPONENTS)]),
    );
  });
});
