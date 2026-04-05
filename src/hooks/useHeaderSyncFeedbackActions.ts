import { useCallback } from "react";
import { applyHeaderSyncFeedback } from "./headerSyncFeedback";
import { createHeaderSyncFeedbackActionsResult } from "./headerSyncFeedbackActionsResult";
import type { HeaderSyncResult } from "./useHeaderSync";
import texts from "@/layouts/locales/ja.json";

type UseHeaderSyncFeedbackActionsArgs = {
  handleUpload: () => Promise<HeaderSyncResult>;
  handleDownload: () => Promise<HeaderSyncResult>;
  confirmAction?: (message: string) => boolean;
};

export const useHeaderSyncFeedbackActions = ({
  handleUpload,
  handleDownload,
  confirmAction = (message) => confirm(message),
}: UseHeaderSyncFeedbackActionsArgs) => {
  const handleUploadClick = useCallback(async () => {
    if (!confirmAction(texts.headerSyncButton.uploadConfirm)) return;
    const result = await handleUpload();
    applyHeaderSyncFeedback({ result });
  }, [handleUpload, confirmAction]);

  const handleDownloadClick = useCallback(async () => {
    if (!confirmAction(texts.headerSyncButton.downloadConfirm)) return;
    const result = await handleDownload();
    applyHeaderSyncFeedback({ result });
  }, [handleDownload, confirmAction]);

  return createHeaderSyncFeedbackActionsResult({
    handleUploadClick,
    handleDownloadClick,
  });
};
