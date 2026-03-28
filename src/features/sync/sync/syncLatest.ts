import { doc, getDoc } from "firebase/firestore";
import {
  FirebaseError,
  getFirestoreInstance,
  getOrCreateUser,
} from "@/lib/firebase";
import { getSyncErrorMessage } from "./errorMessage";
import { downloadFromFirestore } from "./download";
import { getLocalLastModified, hasLocalData } from "./localData";
import { setSyncStatusFromComparison } from "./remoteStatus";
import { resolveSyncLatestPlan } from "./syncLatestDecision";
import { setSyncStatus } from "./statusStore";
import { extractTimestamp } from "./timestamp";
import type { SyncData, SyncLatestAction } from "./types";
import { uploadToFirestore } from "./upload";
import texts from "../locales/ja.json";

export const syncLatestData = async (): Promise<SyncLatestAction> => {
  try {
    setSyncStatus({ isSyncing: true, error: null });

    const user = await getOrCreateUser();
    const firestore = getFirestoreInstance();
    const docRef = doc(firestore, "users", user.uid);
    const docSnap = await getDoc(docRef);
    const localLastModified = getLocalLastModified();
    const remoteExists = docSnap.exists();

    if (!remoteExists) {
      const plan = resolveSyncLatestPlan({
        remoteExists,
        hasLocalData: hasLocalData(),
        localLastModified,
        remoteLastModified: 0,
        now: Date.now(),
      });

      if (plan.nextStatus) {
        setSyncStatus(plan.nextStatus);
      }

      if (plan.effect === "upload") {
        await uploadToFirestore();
      }

      return plan.action;
    }

    const remoteData = docSnap.data() as Partial<SyncData>;
    const remoteLastModified = extractTimestamp(remoteData.lastModified);
    setSyncStatusFromComparison(remoteLastModified);
    const plan = resolveSyncLatestPlan({
      remoteExists,
      hasLocalData: hasLocalData(),
      localLastModified,
      remoteLastModified,
      now: Date.now(),
    });

    if (plan.effect === "download") {
      await downloadFromFirestore({ reload: false });
      return plan.action;
    }

    if (plan.effect === "upload") {
      await uploadToFirestore();
      return plan.action;
    }

    if (plan.nextStatus) {
      setSyncStatus(plan.nextStatus);
    }

    return plan.action;
  } catch (error) {
    const errorMessage = getSyncErrorMessage(
      error,
      texts.syncError.syncLatestFailed,
    );
    setSyncStatus({ isSyncing: false, error: errorMessage });
    throw new FirebaseError(errorMessage, "sync-latest-failed");
  }
};
