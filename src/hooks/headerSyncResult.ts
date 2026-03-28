import type { HeaderSyncResult } from "@/hooks/headerSyncActions";
import type { HeaderSyncStatus } from "@/hooks/headerSyncState";

type CreateHeaderSyncResultArgs = {
  syncStatus: HeaderSyncStatus;
  handleUpload: () => Promise<HeaderSyncResult>;
  handleDownload: () => Promise<HeaderSyncResult>;
};

export const createHeaderSyncResult = ({
  syncStatus,
  handleUpload,
  handleDownload,
}: CreateHeaderSyncResultArgs) => {
  return {
    syncStatus,
    handleUpload,
    handleDownload,
  };
};
