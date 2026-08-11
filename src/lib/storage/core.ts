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

export {
  STORAGE_WRITE_FAILED_EVENT,
  dispatchStorageWriteFailed,
  isQuotaExceededError,
  replayLastStorageWriteFailure,
} from "./core-modules/storageWriteFailure";
export type {
  StorageWriteFailureDetail,
  StorageWriteFailureReason,
} from "./core-modules/storageWriteFailure";

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
