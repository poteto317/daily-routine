import type { SyncData, SyncStatus } from "./types";

type BuildSyncUploadDataArgs = {
  localData: Omit<SyncData, "lastModified" | "deviceId">;
  lastModified: number;
  deviceId: string;
};

type BuildUploadSuccessStatusArgs = {
  syncedAt: number;
  lastSyncTime: number;
};

export const buildSyncUploadData = ({
  localData,
  lastModified,
  deviceId,
}: BuildSyncUploadDataArgs): SyncData => ({
  ...localData,
  lastModified,
  deviceId,
});

export const buildUploadSuccessStatus = ({
  syncedAt,
  lastSyncTime,
}: BuildUploadSuccessStatusArgs): Partial<SyncStatus> => ({
  isSyncing: false,
  lastSyncTime,
  localLastModified: syncedAt,
  remoteLastModified: syncedAt,
  hasRemoteChanges: false,
  hasLocalChanges: false,
  error: null,
});
