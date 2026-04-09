import type { TrainDelaySettings } from "./train";

export interface AppSettings {
  defaultNotificationMinutes: number;
  defaultDurationMinutes: number;
  theme: "light" | "dark" | "auto";
  swipeAction: "delete" | "edit";
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  trainDelay?: TrainDelaySettings;
  visibleFeatures?: {
    journal?: boolean;
    calendar?: boolean;
    statistics?: boolean;
    pomodoro?: boolean;
    worktracker?: boolean;
    weightTracker?: boolean;
    meal?: boolean;
    budget?: boolean;
    weather?: boolean;
    preset?: boolean;
    todoLists?: boolean;
    syncManagement?: boolean;
    testMatrix?: boolean;
    accountAdmin?: boolean;
  };
  /** ハンバーガーメニューの機能項目の並び順（メニュー項目 ID の配列） */
  menuOrder?: string[];
  /** バックグラウンド復帰時のフォールバックリフレッシュ間隔（分）。0 で無効 */
  backgroundRefreshIntervalMinutes?: number;
}
