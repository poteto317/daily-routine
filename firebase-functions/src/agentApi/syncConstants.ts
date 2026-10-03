/** アプリの MAX_SYNC_SNAPSHOTS（src/features/sync/sync/snapshots.ts）と同じ値 */
export const MAX_SYNC_SNAPSHOTS = 5;

/** 端末の deviceId と衝突しない固定値。アプリの watchRemoteChanges が「他端末の更新」と判定する */
export const API_DEVICE_ID = "api";

/** スナップショットのペイロードから除く同期メタ情報のキー */
export const META_KEYS: readonly string[] = [
  "lastModified",
  "deviceId",
  "updatedAt",
];
