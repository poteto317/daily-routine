import type { HeaderSyncResult } from "@/hooks/headerSyncActions";

type CreateHeaderSyncActionsResultArgs = {
  handleUpload: () => Promise<HeaderSyncResult>;
  handleDownload: () => Promise<HeaderSyncResult>;
};

export const createHeaderSyncActionsResult = ({
  handleUpload,
  handleDownload,
}: CreateHeaderSyncActionsResultArgs) => {
  return {
    handleUpload,
    handleDownload,
  };
};
