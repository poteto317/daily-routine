import { getUserScopedKey } from "./userScope";

const LOCAL_DATA_UPDATED_AT_KEY = "local-data-updated-at";
export const LOCAL_DATA_UPDATED_AT_EVENT = "local-data-updated-at-changed";

const getResolvedStorageKey = (key: string, scoped = true): string => {
  return scoped ? getUserScopedKey(key) : key;
};

type SetStorageItemOptions = {
  skipLocalDataUpdatedAt?: boolean;
};

let syncBatchDepth = 0;

// async 関数（Promise を返す関数）を渡すと型エラーになるようオーバーロードで制約する
export function withSyncBatch(fn: () => Promise<unknown>): never;
export function withSyncBatch(fn: () => void): void;
export function withSyncBatch(fn: () => unknown): void {
  syncBatchDepth++;
  try {
    const result = fn();
    if (result instanceof Promise) {
      // 誤って async 関数を渡した場合はバッチ深度を戻して例外とする（ランタイム保護）
      syncBatchDepth--;
      throw new Error("withSyncBatch には同期関数のみ渡してください");
    }
  } finally {
    if (syncBatchDepth > 0) syncBatchDepth--;
  }
}

export const getLocalDataUpdatedAt = (): number => {
  if (typeof window === "undefined") return 0;

  try {
    const scopedKey = getUserScopedKey(LOCAL_DATA_UPDATED_AT_KEY);
    const stored = localStorage.getItem(scopedKey);
    const parsed = stored ? Number(stored) : 0;

    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
};

export const setLocalDataUpdatedAt = (timestamp: number): void => {
  if (typeof window === "undefined") return;

  try {
    const scopedKey = getUserScopedKey(LOCAL_DATA_UPDATED_AT_KEY);
    localStorage.setItem(scopedKey, String(timestamp));
    window.dispatchEvent(
      new CustomEvent(LOCAL_DATA_UPDATED_AT_EVENT, {
        detail: { timestamp },
      }),
    );
  } catch {
    // Silently fail
  }
};

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const scopedKey = getResolvedStorageKey(key);
    const data = localStorage.getItem(scopedKey);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const getUnscopedStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const data = localStorage.getItem(getResolvedStorageKey(key, false));
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setStorageItem = <T>(
  key: string,
  value: T,
  options?: SetStorageItemOptions,
): void => {
  if (typeof window === "undefined") return;
  try {
    const scopedKey = getResolvedStorageKey(key);
    localStorage.setItem(scopedKey, JSON.stringify(value));

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
  } catch {
    // Silently fail
  }
};

export const setUnscopedStorageItem = <T>(
  key: string,
  value: T,
  options?: SetStorageItemOptions,
): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      getResolvedStorageKey(key, false),
      JSON.stringify(value),
    );

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
  } catch {
    // Silently fail
  }
};

export const removeStorageItem = (
  key: string,
  options?: SetStorageItemOptions,
): void => {
  if (typeof window === "undefined") return;

  try {
    const scopedKey = getResolvedStorageKey(key);
    localStorage.removeItem(scopedKey);

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
  } catch {
    // Silently fail
  }
};

export const removeUnscopedStorageItem = (
  key: string,
  options?: SetStorageItemOptions,
): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getResolvedStorageKey(key, false));

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
  } catch {
    // Silently fail
  }
};
