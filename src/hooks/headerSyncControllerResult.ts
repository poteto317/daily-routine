import type { HeaderSyncStatus } from "@/hooks/useHeaderSync";

type CreateHeaderSyncControllerResultArgs = {
  syncStatus: HeaderSyncStatus;
  handleUploadClick: () => Promise<void>;
  handleDownloadClick: () => Promise<void>;
};

export const createHeaderSyncControllerResult = ({
  syncStatus,
  handleUploadClick,
  handleDownloadClick,
}: CreateHeaderSyncControllerResultArgs) => ({
  syncStatus,
  handleUploadClick,
  handleDownloadClick,
});
