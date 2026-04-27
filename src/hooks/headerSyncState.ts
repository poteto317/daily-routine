import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";
import {
  getSyncStatus,
  resetStaleSyncingState,
  refreshSyncStatusFromStoredRemote,
  type SyncStatus,
} from "@/features/sync";

export type HeaderSyncStatus = SyncStatus;

export const INITIAL_HEADER_SYNC_STATUS: HeaderSyncStatus = {
  isSyncing: false,
  lastSyncTime: null,
  localLastModified: null,
  remoteLastModified: null,
  hasRemoteChanges: false,
  hasLocalChanges: false,
  error: null,
};

/**
 * ページロード時の副作用（残留した isSyncing: true のクリア）を実行し、
 * リスナーに現在の同期状態を通知する。
 * 純粋な状態取得（getInitialHeaderSyncStatus）とは分離された単一責任の関数。
 */
export const initializeHeaderSyncState = (): void => {
  if (typeof window === "undefined") return;
  resetStaleSyncingState();
  const status = getSyncStatus();
  window.dispatchEvent(
    new CustomEvent<SyncStatus>("sync-status-changed", { detail: status }),
  );
};

/**
 * 現在の localStorage から HeaderSyncStatus を取得して返す。
 * 副作用を含まない純粋な取得関数。
 */
export const getInitialHeaderSyncStatus = (): HeaderSyncStatus => {
  if (typeof window === "undefined") return INITIAL_HEADER_SYNC_STATUS;
  return getSyncStatus();
};

type RegisterHeaderSyncListenersArgs = {
  setSyncStatus: (status: HeaderSyncStatus) => void;
  recalculateSyncStatus: () => void;
};

export const registerHeaderSyncListeners = ({
  setSyncStatus,
  recalculateSyncStatus,
}: RegisterHeaderSyncListenersArgs): (() => void) => {
  const handleSyncStatusChanged = (event: Event) => {
    const customEvent = event as CustomEvent<HeaderSyncStatus>;
    setSyncStatus(customEvent.detail);
  };

  const handleLocalDataUpdated = () => {
    recalculateSyncStatus();
  };

  window.addEventListener("sync-status-changed", handleSyncStatusChanged);
  window.addEventListener(LOCAL_DATA_UPDATED_AT_EVENT, handleLocalDataUpdated);

  return () => {
    window.removeEventListener("sync-status-changed", handleSyncStatusChanged);
    window.removeEventListener(
      LOCAL_DATA_UPDATED_AT_EVENT,
      handleLocalDataUpdated,
    );
  };
};

export const recalculateHeaderSyncStatus = (): void => {
  refreshSyncStatusFromStoredRemote();
};
