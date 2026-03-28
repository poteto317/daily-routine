type CreateHeaderSyncFeedbackActionsResultArgs = {
  handleUploadClick: () => Promise<void>;
  handleDownloadClick: () => Promise<void>;
};

export const createHeaderSyncFeedbackActionsResult = ({
  handleUploadClick,
  handleDownloadClick,
}: CreateHeaderSyncFeedbackActionsResultArgs) => {
  return {
    handleUploadClick,
    handleDownloadClick,
  };
};
