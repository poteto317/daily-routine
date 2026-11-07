import { getMonthlyHistory, getRoutines } from "@/features/routine/storage";
import { getSettings } from "@/features/settings/storage";
import { getPomodoroHistory } from "@/features/pomodoro/storage";
import {
  getWorkSessionHistory,
  getWorkTemplates,
} from "@/features/work-tracker/storage";
import { getWeightHistory } from "@/features/weight-tracker/storage";
import { normalizeWorkoutSyncData } from "./workoutSyncData";
import {
  getJournalHistory,
  getWeeklyLogHistory,
} from "@/features/journal/storage";
import { getMealHistory } from "@/features/meal/storage";
import { getPresets } from "@/features/preset/storage";
import type { AppSettings } from "@/types/routine";
import type { SyncPayload } from "./types";

/**
 * budget / todoList 以外の同期対象フィールド。
 * dailyProgressは「欠損時は保存自体をしない」という別の扱いのため含めない。
 */
export type CoreSyncData = Pick<
  SyncPayload,
  | "routines"
  | "dailyHistory"
  | "settings"
  | "pomodoroHistory"
  | "workSessionHistory"
  | "workTemplates"
  | "weightHistory"
  | "workoutRecordHistory"
  | "workoutExercises"
  | "journalHistory"
  | "weeklyLogHistory"
  | "mealHistory"
  | "presets"
>;

const mergeNestedSettingsField = <T extends object>(
  local: T | undefined,
  remote: T | undefined,
): T | undefined => {
  if (remote === undefined) {
    return local;
  }
  if (local === undefined) {
    return remote;
  }
  return { ...local, ...remote };
};

/**
 * settingsは単一オブジェクトの中に独立した設定項目が時期をずらして追加されて
 * いくため、丸ごと置き換えると古いバージョンが送ったsettingsによって新しい
 * 設定項目のユーザー値が失われる。トップレベルはローカルへ上書きマージする
 * （リモートに存在するキーはリモートの値を採用する）。
 *
 * visibleFeatures / trainDelayはさらにその内部にキーが時期をずらして追加
 * されていくネストしたオブジェクトのため、トップレベルのシャローマージだけでは
 * 「リモートが一部キーのみ持つ」場合にネスト全体が置き換わり、ローカル側の
 * 未知キーが消えてしまう。この2フィールドはキー単位でマージする。
 */
export const normalizeSettings = (
  remoteSettings: AppSettings | undefined,
): AppSettings => {
  const local = getSettings();
  if (!remoteSettings) {
    return local;
  }

  return {
    ...local,
    ...remoteSettings,
    visibleFeatures: mergeNestedSettingsField(
      local?.visibleFeatures,
      remoteSettings.visibleFeatures,
    ),
    trainDelay: mergeNestedSettingsField(
      local?.trainDelay,
      remoteSettings.trainDelay,
    ),
  };
};

/**
 * リモートに存在しないフィールドは、その機能を知らない古いバージョンの端末が
 * アップロードしたデータである可能性がある。空の既定値で上書きするとローカル
 * データを消してしまうため、欠損時はローカルの値を維持する。
 * （明示的な空配列/空オブジェクトはユーザーが全削除した結果としてそのまま尊重する）
 */
export const normalizeCoreSyncData = (
  data: Partial<CoreSyncData>,
): CoreSyncData => ({
  routines: data.routines ?? getRoutines(),
  dailyHistory: data.dailyHistory ?? getMonthlyHistory(),
  settings: normalizeSettings(data.settings),
  pomodoroHistory: data.pomodoroHistory ?? getPomodoroHistory(),
  workSessionHistory: data.workSessionHistory ?? getWorkSessionHistory(),
  workTemplates: data.workTemplates ?? getWorkTemplates(),
  weightHistory: data.weightHistory ?? getWeightHistory(),
  ...normalizeWorkoutSyncData(data),
  journalHistory: data.journalHistory ?? getJournalHistory(),
  weeklyLogHistory: data.weeklyLogHistory ?? getWeeklyLogHistory(),
  mealHistory: data.mealHistory ?? getMealHistory(),
  presets: data.presets ?? getPresets(),
});
