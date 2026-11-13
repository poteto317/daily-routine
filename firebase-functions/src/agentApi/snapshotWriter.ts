import type {
  CollectionReference,
  QueryDocumentSnapshot,
  Transaction,
} from "../adminSdk";
import type { SyncDocData } from "./syncDoc";
import { API_DEVICE_ID, MAX_SYNC_SNAPSHOTS, META_KEYS } from "./syncConstants";

/** アプリの createSyncPayload と同じく、同期メタ情報を除いた内容にする */
export const toSnapshotPayload = (data: SyncDocData): SyncDocData =>
  Object.fromEntries(
    Object.entries(data).filter(([key]) => !META_KEYS.includes(key)),
  );

type SaveSnapshotArgs = {
  transaction: Transaction;
  snapshotsRef: CollectionReference;
  /** uploadedAt の降順で読み取り済みの既存スナップショット（deviceId のみ取得） */
  existing: QueryDocumentSnapshot[];
  /** 変更後の users/{uid} の内容 */
  data: SyncDocData;
  lastModified: number;
  serverTimestamp: unknown;
};

/** 最新のスナップショットが API 由来か（アプリ由来の復元ポイントを押し出さないための判定） */
const isLatestFromApi = (existing: QueryDocumentSnapshot[]): boolean =>
  existing[0]?.data().deviceId === API_DEVICE_ID;

const buildSnapshotDoc = (
  id: string,
  { data, lastModified, serverTimestamp }: SaveSnapshotArgs,
) => ({
  id,
  uploadedAt: lastModified,
  deviceId: API_DEVICE_ID,
  data: toSnapshotPayload(data),
  updatedAt: serverTimestamp,
});

/** 最新（API 由来）のスナップショットを、同じ ID のまま上書きする */
const overwriteLatest = (args: SaveSnapshotArgs): void => {
  const latest = args.existing[0];
  args.transaction.set(latest.ref, buildSnapshotDoc(latest.id, args));
};

/** 上限を超える古いスナップショットを削除し、新しいスナップショットを作成する */
const createWithRetention = (args: SaveSnapshotArgs): void => {
  const { transaction, snapshotsRef, existing } = args;
  existing
    .slice(MAX_SYNC_SNAPSHOTS - 1)
    .forEach((snapshot) => transaction.delete(snapshot.ref));

  const snapshotRef = snapshotsRef.doc();
  transaction.set(snapshotRef, buildSnapshotDoc(snapshotRef.id, args));
};

/**
 * 変更後の状態をスナップショットとして保存する。
 * 最新が API 由来なら上書きし、それ以外は保持数を守って新規作成する。
 */
export const saveApiSnapshot = (args: SaveSnapshotArgs): void => {
  if (isLatestFromApi(args.existing)) {
    overwriteLatest(args);
    return;
  }
  createWithRetention(args);
};
