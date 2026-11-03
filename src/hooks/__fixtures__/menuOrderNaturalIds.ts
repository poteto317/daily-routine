/**
 * テスト用: buildMenuOrderNaturalIds が返す自然順のうち、Todoリストより前と後ろの固定でない項目。
 * menuConfig の項目が増減したら、ここだけを直す。
 * 正しさは headerMenuOrder.test.ts の buildMenuOrderNaturalIds のテストで確かめる。
 */
export const STATICS_BEFORE_LISTS = [
  "journal",
  "weight-tracker",
  "workout-tracker",
  "pomodoro",
  "worktracker",
  "meal",
  "budget",
  "weather",
  "calendar",
  "statistics",
  "preset",
];

export const STATICS_AFTER_LISTS = [
  "todo-list-management",
  "sync-management",
  "bug-report",
  "test-matrix",
];
