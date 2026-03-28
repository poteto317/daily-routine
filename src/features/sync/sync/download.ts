import { doc, getDoc } from "firebase/firestore";
import {
  FirebaseError,
  getFirestoreInstance,
  getOrCreateUser,
} from "@/lib/firebase";
import { getSyncErrorMessage } from "./errorMessage";
import { saveSyncDataToLocal } from "./localData";
import { setSyncStatusFromComparison } from "./remoteStatus";
import { setSyncStatus } from "./statusStore";
import { extractTimestamp } from "./timestamp";
import type { SyncData } from "./types";
import texts from "../locales/ja.json";

export const downloadFromFirestore = async (options?: {
  reload?: boolean;
}): Promise<void> => {
  const shouldReload = options?.reload ?? true;

  try {
    setSyncStatus({ isSyncing: true, error: null });

    const user = await getOrCreateUser();
    const firestore = getFirestoreInstance();
    const docRef = doc(firestore, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new FirebaseError(texts.syncError.noRemoteData, "no-remote-data");
    }

    const data = docSnap.data() as SyncData;
    const remoteLastModified = extractTimestamp(data.lastModified);
    saveSyncDataToLocal(data);
    setSyncStatusFromComparison(remoteLastModified);

    setSyncStatus({
      isSyncing: false,
      lastSyncTime: Date.now(),
      localLastModified: remoteLastModified || Date.now(),
      remoteLastModified: remoteLastModified || Date.now(),
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });

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
