import type {
  AppSettings,
  BudgetData,
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
import type { TodoList } from "@/features/todo-lists/types";

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
  mealHistory: MealHistory;
  presets: RoutinePreset[];
  todoLists: TodoList[];
}

export interface SyncData {
  routines: SyncPayload["routines"];
  dailyProgress: SyncPayload["dailyProgress"];
  dailyHistory: SyncPayload["dailyHistory"];
  settings: SyncPayload["settings"];
  pomodoroHistory: SyncPayload["pomodoroHistory"];
  workSessionHistory: SyncPayload["workSessionHistory"];
  workTemplates: SyncPayload["workTemplates"];
  weightHistory: SyncPayload["weightHistory"];
  journalHistory: SyncPayload["journalHistory"];
  budgetData: SyncPayload["budgetData"];
  mealHistory: SyncPayload["mealHistory"];
  presets: SyncPayload["presets"];
  todoLists: SyncPayload["todoLists"];
  lastModified: number;
  deviceId: string;
}

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
