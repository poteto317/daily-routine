import { useCallback } from "react";
import { createHeaderSyncActionsResult } from "./headerSyncActionsResult";
import {
  runHeaderDownload,
  runHeaderUpload,
  type HeaderSyncResult,
} from "./headerSyncActions";

export type UseHeaderSyncActionsResult = {
  handleUpload: () => Promise<HeaderSyncResult>;
  handleDownload: () => Promise<HeaderSyncResult>;
};

export const useHeaderSyncActions = (
  isSyncing: boolean,
): UseHeaderSyncActionsResult => {
  const handleUpload = useCallback(async (): Promise<HeaderSyncResult> => {
    return runHeaderUpload(isSyncing);
  }, [isSyncing]);

  const handleDownload = useCallback(async (): Promise<HeaderSyncResult> => {
    return runHeaderDownload(isSyncing);
  }, [isSyncing]);

  return createHeaderSyncActionsResult({
    handleUpload,
    handleDownload,
  });
};
