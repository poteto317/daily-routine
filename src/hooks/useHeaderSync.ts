import type { HeaderSyncResult } from "./headerSyncActions";
import type { HeaderSyncStatus } from "./headerSyncState";
import { createHeaderSyncResult } from "./headerSyncResult";
import { useHeaderSyncActions } from "./useHeaderSyncActions";
import { useHeaderSyncStatus } from "./useHeaderSyncStatus";

export type { HeaderSyncResult } from "./headerSyncActions";
export type { HeaderSyncStatus } from "./headerSyncState";

export type UseHeaderSyncResult = {
  syncStatus: HeaderSyncStatus;
  handleUpload: () => Promise<HeaderSyncResult>;
  handleDownload: () => Promise<HeaderSyncResult>;
};

export const useHeaderSync = (): UseHeaderSyncResult => {
  const syncStatus = useHeaderSyncStatus();
  const { handleUpload, handleDownload } = useHeaderSyncActions(
    syncStatus.isSyncing,
  );

  return createHeaderSyncResult({
    syncStatus,
    handleUpload,
    handleDownload,
  });
};
