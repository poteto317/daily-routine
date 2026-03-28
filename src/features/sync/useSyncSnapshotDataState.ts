import { useState } from "react";
import { type SyncSnapshot } from "./sync";
import { createSyncSnapshotDataStateResult } from "./syncSnapshotDataStateResult";
import { useSyncSnapshotInitialLoadEffect } from "./useSyncSnapshotInitialLoadEffect";
import { useSyncSnapshotLoadAction } from "./useSyncSnapshotLoadAction";

export const useSyncSnapshotDataState = () => {
  const [snapshots, setSnapshots] = useState<SyncSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSnapshots = useSyncSnapshotLoadAction({
    setError,
    setIsLoading,
    setSnapshots,
  });

  useSyncSnapshotInitialLoadEffect({ loadSnapshots });

  return createSyncSnapshotDataStateResult({
    error,
    isLoading,
    loadSnapshots,
    setSnapshots,
    snapshots,
  });
};
