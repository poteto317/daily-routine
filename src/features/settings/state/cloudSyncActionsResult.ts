type CloudSyncActionsResultArgs = {
  handleUploadToCloud: () => Promise<void>;
  handleDownloadFromCloud: () => Promise<void>;
};

export const createCloudSyncActionsResult = ({
  handleUploadToCloud,
  handleDownloadFromCloud,
}: CloudSyncActionsResultArgs) => {
  return {
    handleUploadToCloud,
    handleDownloadFromCloud,
  };
};
