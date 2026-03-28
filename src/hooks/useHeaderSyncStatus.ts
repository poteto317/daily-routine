import { useEffect, useState } from "react";
import { refreshRemoteSyncStatus } from "@/features/sync";
import {
  getInitialHeaderSyncStatus,
  registerHeaderSyncListeners,
  recalculateHeaderSyncStatus,
  type HeaderSyncStatus,
} from "./headerSyncState";

export const useHeaderSyncStatus = (): HeaderSyncStatus => {
  const [syncStatus, setSyncStatus] = useState(getInitialHeaderSyncStatus);

  useEffect(() => {
    void refreshRemoteSyncStatus();

    return registerHeaderSyncListeners({
      setSyncStatus,
      recalculateSyncStatus: recalculateHeaderSyncStatus,
    });
  }, []);

  return syncStatus;
};
