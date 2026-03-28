/**
 * Layouts layer helper functions
 */

import texts from "./locales/ja.json";

const formatHeaderSyncTimestamp = (
  timestamp?: number | null,
): string | null => {
  if (!timestamp) return null;

  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
};

/**
 * Get header sync button title based on syncing state
 */
export const getHeaderSyncButtonTitle = (
  mode: "upload" | "download",
  syncStatus: {
    isSyncing: boolean;
    hasRemoteChanges: boolean;
    hasLocalChanges?: boolean;
    localLastModified?: number | null;
    remoteLastModified?: number | null;
  },
): string => {
  if (syncStatus.isSyncing) {
    return texts.headerSyncButton.syncingTitle;
  }

  if (mode === "download" && syncStatus.hasRemoteChanges) {
    const remoteTime = formatHeaderSyncTimestamp(syncStatus.remoteLastModified);
    const localTime = formatHeaderSyncTimestamp(syncStatus.localLastModified);

    return [
      texts.headerSyncButton.downloadAvailableTitle,
      remoteTime
        ? `${texts.headerSyncButton.cloudUpdatedPrefix} ${remoteTime}`
        : null,
      localTime
        ? `${texts.headerSyncButton.localUpdatedPrefix} ${localTime}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (mode === "upload" && syncStatus.hasLocalChanges) {
    const localTime = formatHeaderSyncTimestamp(syncStatus.localLastModified);
    const remoteTime = formatHeaderSyncTimestamp(syncStatus.remoteLastModified);

    return [
      texts.headerSyncButton.uploadAvailableTitle,
      localTime
        ? `${texts.headerSyncButton.localUpdatedPrefix} ${localTime}`
        : null,
      remoteTime
        ? `${texts.headerSyncButton.cloudUpdatedPrefix} ${remoteTime}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return mode === "upload"
    ? texts.headerSyncButton.uploadTitle
    : texts.headerSyncButton.downloadTitle;
};
