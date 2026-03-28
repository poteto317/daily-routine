import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";
import {
  getSyncStatus,
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
