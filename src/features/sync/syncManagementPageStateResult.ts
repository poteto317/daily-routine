import type { SyncSnapshot } from "./sync";

type SyncManagementPageStateResultArgs = {
  activeSnapshotId: string | null;
  error: string | null;
  isLoading: boolean;
  loadSnapshots: () => Promise<void>;
  snapshots: SyncSnapshot[];
  handleApply: (snapshotId: string) => Promise<boolean>;
  handleDelete: (snapshotId: string) => Promise<boolean>;
};

export const createSyncManagementPageStateResult = ({
  activeSnapshotId,
  error,
  isLoading,
  loadSnapshots,
  snapshots,
  handleApply,
  handleDelete,
}: SyncManagementPageStateResultArgs) => {
  return {
    activeSnapshotId,
    error,
    isLoading,
    loadSnapshots,
    snapshots,
    handleApply,
    handleDelete,
  };
};
