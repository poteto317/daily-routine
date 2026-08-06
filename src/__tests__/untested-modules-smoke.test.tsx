jest.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

jest.mock("../app/globals.css", () => ({}), { virtual: true });

describe("untested modules smoke", () => {
  const modulePaths = [
    "../app/layout",
    "../app/page",
    "../components/AuthGuard",
    "../components/index",
    "../components/TrainDelayNotification",
    "../features/account-admin/AccountAdminPage",
    "../features/account-admin/index",
    "../features/account-admin/types",
    "../features/auth/index",
    "../features/auth/login/LoginPage",
    "../features/budget/BudgetPage",
    "../features/budget/index",
    "../features/calendar/index",
    "../features/journal/index",
    "../features/journal/JournalPage",
    "../features/meal/index",
    "../features/meal/MealPage",
    "../features/notification/index",
    "../features/pomodoro/index",
    "../features/pomodoro/PomodoroPage",
    "../features/preset/PresetManager",
    "../features/preset/PresetPage",
    "../features/routine/components/RoutineCardContent",
    "../features/routine/components/RoutineForm",
    "../features/routine/components/RoutineItem",
    "../features/routine/components/SortableRoutineItem",
    "../features/routine/components/SortableRoutineNormalDragItem",
    "../features/routine/hooks/index",
    "../features/routine/hooks/useRoutines",
    "../features/routine/index",
    "../features/routine/pages/DraggableRoutineList",
    "../features/routine/pages/HomeContent",
    "../features/routine/pages/HomePage",
    "../features/routine/pages/PageLayout",
    "../features/routine/pages/RoutineList",
    "../features/routine/pages/types",
    "../features/settings/index",
    "../features/statistics/index",
    "../features/sync/index",
    "../features/weather/index",
    "../features/weather/WeatherPage",
    "../features/weight-tracker/index",
    "../features/weight-tracker/WeightTrackerPage",
    "../features/work-tracker/index",
    "../features/work-tracker/WorkTrackerPage",
    "../features/workout-tracker/index",
    "../features/workout-tracker/WorkoutTrackerPage",
    "../hooks/usePWAInstaller",
    "../hooks/useThemeEffect",
    "../layouts/index",
    "../lib/storage/index",
    "../features/test-matrix/detailedTestCases",
    "../features/test-matrix/index",
    "../features/test-matrix/TestMatrixPage",
    "../types/routine",
  ] as const;

  it.each(modulePaths)("%s が読み込み可能", async (modulePath) => {
    const mod = await import(modulePath);
    expect(mod).toBeDefined();
  });
});
