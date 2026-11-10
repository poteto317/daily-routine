import type { Routine } from "@/types/routine";

/** ページの種類 */
export type PageType =
  | "home"
  | "journal"
  | "weekly-log"
  | "settings"
  | "calendar"
  | "statistics"
  | "pomodoro"
  | "worktracker"
  | "weight-tracker"
  | "workout-tracker"
  | "weather"
  | "meal"
  | "budget"
  | "budget-category-management"
  | "budget-allowance-settings"
  | "budget-summary"
  | "preset"
  | "todo-lists"
  | "todo-list-management"
  | "todo-category-management"
  | "sync-management"
  | "test-matrix"
  | "account-admin"
  | "bug-report";

/** 有効なページ一覧 */
export const VALID_PAGES: PageType[] = [
  "home",
  "journal",
  "weekly-log",
  "settings",
  "calendar",
  "statistics",
  "pomodoro",
  "worktracker",
  "weight-tracker",
  "workout-tracker",
  "weather",
  "meal",
  "budget",
  "budget-category-management",
  "budget-allowance-settings",
  "budget-summary",
  "preset",
  "todo-lists",
  "todo-list-management",
  "todo-category-management",
  "sync-management",
  "test-matrix",
  "account-admin",
  "bug-report",
];

/** ルーティンデータ（ID・タイムスタンプを除く） */
export type RoutineData = Omit<Routine, "id" | "createdAt" | "updatedAt">;

/** ルーティンCRUD操作のインターフェース */
export interface RoutineCrudOps {
  routines: Routine[];
  addRoutine: (data: RoutineData) => void;
  updateRoutine: (id: string, data: RoutineData) => void;
  deleteRoutine: (id: string) => void;
  deleteRoutineGroup: (groupId: string) => void;
}
