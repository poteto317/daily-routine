import { getUserScopedKey } from "./userScope";

const LOCAL_DATA_UPDATED_AT_KEY = "local-data-updated-at";
export const LOCAL_DATA_UPDATED_AT_EVENT = "local-data-updated-at-changed";

type SetStorageItemOptions = {
  skipLocalDataUpdatedAt?: boolean;
};

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
    const scopedKey = getUserScopedKey(key);
    const data = localStorage.getItem(scopedKey);
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
    const scopedKey = getUserScopedKey(key);
    localStorage.setItem(scopedKey, JSON.stringify(value));

    if (!options?.skipLocalDataUpdatedAt && key !== LOCAL_DATA_UPDATED_AT_KEY) {
      setLocalDataUpdatedAt(Date.now());
    }
  } catch {
    // Silently fail
  }
};
