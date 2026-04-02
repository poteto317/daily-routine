export {
  setCurrentUserId,
  getCurrentUserId,
  getUserScopedKey,
  migrateToUserStorage,
} from "./core-modules/userScope";

export {
  LOCAL_DATA_UPDATED_AT_EVENT,
  getLocalDataUpdatedAt,
  getStorageItem,
  getUnscopedStorageItem,
  removeStorageItem,
  removeUnscopedStorageItem,
  setLocalDataUpdatedAt,
  setStorageItem,
  setUnscopedStorageItem,
} from "./core-modules/storageIO";

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
