import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  FirebaseError,
  getFirestoreInstance,
  getOrCreateUser,
} from "@/lib/firebase";
import { setLocalDataUpdatedAt } from "@/lib/storage/core";
import { collectLocalSyncData, getDeviceId } from "./localData";
import { getSyncErrorMessage } from "./errorMessage";
import { saveSyncSnapshot } from "./snapshots";
import { setSyncStatus } from "./statusStore";
import { buildSyncUploadData, buildUploadSuccessStatus } from "./uploadState";
import type { SyncData } from "./types";
import texts from "../locales/ja.json";

export const uploadToFirestore = async (): Promise<void> => {
  try {
    setSyncStatus({ isSyncing: true, error: null });

    const user = await getOrCreateUser();
    const firestore = getFirestoreInstance();
    const syncedAt = Date.now();
    const syncData: SyncData = buildSyncUploadData({
      localData: collectLocalSyncData(),
      lastModified: syncedAt,
      deviceId: getDeviceId(),
    });

    const docRef = doc(firestore, "users", user.uid);
    await setDoc(docRef, { ...syncData, updatedAt: serverTimestamp() });
    await saveSyncSnapshot(syncData);
    setLocalDataUpdatedAt(syncData.lastModified);

    setSyncStatus(
      buildUploadSuccessStatus({
        syncedAt,
        lastSyncTime: Date.now(),
      }),
    );
  } catch (error) {
    const errorMessage = getSyncErrorMessage(
      error,
      texts.syncError.uploadFailed,
    );
    setSyncStatus({ isSyncing: false, error: errorMessage });
    throw new FirebaseError(errorMessage, "upload-failed");
  }
};
