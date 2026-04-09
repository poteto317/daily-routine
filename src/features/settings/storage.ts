/**
 * 設定関連のストレージ操作
 */
import { AppSettings } from "@/types/routine";
import { setStorageItem, getUserScopedKey } from "@/lib/storage/core";

/** saveSettings が呼ばれたときに window で発火する CustomEvent 名 */
export const SETTINGS_UPDATED_EVENT = "settings-updated";

const STORAGE_KEY_SETTINGS = "app-settings";

const DEFAULT_SETTINGS: AppSettings = {
  defaultNotificationMinutes: 0,
  defaultDurationMinutes: 30,
  theme: "light",
  swipeAction: "delete",
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  trainDelay: {
    enabled: false,
    monitoredLines: [],
  },
  visibleFeatures: {
    journal: true,
    calendar: true,
    statistics: true,
    pomodoro: true,
    worktracker: true,
    weightTracker: true,
    meal: true,
    budget: true,
    weather: true,
    preset: true,
    todoLists: true,
    syncManagement: true,
    testMatrix: true,
    accountAdmin: true,
  },
  backgroundRefreshIntervalMinutes: 30,
};

export { DEFAULT_SETTINGS };

/**
 * アプリケーション設定を取得する
 * 保存されている設定とデフォルト設定をマージして返す
 * @returns {AppSettings} アプリケーション設定
 */
export const getSettings = (): AppSettings => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(getUserScopedKey(STORAGE_KEY_SETTINGS));
    return data
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

/**
 * アプリケーション設定を保存する
 * @param {AppSettings} settings - 保存する設定
 */
export const saveSettings = (settings: AppSettings): void => {
  setStorageItem(STORAGE_KEY_SETTINGS, settings);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT));
  }
};
