import type {
  AppSettings,
  BudgetCategory,
  BudgetData,
  BudgetExpenseItem,
  BudgetIncomeItem,
  DailyHistory,
  DailyProgress,
  JournalHistory,
  MealHistory,
  PomodoroHistory,
  Routine,
  RoutinePreset,
  WeightHistory,
  WorkSessionHistory,
  WorkTemplate,
} from "@/types/routine";
import type { TodoCategory, TodoList } from "@/features/todo-lists/types";

export interface SyncPayload {
  routines: Routine[];
  dailyProgress: DailyProgress | null;
  dailyHistory: Record<string, DailyHistory>;
  settings: AppSettings;
  pomodoroHistory: PomodoroHistory;
  workSessionHistory: WorkSessionHistory;
  workTemplates: WorkTemplate[];
  weightHistory: WeightHistory;
  journalHistory: JournalHistory;
  budgetData: BudgetData;
  budgetCategories: BudgetCategory[];
  budgetIncomeItems: BudgetIncomeItem[];
  budgetExpenseItems: BudgetExpenseItem[];
  mealHistory: MealHistory;
  presets: RoutinePreset[];
  todoLists: TodoList[];
  todoCategories: TodoCategory[];
}

export type SyncData = SyncPayload & {
  lastModified: number;
  deviceId: string;
};

export interface SyncSnapshot {
  id: string;
  uploadedAt: number;
  deviceId: string;
  data: SyncPayload;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  localLastModified?: number | null;
  remoteLastModified?: number | null;
  hasRemoteChanges: boolean;
  hasLocalChanges?: boolean;
  error: string | null;
}

export type SyncLatestAction =
  | "uploaded"
  | "downloaded"
  | "up-to-date"
  | "no-data";
