import type { SyncLatestAction, SyncStatus } from "./types";

type ResolveSyncLatestPlanArgs = {
  remoteExists: boolean;
  hasLocalData: boolean;
  localLastModified: number;
  remoteLastModified: number;
  now: number;
};

type SyncLatestPlan = {
  action: SyncLatestAction;
  effect: "upload" | "download" | "none";
  nextStatus?: Partial<SyncStatus>;
};

const normalizeTimestamp = (value: number): number | null => {
  return value > 0 ? value : null;
};

export const buildNoDataSyncStatus = (
  localLastModified: number,
): Partial<SyncStatus> => ({
  isSyncing: false,
  localLastModified: normalizeTimestamp(localLastModified),
  remoteLastModified: null,
  hasRemoteChanges: false,
  hasLocalChanges: false,
  error: null,
});

export const buildUpToDateSyncStatus = (args: {
  now: number;
  localLastModified: number;
  remoteLastModified: number;
}): Partial<SyncStatus> => ({
  isSyncing: false,
  lastSyncTime: args.now,
  localLastModified: normalizeTimestamp(args.localLastModified),
  remoteLastModified: normalizeTimestamp(args.remoteLastModified),
  hasRemoteChanges: false,
  hasLocalChanges: false,
  error: null,
});

export const resolveSyncLatestPlan = ({
  remoteExists,
  hasLocalData,
  localLastModified,
  remoteLastModified,
  now,
}: ResolveSyncLatestPlanArgs): SyncLatestPlan => {
  if (!remoteExists) {
    if (!hasLocalData) {
      return {
        action: "no-data",
        effect: "none",
        nextStatus: buildNoDataSyncStatus(localLastModified),
      };
    }

    return {
      action: "uploaded",
      effect: "upload",
    };
  }

  if (remoteLastModified > localLastModified) {
    return {
      action: "downloaded",
      effect: "download",
    };
  }

  if (localLastModified > remoteLastModified) {
    return {
      action: "uploaded",
      effect: "upload",
    };
  }

  return {
    action: "up-to-date",
    effect: "none",
    nextStatus: buildUpToDateSyncStatus({
      now,
      localLastModified,
      remoteLastModified,
    }),
  };
};

export type { SyncLatestPlan };
