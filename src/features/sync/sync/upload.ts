import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  FirebaseError,
  getFirestoreInstance,
  getOrCreateUser,
} from "@/lib/firebase";
import { setCurrentUserId, setLocalDataUpdatedAt } from "@/lib/storage/core";
import { collectLocalSyncData } from "./localData";
import { getDeviceId } from "./deviceId";
import { getSyncErrorMessage } from "./errorMessage";
import { saveSyncSnapshot } from "./snapshots";
import { setSyncStatus } from "./statusStore";
import { buildSyncUploadData, buildUploadSuccessStatus } from "./uploadState";
import { SYNC_TIMEOUT_MS } from "./constants";
import { withSyncTimeout } from "./withSyncTimeout";
import { saveSyncedContentHash } from "./syncedContentHash";
import type { SyncData, SyncStatus } from "./types";
import texts from "../locales/ja.json";

/**
 * Firestore へのアップロード操作を実行する。
 * 同期ステータス管理・エラーハンドリングを含まないアップロード処理。
 */
const performUploadOperation = async (): Promise<Partial<SyncStatus>> => {
  const user = await getOrCreateUser();
  setCurrentUserId(user.uid);
  const firestore = getFirestoreInstance();
  const syncedAt = Date.now();
  const localData = collectLocalSyncData();
  const syncData: SyncData = buildSyncUploadData({
    localData,
    lastModified: syncedAt,
    deviceId: getDeviceId(),
  });

  const docRef = doc(firestore, "users", user.uid);
  await setDoc(docRef, { ...syncData, updatedAt: serverTimestamp() });
  await saveSyncSnapshot(syncData);
  setLocalDataUpdatedAt(syncData.lastModified);
  saveSyncedContentHash(localData);

  return buildUploadSuccessStatus({ syncedAt, lastSyncTime: Date.now() });
};

/**
 * Firestore へデータをアップロードする。
 * 同期ステータス管理・タイムアウト制御・エラーハンドリングを担当する。
 */
export const uploadToFirestore = async (): Promise<void> => {
  try {
    setSyncStatus({ isSyncing: true, error: null });

    const status = await withSyncTimeout(
      performUploadOperation,
      SYNC_TIMEOUT_MS,
      texts.syncError.timeout,
    );
    setSyncStatus(status);
  } catch (error) {
    const errorMessage = getSyncErrorMessage(
      error,
      texts.syncError.uploadFailed,
    );
    setSyncStatus({ isSyncing: false, error: errorMessage });
    throw new FirebaseError(errorMessage, "upload-failed");
  }
};
