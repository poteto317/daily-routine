import { createSyncManagementPageActionBindings } from "./syncManagementPageActionBindings";
import { createSyncManagementPageStateResult } from "./syncManagementPageStateResult";
import { useSyncSnapshotActions } from "./useSyncSnapshotActions";
import { useSyncSnapshotDataState } from "./useSyncSnapshotDataState";

export const useSyncManagementPageState = () => {
  const data = useSyncSnapshotDataState();
  const actions = useSyncSnapshotActions(
    createSyncManagementPageActionBindings({
      setSnapshots: data.setSnapshots,
    }),
  );

  return createSyncManagementPageStateResult({
    activeSnapshotId: actions.activeSnapshotId,
    error: data.error,
    isLoading: data.isLoading,
    loadSnapshots: data.loadSnapshots,
    snapshots: data.snapshots,
    handleApply: actions.handleApply,
    handleDelete: actions.handleDelete,
  });
};
