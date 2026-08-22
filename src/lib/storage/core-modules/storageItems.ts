import { getUserScopedKey } from "./userScope";
import { cloneDefaultValue, parseStorageValue } from "./storageValueGuard";
import { runStorageWrite } from "./storageWrite";
import { isSyncBatchActive } from "./storageBatch";
import {
  LOCAL_DATA_UPDATED_AT_KEY,
  setLocalDataUpdatedAt,
} from "./localDataUpdatedAt";

export type SetStorageItemOptions = {
  skipLocalDataUpdatedAt?: boolean;
};

const getResolvedStorageKey = (key: string, scoped = true): string =>
  scoped ? getUserScopedKey(key) : key;

const shouldUpdateLocalDataTimestamp = (
  key: string,
  options?: SetStorageItemOptions,
): boolean =>
  !options?.skipLocalDataUpdatedAt &&
  !isSyncBatchActive() &&
  key !== LOCAL_DATA_UPDATED_AT_KEY;

const updateLocalDataTimestampIfNeeded = (
  key: string,
  options?: SetStorageItemOptions,
): void => {
  if (shouldUpdateLocalDataTimestamp(key, options)) {
    setLocalDataUpdatedAt(Date.now());
  }
};

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return cloneDefaultValue(defaultValue);

  try {
    return parseStorageValue(
      localStorage.getItem(getResolvedStorageKey(key)),
      defaultValue,
    );
  } catch {
    return cloneDefaultValue(defaultValue);
  }
};

export const getUnscopedStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return cloneDefaultValue(defaultValue);

  try {
    return parseStorageValue(
      localStorage.getItem(getResolvedStorageKey(key, false)),
      defaultValue,
    );
  } catch {
    return cloneDefaultValue(defaultValue);
  }
};

/**
 * JSON.parseせずに生文字列を返すunscoped getter。
 * JSONエンコードされていない旧形式の後方互換読み取り専用。
 */
export const getRawUnscopedStorageItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(getResolvedStorageKey(key, false));
  } catch {
    return null;
  }
};

export const setStorageItem = <T>(
  key: string,
  value: T,
  options?: SetStorageItemOptions,
): void => {
  runStorageWrite(key, () => {
    localStorage.setItem(getResolvedStorageKey(key), JSON.stringify(value));
    updateLocalDataTimestampIfNeeded(key, options);
  });
};

export const setUnscopedStorageItem = <T>(
  key: string,
  value: T,
  options?: SetStorageItemOptions,
): void => {
  runStorageWrite(key, () => {
    localStorage.setItem(
      getResolvedStorageKey(key, false),
      JSON.stringify(value),
    );
    updateLocalDataTimestampIfNeeded(key, options);
  });
};

export const removeStorageItem = (
  key: string,
  options?: SetStorageItemOptions,
): void => {
  runStorageWrite(key, () => {
    localStorage.removeItem(getResolvedStorageKey(key));
    updateLocalDataTimestampIfNeeded(key, options);
  });
};

export const removeUnscopedStorageItem = (
  key: string,
  options?: SetStorageItemOptions,
): void => {
  runStorageWrite(key, () => {
    localStorage.removeItem(getResolvedStorageKey(key, false));
    updateLocalDataTimestampIfNeeded(key, options);
  });
};
