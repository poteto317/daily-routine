import type { SyncStatus } from "./types";

export const DEVICE_ID_KEY = "device-id";
export const SYNC_STATUS_KEY = "sync-status";
export const SYNCED_CONTENT_HASH_KEY = "synced-content-hash";

/** アップロード/ダウンロード処理のタイムアウト時間 (ms) */
export const SYNC_TIMEOUT_MS = 30_000;

export const DEFAULT_SYNC_STATUS: SyncStatus = {
  isSyncing: false,
  lastSyncTime: null,
  localLastModified: null,
  remoteLastModified: null,
  hasRemoteChanges: false,
  hasLocalChanges: false,
  error: null,
};
