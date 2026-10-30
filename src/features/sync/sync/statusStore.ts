import { DEFAULT_SYNC_STATUS, SYNC_STATUS_KEY } from "./constants";
import type { SyncStatus } from "./types";

declare global {
  interface WindowEventMap {
    /**
     * setSyncStatus が発火する同期状態の変更通知。
     * window.addEventListener で受け取るとき、detail の型をキャストなしで得るための宣言。
     */
    "sync-status-changed": CustomEvent<SyncStatus>;
  }
}

export const getSyncStatus = (): SyncStatus => {
  if (typeof window === "undefined") return DEFAULT_SYNC_STATUS;

  try {
    const stored = localStorage.getItem(SYNC_STATUS_KEY);
    if (!stored) return DEFAULT_SYNC_STATUS;
    return {
      ...DEFAULT_SYNC_STATUS,
      ...(JSON.parse(stored) as Partial<SyncStatus>),
    };
  } catch {
    return DEFAULT_SYNC_STATUS;
  }
};

/**
 * localStorage にのみ保存する（イベント発火なし）。
 * setSyncStatus のように呼び出し元に通知が不要な内部更新に使う。
 * SSR 環境では localStorage へのアクセスを行わず、計算後の値を返す。
 */
const setSyncStatusToStorage = (status: Partial<SyncStatus>): SyncStatus => {
  const current = getSyncStatus();
  const updated = { ...current, ...status };
  if (typeof window === "undefined") return updated;
  try {
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(updated));
  } catch {
    // SecurityError 等（プライベートブラウジング等）は無視
  }
  return updated;
};

export const setSyncStatus = (status: Partial<SyncStatus>): void => {
  const updated = setSyncStatusToStorage(status);
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("sync-status-changed", { detail: updated }),
  );
};

/**
 * ページロード時に localStorage へ残留した isSyncing: true をサイレントにリセットする。
 * イベントを発火しないため、呼び出し元（initializeHeaderSyncState）で
 * 1 回だけ sync-status-changed を dispatch する責任を持つ。
 */
export const resetStaleSyncingState = (): void => {
  if (typeof window === "undefined") return;
  const current = getSyncStatus();
  if (current.isSyncing) {
    setSyncStatusToStorage({ isSyncing: false });
  }
};
