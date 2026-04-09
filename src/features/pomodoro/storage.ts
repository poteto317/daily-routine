/**
 * ポモドーロ関連のストレージ操作
 */
import { type PomodoroHistory } from "@/types/routine";
import { getStorageItem, setStorageItem, getTodayString } from "@/lib/storage/core";

const STORAGE_KEY_POMODORO = "pomodoro-history";

/**
 * ポモドーロ履歴を取得する
 * @returns {PomodoroHistory} ポモドーロ履歴オブジェクト
 */
export const getPomodoroHistory = (): PomodoroHistory => {
  return getStorageItem<PomodoroHistory>(STORAGE_KEY_POMODORO, {});
};

/**
 * ポモドーロ履歴を保存する
 * @param {PomodoroHistory} history - 保存する履歴
 */
export const savePomodoroHistory = (history: PomodoroHistory): void => {
  setStorageItem(STORAGE_KEY_POMODORO, history);
};

/**
 * 今日完了したポモドーロ数を取得する
 * @returns {number} 今日のポモドーロ数
 */
export const getTodayPomodoros = (): number => {
  const history = getPomodoroHistory();
  const today = getTodayString();
  return history[today]?.completedPomodoros || 0;
};

/**
 * 今日のポモドーロ数を1増やし、新しい合計数を返す
 * @returns {number} 更新後のポモドーロ数
 */
export const incrementTodayPomodoros = (): number => {
  const history = getPomodoroHistory();
  const today = getTodayString();
  const currentCount = history[today]?.completedPomodoros || 0;
  const newCount = currentCount + 1;

  history[today] = {
    date: today,
    completedPomodoros: newCount,
  };

  savePomodoroHistory(history);
  return newCount;
};
