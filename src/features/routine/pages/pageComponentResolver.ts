import { SettingsPage } from "@/features/settings";
import { AchievementCalendar } from "@/features/calendar";
import { StatisticsPage } from "@/features/statistics";
import { PomodoroPage } from "@/features/pomodoro";
import { WorkTrackerPage } from "@/features/work-tracker";
import { JournalPage } from "@/features/journal";
import { WeightTrackerPage } from "@/features/weight-tracker";
import { WeatherPage } from "@/features/weather";
import { BudgetPage, BudgetCategoryManagementPage } from "@/features/budget";
import { MealPage } from "@/features/meal";
import { PresetPage } from "@/features/preset/PresetPage";
import { SyncManagementPage } from "@/features/sync";
import { TodoListManagementPage, TodoListsPage } from "@/features/todo-lists";
import { TestMatrixPage } from "@/features/test-matrix/TestMatrixPage";
import { AccountAdminPage } from "@/features/account-admin";
import type { PageType } from "./types";

export const PAGE_COMPONENTS: Partial<Record<PageType, React.ComponentType>> = {
  settings: SettingsPage,
  calendar: AchievementCalendar,
  statistics: StatisticsPage,
  pomodoro: PomodoroPage,
  worktracker: WorkTrackerPage,
  journal: JournalPage,
  "weight-tracker": WeightTrackerPage,
  meal: MealPage,
  budget: BudgetPage,
  "budget-category-management": BudgetCategoryManagementPage,
  weather: WeatherPage,
  preset: PresetPage,
  "todo-lists": TodoListsPage,
  "todo-list-management": TodoListManagementPage,
  "sync-management": SyncManagementPage,
  "test-matrix": TestMatrixPage,
  "account-admin": AccountAdminPage,
};

export const resolvePageComponent = (
  page: PageType,
): React.ComponentType | undefined => {
  return PAGE_COMPONENTS[page];
};
