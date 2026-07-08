type LocalSyncDataSummary = {
  routines: unknown[];
  dailyProgress: unknown | null;
  dailyHistory: Record<string, unknown>;
  pomodoroHistory: Record<string, unknown>;
  workSessionHistory: Record<string, unknown>;
  workTemplates: unknown[];
  weightHistory: Record<string, unknown>;
  journalHistory: Record<string, unknown>;
  budgetData: {
    budgets?: Record<string, unknown>;
    expenses?: Record<string, unknown>;
  };
  budgetCategories: unknown[];
  mealHistory: Record<string, unknown>;
  presets: unknown[];
  todoLists: unknown[];
};

export const createDeviceId = (): string => {
  return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const hasAnyLocalSyncData = (data: LocalSyncDataSummary): boolean => {
  return (
    data.routines.length > 0 ||
    !!data.dailyProgress ||
    Object.keys(data.dailyHistory).length > 0 ||
    Object.keys(data.pomodoroHistory).length > 0 ||
    Object.keys(data.workSessionHistory).length > 0 ||
    data.workTemplates.length > 0 ||
    Object.keys(data.weightHistory).length > 0 ||
    Object.keys(data.journalHistory).length > 0 ||
    Object.keys(data.budgetData.budgets || {}).length > 0 ||
    Object.keys(data.budgetData.expenses || {}).length > 0 ||
    data.budgetCategories.length > 0 ||
    Object.keys(data.mealHistory).length > 0 ||
    data.presets.length > 0 ||
    data.todoLists.length > 0
  );
};
