import { useCallback } from "react";
import { applyHeaderSyncFeedback } from "./headerSyncFeedback";
import { createHeaderSyncFeedbackActionsResult } from "./headerSyncFeedbackActionsResult";
import type { HeaderSyncResult } from "./useHeaderSync";

type UseHeaderSyncFeedbackActionsArgs = {
  handleUpload: () => Promise<HeaderSyncResult>;
  handleDownload: () => Promise<HeaderSyncResult>;
};

export const useHeaderSyncFeedbackActions = ({
  handleUpload,
  handleDownload,
}: UseHeaderSyncFeedbackActionsArgs) => {
  const handleUploadClick = useCallback(async () => {
    const result = await handleUpload();
    applyHeaderSyncFeedback({ result });
  }, [handleUpload]);

  const handleDownloadClick = useCallback(async () => {
    const result = await handleDownload();
    applyHeaderSyncFeedback({ result });
  }, [handleDownload]);

  return createHeaderSyncFeedbackActionsResult({
    handleUploadClick,
    handleDownloadClick,
  });
};
