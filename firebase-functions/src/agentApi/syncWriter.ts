import type * as admin from "firebase-admin";
import { USERS_COLLECTION } from "../constants";
import { noSyncData, outdatedSyncData } from "./errors";
import { nextLastModified } from "./lastModified";
import { saveApiSnapshot } from "./snapshotWriter";
import { API_DEVICE_ID } from "./syncConstants";
import { findMissingFields, type SyncDocData } from "./syncDoc";

export type WriteDeps = {
  now: () => number;
  serverTimestamp: () => unknown;
};

/**
 * users/{uid} を 1 つのトランザクションで更新する。
 * 変更フィールドと同期メタ情報だけを書き、変更後のスナップショットも保存する。
 */
export const applyChanges = <T extends { changes?: SyncDocData }>(
  db: admin.firestore.Firestore,
  uid: string,
  build: (data: SyncDocData) => T,
  deps: WriteDeps,
): Promise<T> =>
  db.runTransaction(async (transaction) => {
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    const snapshotsRef = userRef.collection("syncSnapshots");

    // Firestore トランザクションは読み取りを書き込みより先に済ませる必要がある
    const userDoc = await transaction.get(userRef);
    // スナップショットは種別の判定と参照にしか使わないため、deviceId だけ取得する（本文の全読みを避ける）
    const existingSnapshots = await transaction.get(
      snapshotsRef.orderBy("uploadedAt", "desc").select("deviceId"),
    );
    if (!userDoc.exists) throw noSyncData();

    const current = userDoc.data() as SyncDocData;
    const outcome = build(current);
    if (!outcome.changes) return outcome;
    // 書き込み対象のフィールドが無い古い形式のドキュメントには、新しく作らず中断する
    if (findMissingFields(current, Object.keys(outcome.changes)).length > 0) {
      throw outdatedSyncData();
    }

    const lastModified = nextLastModified(current.lastModified, deps.now());
    const serverTimestamp = deps.serverTimestamp();

    transaction.update(userRef, {
      ...outcome.changes,
      lastModified,
      deviceId: API_DEVICE_ID,
      updatedAt: serverTimestamp,
    });
    saveApiSnapshot({
      transaction,
      snapshotsRef,
      existing: existingSnapshots.docs,
      data: { ...current, ...outcome.changes },
      lastModified,
      serverTimestamp,
    });

    return outcome;
  });
