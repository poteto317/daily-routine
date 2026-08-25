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
  WeightTrackerPage,
  WorkoutTrackerPage,
  WorkTrackerPage,
} from "../lazyPageComponents";
import { PAGE_COMPONENTS } from "../pageComponentRegistry";

describe("PAGE_COMPONENTS", () => {
  it("各ページを対応する遅延コンポーネントへ割り当てる", () => {
    expect(PAGE_COMPONENTS).toEqual({
      settings: SettingsPage,
      calendar: AchievementCalendar,
      statistics: StatisticsPage,
      pomodoro: PomodoroPage,
      worktracker: WorkTrackerPage,
      journal: JournalPage,
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
});
