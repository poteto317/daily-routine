import { DEFAULT_SYNC_STATUS, SYNC_STATUS_KEY } from "./constants";
import type { SyncStatus } from "./types";

export const getSyncStatus = (): SyncStatus => {
  const stored = localStorage.getItem(SYNC_STATUS_KEY);

  if (!stored) return DEFAULT_SYNC_STATUS;

  try {
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
 */
const setSyncStatusToStorage = (status: Partial<SyncStatus>): SyncStatus => {
  const current = getSyncStatus();
  const updated = { ...current, ...status };
  localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(updated));
  return updated;
};

export const setSyncStatus = (status: Partial<SyncStatus>): void => {
  const updated = setSyncStatusToStorage(status);
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
  const current = getSyncStatus();
  if (current.isSyncing) {
    setSyncStatusToStorage({ isSyncing: false });
  }
};
