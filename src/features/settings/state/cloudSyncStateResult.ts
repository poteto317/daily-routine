import type { useCloudSyncActions } from "./useCloudSyncActions";
import type { useCloudSyncStatusState } from "./useCloudSyncStatusState";

type CloudSyncStateResultArgs = {
  actions: ReturnType<typeof useCloudSyncActions>;
  statusState: ReturnType<typeof useCloudSyncStatusState>;
};

export const createCloudSyncStateResult = ({
  actions,
  statusState,
}: CloudSyncStateResultArgs) => {
  return {
    syncStatus: statusState.syncStatus,
    handleUploadToCloud: actions.handleUploadToCloud,
    handleDownloadFromCloud: actions.handleDownloadFromCloud,
  };
};
