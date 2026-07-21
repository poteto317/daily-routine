import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  FirebaseError,
  getFirestoreInstance,
  getOrCreateUser,
} from "@/lib/firebase";
import { getSyncErrorMessage } from "./errorMessage";
import { saveSyncDataToLocal } from "./localData";
import { createSyncPayload } from "./syncPayload";
import { setSyncStatus } from "./statusStore";
import type { SyncData, SyncPayload, SyncSnapshot } from "./types";
import texts from "../locales/ja.json";

const MAX_SYNC_SNAPSHOTS = 5;

const getSyncSnapshotsCollectionRef = (userId: string) => {
  return collection(getFirestoreInstance(), "users", userId, "syncSnapshots");
};

const mapSnapshotDoc = (snapshotDoc: {
  id: string;
  data: () => Omit<SyncSnapshot, "id">;
}): SyncSnapshot => {
  return {
    id: snapshotDoc.id,
    ...snapshotDoc.data(),
  };
};

const getSnapshotQuery = (userId: string) => {
  return query(
    getSyncSnapshotsCollectionRef(userId),
    orderBy("uploadedAt", "desc"),
  );
};

const getOrderedSnapshots = async (userId: string): Promise<SyncSnapshot[]> => {
  const snapshotDocs = await getDocs(getSnapshotQuery(userId));
  return snapshotDocs.docs.map((snapshotDoc) =>
    mapSnapshotDoc(snapshotDoc as never),
  );
};

const saveLatestSyncData = async (
  userId: string,
  data: SyncPayload,
  uploadedAt: number,
  deviceId: string,
): Promise<void> => {
  const docRef = doc(getFirestoreInstance(), "users", userId);
  await setDoc(docRef, {
    ...data,
    lastModified: uploadedAt,
    deviceId,
    updatedAt: serverTimestamp(),
  });
};

export const saveSyncSnapshot = async (data: SyncData): Promise<void> => {
  const user = await getOrCreateUser();
  const existingSnapshots = await getOrderedSnapshots(user.uid);

  await Promise.all(
    existingSnapshots
      .slice(MAX_SYNC_SNAPSHOTS - 1)
      .map((snapshot) =>
        deleteDoc(doc(getSyncSnapshotsCollectionRef(user.uid), snapshot.id)),
      ),
  );

  const payload = createSyncPayload(data);
  const uploadedAt = data.lastModified;
  const snapshotRef = doc(getSyncSnapshotsCollectionRef(user.uid));

  await setDoc(snapshotRef, {
    id: snapshotRef.id,
    uploadedAt,
    deviceId: data.deviceId,
    data: payload,
    updatedAt: serverTimestamp(),
  });
};

export const getSyncSnapshots = async (): Promise<SyncSnapshot[]> => {
  try {
    setSyncStatus({ isSyncing: true, error: null });

    const user = await getOrCreateUser();
    const snapshots = await getOrderedSnapshots(user.uid);

    setSyncStatus({ isSyncing: false, error: null });
    return snapshots;
  } catch (error) {
    const errorMessage = getSyncErrorMessage(
      error,
      texts.syncError.downloadFailed,
    );
    setSyncStatus({ isSyncing: false, error: errorMessage });
    throw new FirebaseError(errorMessage, "snapshot-list-failed");
  }
};

export const applySyncSnapshot = async (snapshotId: string): Promise<void> => {
  try {
    setSyncStatus({ isSyncing: true, error: null });

    const user = await getOrCreateUser();
    const snapshotRef = doc(
      getSyncSnapshotsCollectionRef(user.uid),
      snapshotId,
    );
    const snapshotDoc = await getDoc(snapshotRef);

    if (!snapshotDoc.exists()) {
      throw new FirebaseError(texts.syncError.noRemoteData, "no-remote-data");
    }

    const snapshot = mapSnapshotDoc({
      id: snapshotDoc.id,
      data: () => snapshotDoc.data() as Omit<SyncSnapshot, "id">,
    });

    saveSyncDataToLocal(snapshot.data);
    setSyncStatus({
      isSyncing: false,
      lastSyncTime: Date.now(),
      hasRemoteChanges: false,
      hasLocalChanges: false,
      error: null,
    });
  } catch (error) {
    const errorMessage = getSyncErrorMessage(
      error,
      texts.syncError.downloadFailed,
    );
    setSyncStatus({ isSyncing: false, error: errorMessage });
    throw new FirebaseError(errorMessage, "snapshot-apply-failed");
  }
};

export const deleteSyncSnapshot = async (snapshotId: string): Promise<void> => {
  try {
    setSyncStatus({ isSyncing: true, error: null });

    const user = await getOrCreateUser();
    const snapshots = await getOrderedSnapshots(user.uid);
    const deletedIndex = snapshots.findIndex(
      (snapshot) => snapshot.id === snapshotId,
    );

    if (deletedIndex === -1) {
      setSyncStatus({ isSyncing: false, error: null });
      return;
    }

    await deleteDoc(doc(getSyncSnapshotsCollectionRef(user.uid), snapshotId));

    if (deletedIndex === 0) {
      const nextLatest = snapshots[1];

      if (nextLatest) {
        await saveLatestSyncData(
          user.uid,
          nextLatest.data,
          nextLatest.uploadedAt,
          nextLatest.deviceId,
        );
      } else {
        await deleteDoc(doc(getFirestoreInstance(), "users", user.uid));
      }
    }

    setSyncStatus({ isSyncing: false, error: null });
  } catch (error) {
    const errorMessage = getSyncErrorMessage(
      error,
      texts.syncError.uploadFailed,
    );
    setSyncStatus({ isSyncing: false, error: errorMessage });
    throw new FirebaseError(errorMessage, "snapshot-delete-failed");
  }
};
