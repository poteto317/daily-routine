import type * as admin from "firebase-admin";
import { ApiError } from "./errors";
import type { OperationOutcome, SyncDocData } from "./operations/types";

/** アプリの MAX_SYNC_SNAPSHOTS（src/features/sync/sync/snapshots.ts）と同じ値 */
export const MAX_SYNC_SNAPSHOTS = 5;
/** 端末の deviceId と衝突しない固定値。アプリの watchRemoteChanges が「他端末の更新」と判定する */
export const API_DEVICE_ID = "api";

const META_KEYS = ["lastModified", "deviceId", "updatedAt"] as const;

export type WriteDeps = {
  now: () => number;
  serverTimestamp: () => unknown;
};

export const readLastModified = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
};

const toSnapshotPayload = (data: SyncDocData): SyncDocData =>
  Object.fromEntries(
    Object.entries(data).filter(
      ([key]) => !(META_KEYS as readonly string[]).includes(key),
    ),
  );

export const applyChanges = (
  db: admin.firestore.Firestore,
  uid: string,
  build: (data: SyncDocData) => OperationOutcome,
  deps: WriteDeps,
): Promise<OperationOutcome> =>
  db.runTransaction(async (transaction) => {
    const userRef = db.collection("users").doc(uid);
    const snapshotsRef = userRef.collection("syncSnapshots");

    // Firestore トランザクションは読み取りを書き込みより先に済ませる必要がある
    const userDoc = await transaction.get(userRef);
    const existingSnapshots = await transaction.get(
      snapshotsRef.orderBy("uploadedAt", "desc"),
    );

    if (!userDoc.exists) {
      throw new ApiError(
        404,
        "no_sync_data",
        "同期データがありません。先にアプリからクラウドへアップロードしてください",
      );
    }

    const current = userDoc.data() as SyncDocData;
    const outcome = build(current);
    if (!outcome.changes) return outcome;

    const lastModified = Math.max(
      deps.now(),
      readLastModified(current.lastModified) + 1,
    );
    const serverTimestamp = deps.serverTimestamp();

    transaction.update(userRef, {
      ...outcome.changes,
      lastModified,
      deviceId: API_DEVICE_ID,
      updatedAt: serverTimestamp,
    });

    existingSnapshots.docs
      .slice(MAX_SYNC_SNAPSHOTS - 1)
      .forEach((snapshot) => transaction.delete(snapshot.ref));

    const snapshotRef = snapshotsRef.doc();
    transaction.set(snapshotRef, {
      id: snapshotRef.id,
      uploadedAt: lastModified,
      deviceId: API_DEVICE_ID,
      data: toSnapshotPayload({ ...current, ...outcome.changes }),
      updatedAt: serverTimestamp,
    });

    return outcome;
  });
