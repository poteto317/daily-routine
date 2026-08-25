import dynamic from "next/dynamic";
import { PageDynamicFallback } from "./PageDynamicFallback";

export const SettingsPage = dynamic(
  () =>
    import("@/features/settings/SettingsPage").then(
      (module) => module.SettingsPage,
    ),
  { loading: PageDynamicFallback },
);

export const AchievementCalendar = dynamic(
  () =>
    import("@/features/calendar/AchievementCalendar").then(
      (module) => module.AchievementCalendar,
    ),
  { loading: PageDynamicFallback },
);

export const StatisticsPage = dynamic(
  () =>
    import("@/features/statistics/StatisticsPage").then(
      (module) => module.StatisticsPage,
    ),
  { loading: PageDynamicFallback },
);

export const PomodoroPage = dynamic(
  () =>
    import("@/features/pomodoro/PomodoroPage").then(
      (module) => module.PomodoroPage,
    ),
  { loading: PageDynamicFallback },
);

export const WorkTrackerPage = dynamic(
  () =>
    import("@/features/work-tracker/WorkTrackerPage").then(
      (module) => module.WorkTrackerPage,
    ),
  { loading: PageDynamicFallback },
);

export const JournalPage = dynamic(
  () =>
    import("@/features/journal/JournalPage").then(
      (module) => module.JournalPage,
    ),
  { loading: PageDynamicFallback },
);

export const WeightTrackerPage = dynamic(
  () =>
    import("@/features/weight-tracker/WeightTrackerPage").then(
      (module) => module.WeightTrackerPage,
    ),
  { loading: PageDynamicFallback },
);

export const WorkoutTrackerPage = dynamic(
  () =>
    import("@/features/workout-tracker/WorkoutTrackerPage").then(
      (module) => module.WorkoutTrackerPage,
    ),
  { loading: PageDynamicFallback },
);

export const WeatherPage = dynamic(
  () =>
    import("@/features/weather/WeatherPage").then(
      (module) => module.WeatherPage,
    ),
  { loading: PageDynamicFallback },
);

export const BudgetPage = dynamic(
  () =>
    import("@/features/budget/BudgetPage").then((module) => module.BudgetPage),
  { loading: PageDynamicFallback },
);

export const BudgetCategoryManagementPage = dynamic(
  () =>
    import("@/features/budget/components/BudgetCategoryManagementPage").then(
      (module) => module.BudgetCategoryManagementPage,
    ),
  { loading: PageDynamicFallback },
);

export const BudgetAllowanceSettingsPage = dynamic(
  () =>
    import("@/features/budget/components/BudgetAllowanceSettingsPage").then(
      (module) => module.BudgetAllowanceSettingsPage,
    ),
  { loading: PageDynamicFallback },
);

export const BudgetSummaryPage = dynamic(
  () =>
    import("@/features/budget/components/BudgetSummaryPage").then(
      (module) => module.BudgetSummaryPage,
    ),
  { loading: PageDynamicFallback },
);

export const MealPage = dynamic(
  () => import("@/features/meal/MealPage").then((module) => module.MealPage),
  { loading: PageDynamicFallback },
);

export const PresetPage = dynamic(
  () =>
    import("@/features/preset/PresetPage").then((module) => module.PresetPage),
  { loading: PageDynamicFallback },
);

export const SyncManagementPage = dynamic(
  () =>
    import("@/features/sync/SyncManagementPage").then(
      (module) => module.SyncManagementPage,
    ),
  { loading: PageDynamicFallback },
);

export const TodoListsPage = dynamic(
  () =>
    import("@/features/todo-lists/TodoListsPage").then(
      (module) => module.TodoListsPage,
    ),
  { loading: PageDynamicFallback },
);

export const TodoListManagementPage = dynamic(
  () =>
    import("@/features/todo-lists/TodoListManagementPage").then(
      (module) => module.TodoListManagementPage,
    ),
  { loading: PageDynamicFallback },
);

export const TodoCategoryManagementPage = dynamic(
  () =>
    import("@/features/todo-lists/TodoCategoryManagementPage").then(
      (module) => module.TodoCategoryManagementPage,
    ),
  { loading: PageDynamicFallback },
);

export const TestMatrixPage = dynamic(
  () =>
    import("@/features/test-matrix/TestMatrixPage").then(
      (module) => module.TestMatrixPage,
    ),
  { loading: PageDynamicFallback },
);

export const AccountAdminPage = dynamic(
  () =>
    import("@/features/account-admin/AccountAdminPage").then(
      (module) => module.AccountAdminPage,
    ),
  { loading: PageDynamicFallback },
);

export const BugReportPage = dynamic(
  () =>
    import("@/features/bug-report/components/BugReportPage").then(
      (module) => module.BugReportPage,
    ),
  { loading: PageDynamicFallback },
);
