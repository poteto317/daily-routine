import { doc, getDoc } from "firebase/firestore";
import {
  FirebaseError,
  getFirestoreInstance,
  getOrCreateUser,
} from "@/lib/firebase";
import { setCurrentUserId, setLocalDataUpdatedAt } from "@/lib/storage/core";
import { getSyncErrorMessage } from "./errorMessage";
import { saveSyncDataToLocal, collectLocalSyncData } from "./localData";
import { setSyncStatus } from "./statusStore";
import { extractTimestamp } from "./timestamp";
import { SYNC_TIMEOUT_MS } from "./constants";
import { withSyncTimeout } from "./withSyncTimeout";
import { saveSyncedContentHash } from "./syncedContentHash";
import type { SyncData, SyncStatus } from "./types";
import texts from "../locales/ja.json";

/**
 * Firestore からのダウンロード操作を実行する。
 * 同期ステータス管理・ページリロード・エラーハンドリングを含まない処理関数。
 * ダウンロード後はローカルとリモートが一致するため、hasRemoteChanges / hasLocalChanges は常に false。
 */
const performDownloadOperation = async (): Promise<Partial<SyncStatus>> => {
  const user = await getOrCreateUser();
  setCurrentUserId(user.uid);
  const firestore = getFirestoreInstance();
  const docRef = doc(firestore, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new FirebaseError(texts.syncError.noRemoteData, "no-remote-data");
  }

  const data = docSnap.data() as SyncData;
  const remoteLastModified = extractTimestamp(data.lastModified);
  // データを保存し、タイムスタンプ更新（イベント発火）は後回しにする
  saveSyncDataToLocal(data, { skipTimestampUpdate: true });
  // イベント発火前にハッシュを保存し、再計算時に正しい値が参照されるようにする
  saveSyncedContentHash(collectLocalSyncData());
  setLocalDataUpdatedAt(data.lastModified ?? Date.now());

  // 0 は「タイムスタンプなし」を意味するため null に正規化する
  const normalizedRemote = remoteLastModified > 0 ? remoteLastModified : null;

  return {
    isSyncing: false,
    lastSyncTime: Date.now(),
    localLastModified: normalizedRemote,
    remoteLastModified: normalizedRemote,
    hasRemoteChanges: false,
    hasLocalChanges: false,
    error: null,
  };
};

/**
 * Firestore からデータをダウンロードする。
 * 同期ステータス管理・タイムアウト制御・エラーハンドリング・ページリロードを担当する。
 */
export const downloadFromFirestore = async (options?: {
  reload?: boolean;
}): Promise<void> => {
  const shouldReload = options?.reload ?? true;

  try {
    setSyncStatus({ isSyncing: true, error: null });

    const status = await withSyncTimeout(
      performDownloadOperation,
      SYNC_TIMEOUT_MS,
      texts.syncError.timeout,
    );
    setSyncStatus(status);

    if (shouldReload) {
      window.location.reload();
    }
  } catch (error) {
    const errorMessage = getSyncErrorMessage(
      error,
      texts.syncError.downloadFailed,
    );
    setSyncStatus({ isSyncing: false, error: errorMessage });
    throw new FirebaseError(errorMessage, "download-failed");
  }
};
