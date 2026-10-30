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
import { getFirestoreInstance } from "@/lib/firebase";
import type { SyncPayload, SyncSnapshot } from "./types";

/*
 * 同期スナップショットの Firestore 読み書き。
 *
 * - 履歴: users/{uid}/syncSnapshots/{snapshotId}
 * - 最新の同期データ: users/{uid}
 *
 * 同期状態（statusStore）の更新やエラーの変換は行わない。
 */

type SnapshotFields = Omit<SyncSnapshot, "id">;

const getSyncSnapshotsCollectionRef = (userId: string) => {
  return collection(getFirestoreInstance(), "users", userId, "syncSnapshots");
};

const getLatestSyncDataRef = (userId: string) => {
  return doc(getFirestoreInstance(), "users", userId);
};

const toSyncSnapshot = (id: string, fields: SnapshotFields): SyncSnapshot => ({
  id,
  ...fields,
});

/** 履歴を新しい順（uploadedAt の降順）で取得する */
export const listSnapshotsNewestFirst = async (
  userId: string,
): Promise<SyncSnapshot[]> => {
  const snapshotDocs = await getDocs(
    query(getSyncSnapshotsCollectionRef(userId), orderBy("uploadedAt", "desc")),
  );
  return snapshotDocs.docs.map((snapshotDoc) =>
    toSyncSnapshot(snapshotDoc.id, snapshotDoc.data() as SnapshotFields),
  );
};

/** 履歴を 1 件取得する。無ければ null */
export const readSnapshot = async (
  userId: string,
  snapshotId: string,
): Promise<SyncSnapshot | null> => {
  const snapshotDoc = await getDoc(
    doc(getSyncSnapshotsCollectionRef(userId), snapshotId),
  );
  if (!snapshotDoc.exists()) return null;
  return toSyncSnapshot(snapshotDoc.id, snapshotDoc.data() as SnapshotFields);
};

/** 履歴を新しい ID で 1 件追加する */
export const createSnapshot = async (
  userId: string,
  snapshot: Pick<SyncSnapshot, "uploadedAt" | "deviceId" | "data">,
): Promise<void> => {
  const snapshotRef = doc(getSyncSnapshotsCollectionRef(userId));
  await setDoc(snapshotRef, {
    id: snapshotRef.id,
    uploadedAt: snapshot.uploadedAt,
    deviceId: snapshot.deviceId,
    data: snapshot.data,
    updatedAt: serverTimestamp(),
  });
};

/** 履歴を 1 件削除する */
export const deleteSnapshot = async (
  userId: string,
  snapshotId: string,
): Promise<void> => {
  await deleteDoc(doc(getSyncSnapshotsCollectionRef(userId), snapshotId));
};

/** 最新の同期データ（users/{uid}）を指定した内容で上書きする */
export const saveLatestSyncData = async (
  userId: string,
  data: SyncPayload,
  uploadedAt: number,
  deviceId: string,
): Promise<void> => {
  await setDoc(getLatestSyncDataRef(userId), {
    ...data,
    lastModified: uploadedAt,
    deviceId,
    updatedAt: serverTimestamp(),
  });
};

/** 最新の同期データ（users/{uid}）を削除する */
export const deleteLatestSyncData = async (userId: string): Promise<void> => {
  await deleteDoc(getLatestSyncDataRef(userId));
};
