import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { reloadAfterDownload } from "@/hooks/headerSyncReload";
import {
  applySyncSnapshot,
  deleteSyncSnapshot,
  type SyncSnapshot,
} from "./sync";
import texts from "./locales/ja.json";

type SetSnapshots = Dispatch<SetStateAction<SyncSnapshot[]>>;

type UseSyncSnapshotActionHandlersParams = {
  setActiveSnapshotId: Dispatch<SetStateAction<string | null>>;
  setSnapshots: SetSnapshots;
};

export const useSyncSnapshotActionHandlers = ({
  setActiveSnapshotId,
  setSnapshots,
}: UseSyncSnapshotActionHandlersParams) => {
  const handleApply = useCallback(
    async (snapshotId: string) => {
      setActiveSnapshotId(snapshotId);

      try {
        await applySyncSnapshot(snapshotId);
        alert(texts.snapshotManager.applySuccess);
        reloadAfterDownload();
        return true;
      } catch {
        alert(texts.snapshotManager.applyFailed);
        return false;
      } finally {
        setActiveSnapshotId(null);
      }
    },
    [setActiveSnapshotId],
  );

  const handleDelete = useCallback(
    async (snapshotId: string) => {
      if (!window.confirm(texts.snapshotManager.deleteConfirm)) {
        return false;
      }

      setActiveSnapshotId(snapshotId);

      try {
        await deleteSyncSnapshot(snapshotId);
        setSnapshots((previous) =>
          previous.filter((snapshot) => snapshot.id !== snapshotId),
        );
        return true;
      } catch {
        alert(texts.snapshotManager.deleteFailed);
        return false;
      } finally {
        setActiveSnapshotId(null);
      }
    },
    [setActiveSnapshotId, setSnapshots],
  );

  return {
    handleApply,
    handleDelete,
  };
};
