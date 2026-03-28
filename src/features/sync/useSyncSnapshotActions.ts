import { type SyncSnapshot } from "./sync";
import { createSyncSnapshotActionsResult } from "./syncSnapshotActionsResult";
import { useSyncSnapshotActionHandlers } from "./useSyncSnapshotActionHandlers";
import { useSyncSnapshotActiveState } from "./useSyncSnapshotActiveState";

type SetSnapshots = React.Dispatch<React.SetStateAction<SyncSnapshot[]>>;

type UseSyncSnapshotActionsParams = {
  setSnapshots: SetSnapshots;
};

export const useSyncSnapshotActions = ({
  setSnapshots,
}: UseSyncSnapshotActionsParams) => {
  const activeState = useSyncSnapshotActiveState();
  const { handleApply, handleDelete } = useSyncSnapshotActionHandlers({
    setActiveSnapshotId: activeState.setActiveSnapshotId,
    setSnapshots,
  });

  return createSyncSnapshotActionsResult({
    activeSnapshotId: activeState.activeSnapshotId,
    handleApply,
    handleDelete,
  });
};
