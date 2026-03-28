type SyncSnapshotActionsResultArgs = {
  activeSnapshotId: string | null;
  handleApply: (snapshotId: string) => Promise<boolean>;
  handleDelete: (snapshotId: string) => Promise<boolean>;
};

export const createSyncSnapshotActionsResult = ({
  activeSnapshotId,
  handleApply,
  handleDelete,
}: SyncSnapshotActionsResultArgs) => {
  return {
    activeSnapshotId,
    handleApply,
    handleDelete,
  };
};
