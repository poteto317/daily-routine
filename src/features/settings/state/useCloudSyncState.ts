import { useCloudSyncActions } from "./useCloudSyncActions";
import { createCloudSyncStateResult } from "./cloudSyncStateResult";
import { useCloudSyncStatusState } from "./useCloudSyncStatusState";

export const useCloudSyncState = () => {
  const statusState = useCloudSyncStatusState();
  const actions = useCloudSyncActions();

  return createCloudSyncStateResult({
    actions,
    statusState,
  });
};
