import { useEffect, useState } from "react";
import { LOCAL_DATA_UPDATED_AT_EVENT } from "@/lib/storage/core";
import {
  getSyncStatus,
  refreshSyncStatusFromStoredRemote,
  watchRemoteChanges,
  type SyncStatus,
} from "@/features/sync";
import { createCloudSyncStatusStateResult } from "./cloudSyncStatusStateResult";

export const useCloudSyncStatusState = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() =>
    getSyncStatus(),
  );

  useEffect(() => {
    const handleSyncStatusChange = (event: CustomEvent<SyncStatus>) => {
      setSyncStatus(event.detail);
    };

    window.addEventListener(
      "sync-status-changed",
      handleSyncStatusChange as EventListener,
    );
    window.addEventListener(
      LOCAL_DATA_UPDATED_AT_EVENT,
      refreshSyncStatusFromStoredRemote as EventListener,
    );
    const unsubscribe = watchRemoteChanges(() => {
      // Remote changes are reflected via sync status updates.
    });

    return () => {
      window.removeEventListener(
        "sync-status-changed",
        handleSyncStatusChange as EventListener,
      );
      window.removeEventListener(
        LOCAL_DATA_UPDATED_AT_EVENT,
        refreshSyncStatusFromStoredRemote as EventListener,
      );
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return createCloudSyncStatusStateResult({
    syncStatus,
  });
};
