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
    weeklyLog?: boolean;
    calendar?: boolean;
    statistics?: boolean;
    pomodoro?: boolean;
    worktracker?: boolean;
    weightTracker?: boolean;
    workoutTracker?: boolean;
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
  /**
   * アプリを表示したままのときに、ルーティンの状態と経過色を再評価する間隔（分）。0 で定期の再評価なし。
   * バックグラウンドから戻したときは、この値に関係なくすぐに再評価する
   * （キーの名前は以前の表示名「バックグラウンド復帰リフレッシュ間隔」のまま残している）
   */
  backgroundRefreshIntervalMinutes?: number;
}
