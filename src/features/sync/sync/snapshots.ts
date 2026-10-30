import { FirebaseError, getOrCreateUser } from "@/lib/firebase";
import { saveSyncDataToLocal } from "./localData";
import {
  createSnapshot,
  deleteLatestSyncData,
  deleteSnapshot,
  listSnapshotsNewestFirst,
  readSnapshot,
  saveLatestSyncData,
} from "./snapshotStore";
import { runSnapshotTask } from "./snapshotTaskStatus";
import { createSyncPayload } from "./syncPayload";
import type { SyncData, SyncSnapshot } from "./types";
import texts from "../locales/ja.json";

const MAX_SYNC_SNAPSHOTS = 5;

/**
 * アップロードしたデータを履歴に積む。
 * 新しい 1 件を足しても最大件数に収まるよう、古い履歴から削除する。
 */
export const saveSyncSnapshot = async (data: SyncData): Promise<void> => {
  const user = await getOrCreateUser();
  const existingSnapshots = await listSnapshotsNewestFirst(user.uid);

  await Promise.all(
    existingSnapshots
      .slice(MAX_SYNC_SNAPSHOTS - 1)
      .map((snapshot) => deleteSnapshot(user.uid, snapshot.id)),
  );

  await createSnapshot(user.uid, {
    uploadedAt: data.lastModified,
    deviceId: data.deviceId,
    data: createSyncPayload(data),
  });
};

/** 履歴を新しい順で取得する */
export const getSyncSnapshots = (): Promise<SyncSnapshot[]> =>
  runSnapshotTask(
    async () => {
      const user = await getOrCreateUser();
      return listSnapshotsNewestFirst(user.uid);
    },
    {
      fallbackMessage: texts.syncError.downloadFailed,
      errorCode: "snapshot-list-failed",
    },
  );

/** 履歴の内容をローカルへ復元し、変更ありの表示を解除する */
export const applySyncSnapshot = (snapshotId: string): Promise<void> =>
  runSnapshotTask(
    async () => {
      const user = await getOrCreateUser();
      const snapshot = await readSnapshot(user.uid, snapshotId);
      if (!snapshot) {
        throw new FirebaseError(texts.syncError.noRemoteData, "no-remote-data");
      }
      saveSyncDataToLocal(snapshot.data);
    },
    {
      fallbackMessage: texts.syncError.downloadFailed,
      errorCode: "snapshot-apply-failed",
      successStatus: () => ({
        isSyncing: false,
        lastSyncTime: Date.now(),
        hasRemoteChanges: false,
        hasLocalChanges: false,
        error: null,
      }),
    },
  );

/**
 * 履歴を削除する。一覧に無い ID なら何もしない。
 * 最新の履歴を消したときは、次に新しい履歴を最新の同期データにする
 * （次が無ければ最新の同期データも消す）。
 */
export const deleteSyncSnapshot = (snapshotId: string): Promise<void> =>
  runSnapshotTask(
    async () => {
      const user = await getOrCreateUser();
      const snapshots = await listSnapshotsNewestFirst(user.uid);
      const deletedIndex = snapshots.findIndex(
        (snapshot) => snapshot.id === snapshotId,
      );
      if (deletedIndex === -1) return;

      await deleteSnapshot(user.uid, snapshotId);
      if (deletedIndex !== 0) return;

      const nextLatest = snapshots[1];
      if (nextLatest) {
        await saveLatestSyncData(
          user.uid,
          nextLatest.data,
          nextLatest.uploadedAt,
          nextLatest.deviceId,
        );
      } else {
        await deleteLatestSyncData(user.uid);
      }
    },
    {
      fallbackMessage: texts.syncError.uploadFailed,
      errorCode: "snapshot-delete-failed",
    },
  );
