export {
  setCurrentUserId,
  getCurrentUserId,
  getUserScopedKey,
  migrateToUserStorage,
} from "./core-modules/userScope";

export {
  LOCAL_DATA_UPDATED_AT_EVENT,
  getLocalDataUpdatedAt,
  getRawUnscopedStorageItem,
  getStorageItem,
  getUnscopedStorageItem,
  removeStorageItem,
  removeUnscopedStorageItem,
  setLocalDataUpdatedAt,
  setStorageItem,
  setUnscopedStorageItem,
  withSyncBatch,
} from "./core-modules/storageIO";
export type { SetStorageItemOptions } from "./core-modules/storageIO";

// dispatchStorageWriteFailed はここでは公開しない。層の外から任意に
// 「保存に失敗した」と発火できてしまい、通知の経路が storage 層に閉じなくなる。
// テストで必要な場合は core-modules から直接 import する。
export {
  STORAGE_WRITE_FAILED_EVENT,
  replayLastStorageWriteFailure,
} from "./core-modules/storageWriteFailureEvent";
export type { StorageWriteFailureDetail } from "./core-modules/storageWriteFailureEvent";
export type { StorageWriteFailureReason } from "./core-modules/storageWriteFailureReason";

export {
  getTodayString,
  getCurrentTime,
  timeToMinutes,
  minutesToTime,
  isTimePassed,
} from "./core-modules/time";

export {
  generateId,
  formatDuration,
  formatTimer,
  formatTimerLong,
} from "./core-modules/formatters";

export { calculateSessionStats } from "./core-modules/sessionStats";
