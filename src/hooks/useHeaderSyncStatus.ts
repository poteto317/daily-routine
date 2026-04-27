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
  const [syncStatus, setSyncStatus] = useState(() => {
    // 副作用（残留 isSyncing クリア）と純粋な状態取得を分離しつつ、
    // 初回レンダリング前に実行することで正しい初期状態を保証する
    initializeHeaderSyncState();
    return getInitialHeaderSyncStatus();
  });

  useEffect(() => {
    void refreshRemoteSyncStatus();

    return registerHeaderSyncListeners({
      setSyncStatus,
      recalculateSyncStatus: recalculateHeaderSyncStatus,
    });
  }, []);

  return syncStatus;
};
