import { doc, getDoc } from "firebase/firestore";
import { getFirestoreInstance, getOrCreateUser } from "@/lib/firebase";
import { collectLocalSyncData, getLocalLastModified } from "./localData";
import { getSyncStatus, setSyncStatus } from "./statusStore";
import { extractTimestamp } from "./timestamp";
import { computeContentHash, getSyncedContentHash } from "./syncedContentHash";
import type { SyncData } from "./types";

const normalizeTimestamp = (value: number): number | null => {
  return value > 0 ? value : null;
};

export const setSyncStatusFromComparison = (
  remoteLastModified: number,
): void => {
  const localLastModified = getLocalLastModified();
  const normalizedLocal = normalizeTimestamp(localLastModified);
  const normalizedRemote = normalizeTimestamp(remoteLastModified);
  const hasRemoteChanges = Boolean(
    normalizedRemote &&
    (!normalizedLocal || normalizedRemote > normalizedLocal),
  );
  let hasLocalChanges = Boolean(
    normalizedLocal &&
    (!normalizedRemote || normalizedLocal > normalizedRemote),
  );

  // タイムスタンプが新しくてもコンテンツが同期済みと同じなら未変更とみなす
  if (hasLocalChanges) {
    const syncedHash = getSyncedContentHash();
    if (syncedHash !== null) {
      const localHash = computeContentHash(collectLocalSyncData());
      if (localHash === syncedHash) {
        hasLocalChanges = false;
      }
    }
  }

  setSyncStatus({
    localLastModified: normalizedLocal,
    remoteLastModified: normalizedRemote,
    hasRemoteChanges,
    hasLocalChanges,
  });
};

export const refreshRemoteSyncStatus = async (): Promise<void> => {
  try {
    const user = await getOrCreateUser();
    const firestore = getFirestoreInstance();
    const docRef = doc(firestore, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      setSyncStatusFromComparison(0);
      return;
    }

    const data = docSnap.data() as Partial<SyncData>;
    setSyncStatusFromComparison(extractTimestamp(data.lastModified));
  } catch {
    // Remote status refresh is best-effort.
  }
};

export const refreshSyncStatusFromStoredRemote = (): void => {
  const currentStatus = getSyncStatus();
  setSyncStatusFromComparison(currentStatus.remoteLastModified ?? 0);
};
