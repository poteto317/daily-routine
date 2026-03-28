import type { SyncStatus } from "./types";

export const DEVICE_ID_KEY = "device-id";
export const SYNC_STATUS_KEY = "sync-status";

export const DEFAULT_SYNC_STATUS: SyncStatus = {
  isSyncing: false,
  lastSyncTime: null,
  localLastModified: null,
  remoteLastModified: null,
  hasRemoteChanges: false,
  hasLocalChanges: false,
  error: null,
};
