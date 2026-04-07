import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { getAuthInstance, getFirestoreInstance } from "@/lib/firebase";
import { getSyncErrorMessage } from "./errorMessage";
import { getDeviceId } from "./deviceId";
import { notifyRemoteChange } from "./remoteChangeNotification";
import { setSyncStatusFromComparison } from "./remoteStatus";
import { setSyncStatus } from "./statusStore";
import { extractTimestamp } from "./timestamp";
import type { SyncData } from "./types";
import texts from "../locales/ja.json";

export const watchRemoteChanges = (
  callback: (hasChanges: boolean) => void,
): Unsubscribe | null => {
  try {
    const user = getAuthInstance().currentUser;
    if (!user) return null;

    const firestore = getFirestoreInstance();
    const docRef = doc(firestore, "users", user.uid);
    const deviceId = getDeviceId();

    return onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setSyncStatusFromComparison(0);
          callback(false);
          return;
        }

        const data = snapshot.data() as SyncData;
        const remoteLastModified = extractTimestamp(data.lastModified);
        setSyncStatusFromComparison(remoteLastModified);

        const hasChanges = data.deviceId !== deviceId && remoteLastModified > 0;

        callback(hasChanges);

        if (hasChanges) {
          notifyRemoteChange();
        }
      },
      (error) =>
        setSyncStatus({
          error: getSyncErrorMessage(error, texts.syncError.watchFailed),
        }),
    );
  } catch {
    return null;
  }
};
