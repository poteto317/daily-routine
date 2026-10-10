import {
  getDailyProgress,
  getMonthlyHistory,
  getRoutines,
  saveDailyProgressForSync,
  saveMonthlyHistory,
  saveRoutines,
} from "@/features/routine/storage";
import {
  getLocalDataUpdatedAt,
  setLocalDataUpdatedAt,
  withSyncBatch,
} from "@/lib/storage/core";
import { getSettings, saveSettings } from "@/features/settings/storage";
import {
  getPomodoroHistory,
  savePomodoroHistory,
} from "@/features/pomodoro/storage";
import {
  getWorkSessionHistory,
  getWorkTemplates,
  saveWorkSessionHistory,
  saveWorkTemplates,
} from "@/features/work-tracker/storage";
import {
  getWeightHistory,
  saveWeightHistory,
} from "@/features/weight-tracker/storage";
import {
  getWorkoutRecordHistory,
  saveWorkoutRecordHistory,
} from "@/features/workout-tracker/storage";
import {
  getJournalHistory,
  saveJournalHistory,
} from "@/features/journal/storage";
import { getMealHistory, saveMealHistory } from "@/features/meal/storage";
import { getPresets, savePresets } from "@/features/preset/storage";
import {
  collectBudgetSyncData,
  normalizeBudgetSyncData,
  saveBudgetSyncData,
} from "./budgetSyncData";
import { hasAnyLocalSyncData } from "./localDataHelpers";
import {
  collectTodoListSyncData,
  normalizeTodoListSyncData,
  saveTodoListSyncData,
} from "./todoListSyncData";
import { migrateDateKeys } from "@/lib/dateKeyMigration";
import { collectLatestTimestamp } from "./timestamp";
import { normalizeCoreSyncData } from "./syncDataNormalizer";
import type { SyncData, SyncPayload } from "./types";

export const collectLocalSyncData = (): Omit<
  SyncData,
  "lastModified" | "deviceId"
> => ({
  routines: getRoutines(),
  dailyProgress: getDailyProgress(),
  dailyHistory: getMonthlyHistory(),
  settings: getSettings(),
  pomodoroHistory: getPomodoroHistory(),
  workSessionHistory: getWorkSessionHistory(),
  workTemplates: getWorkTemplates(),
  weightHistory: getWeightHistory(),
  workoutRecordHistory: getWorkoutRecordHistory(),
  journalHistory: getJournalHistory(),
  ...collectBudgetSyncData(),
  mealHistory: getMealHistory(),
  presets: getPresets(),
  ...collectTodoListSyncData(),
});

export const saveSyncDataToLocal = (
  data: Partial<SyncData>,
  options?: { skipTimestampUpdate?: boolean },
): void => {
  // 本関数はクラウドからのダウンロードとスナップショット復元の両方で使われる。
  // どちらの経路でも、渡されたデータに存在しないフィールドは「空」ではなく
  // 「その機能を知らない古いバージョンが書いたため情報がない」とみなし、
  // ローカルの値を維持する（データを消さない側に倒す）。
  //
  // 型注釈により、SyncPayloadへフィールドを追加した際にいずれの正規化関数でも
  // 扱われていなければコンパイルエラーになる。
  // （収集側のcollectLocalSyncDataは戻り値型で網羅が強制されているのに対し、
  //   復元側は強制がなく、新機能のデータがクラウドから復元されないまま
  //   気づけない状態だったため）
  //
  // dailyProgressだけは上記の正規化対象に含めない。他フィールドは
  // 「明示的な空＝ユーザーが全削除した」と解釈して尊重するが、dailyProgressの
  // nullは「その日まだ何も完了していない」を意味するため（getDailyProgressは
  // 記録が無いときnullを返す）、これを尊重して上書きすると他端末で記録済みの
  // 当日の完了状況を消してしまう。undefined/nullのどちらもローカルを維持する。
  const normalized: Omit<SyncPayload, "dailyProgress"> = {
    ...normalizeCoreSyncData(data),
    ...normalizeBudgetSyncData(data),
    ...normalizeTodoListSyncData(data),
  };

  withSyncBatch(() => {
    saveRoutines(normalized.routines);
    if (data.dailyProgress) {
      saveDailyProgressForSync(data.dailyProgress);
    }
    saveMonthlyHistory(normalized.dailyHistory);
    saveSettings(normalized.settings);
    savePomodoroHistory(normalized.pomodoroHistory);
    saveWorkSessionHistory(normalized.workSessionHistory);
    saveWorkTemplates(normalized.workTemplates);
    saveWeightHistory(normalized.weightHistory);
    saveWorkoutRecordHistory(normalized.workoutRecordHistory);
    saveJournalHistory(normalized.journalHistory);
    saveBudgetSyncData(normalized);
    saveMealHistory(normalized.mealHistory);
    savePresets(normalized.presets);
    saveTodoListSyncData(normalized);

    // クラウド側には日付キーの修正前に保存された記録が残っている。
    // そのまま書き戻すと、直したはずのローカルが元へ戻り、ログイン時の
    // 1 度きりの移行はもう走らないため直せなくなる。
    // ダウンロードとスナップショット復元の両方がここを通る。
    //
    // バッチの中で行う。外に出すと移行の保存ごとに更新時刻が書かれ、
    // そのたびにイベントが飛んで購読側が一瞬「ローカル変更あり」と
    // 判断しうる。更新時刻の確定はこの下の 1 回に統一する。
    migrateDateKeys();
  });

  if (!options?.skipTimestampUpdate) {
    setLocalDataUpdatedAt(data.lastModified ?? Date.now());
  }
};

export const hasLocalData = (): boolean => {
  const data = collectLocalSyncData();

  return hasAnyLocalSyncData(data);
};

export const getLocalLastModified = (): number => {
  const explicitLocalLastModified = getLocalDataUpdatedAt();
  if (explicitLocalLastModified > 0) {
    return explicitLocalLastModified;
  }

  return collectLatestTimestamp(collectLocalSyncData());
};
