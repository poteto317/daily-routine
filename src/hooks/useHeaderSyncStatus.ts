import { useEffect, useState } from "react";
import { refreshRemoteSyncStatus } from "@/features/sync";
import {
  initializeHeaderSyncState,
  getInitialHeaderSyncStatus,
  registerHeaderSyncListeners,
  recalculateHeaderSyncStatus,
  type HeaderSyncStatus,
} from "./headerSyncState";

export const useHeaderSyncStatus = (): HeaderSyncStatus => {
  const [syncStatus, setSyncStatus] = useState(getInitialHeaderSyncStatus);

  useEffect(() => {
    // リスナーを先に登録し、initializeHeaderSyncState が発火する
    // sync-status-changed イベントを確実に受け取れるようにする
    const cleanup = registerHeaderSyncListeners({
      setSyncStatus,
      recalculateSyncStatus: recalculateHeaderSyncStatus,
    });

    // 残留 isSyncing をクリアし、sync-status-changed イベント経由で状態を更新する
    initializeHeaderSyncState();
    void refreshRemoteSyncStatus();

    return cleanup;
  }, []);

  return syncStatus;
};
