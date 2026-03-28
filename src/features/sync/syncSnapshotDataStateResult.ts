import type { Dispatch, SetStateAction } from "react";
import type { SyncSnapshot } from "./sync";

type CreateSyncSnapshotDataStateResultArgs = {
  error: string | null;
  isLoading: boolean;
  loadSnapshots: () => Promise<void>;
  setSnapshots: Dispatch<SetStateAction<SyncSnapshot[]>>;
  snapshots: SyncSnapshot[];
};

export const createSyncSnapshotDataStateResult = ({
  error,
  isLoading,
  loadSnapshots,
  setSnapshots,
  snapshots,
}: CreateSyncSnapshotDataStateResultArgs) => ({
  error,
  isLoading,
  loadSnapshots,
  setSnapshots,
  snapshots,
});
