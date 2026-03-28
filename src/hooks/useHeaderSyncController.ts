import { useHeaderSync, type HeaderSyncStatus } from "@/hooks/useHeaderSync";
import { createHeaderSyncControllerResult } from "./headerSyncControllerResult";
import { useHeaderSyncFeedbackActions } from "./useHeaderSyncFeedbackActions";

export type UseHeaderSyncControllerResult = {
  syncStatus: HeaderSyncStatus;
  handleUploadClick: () => Promise<void>;
  handleDownloadClick: () => Promise<void>;
};

export const useHeaderSyncController = (): UseHeaderSyncControllerResult => {
  const { syncStatus, handleUpload, handleDownload } = useHeaderSync();
  const { handleUploadClick, handleDownloadClick } =
    useHeaderSyncFeedbackActions({
      handleUpload,
      handleDownload,
    });

  return createHeaderSyncControllerResult({
    syncStatus,
    handleUploadClick,
    handleDownloadClick,
  });
};
