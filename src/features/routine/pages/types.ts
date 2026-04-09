import { type Routine } from "@/types/routine";

/** ページの種類 */
export type PageType =
  | "home"
  | "journal"
  | "settings"
  | "calendar"
  | "statistics"
  | "pomodoro"
  | "worktracker"
  | "weight-tracker"
  | "weather"
  | "meal"
  | "budget"
  | "preset"
  | "todo-lists"
  | "todo-list-management"
  | "sync-management"
  | "test-matrix"
  | "account-admin";

/** 有効なページ一覧 */
export const VALID_PAGES: PageType[] = [
  "home",
  "journal",
  "settings",
  "calendar",
  "statistics",
  "pomodoro",
  "worktracker",
  "weight-tracker",
  "weather",
  "meal",
  "budget",
  "preset",
  "todo-lists",
  "todo-list-management",
  "sync-management",
  "test-matrix",
  "account-admin",
];

/** ルーティンデータ（ID・タイムスタンプを除く） */
export type RoutineData = Omit<Routine, "id" | "createdAt" | "updatedAt">;

/** ルーティンCRUD操作のインターフェース */
export interface RoutineCrudOps {
  routines: Routine[];
  addRoutine: (data: RoutineData) => void;
  updateRoutine: (id: string, data: RoutineData) => void;
  updateRoutineGroup: (groupId: string, data: RoutineData) => void;
  deleteRoutine: (id: string) => void;
  deleteRoutineGroup: (groupId: string) => void;
}
