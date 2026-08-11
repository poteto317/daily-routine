import { getUserScopedKey } from "./userScope";
import { cloneDefaultValue, parseStorageValue } from "./storageValueGuard";
import { runStorageWrite } from "./storageWrite";

const LOCAL_DATA_UPDATED_AT_KEY = "local-data-updated-at";
export const LOCAL_DATA_UPDATED_AT_EVENT = "local-data-updated-at-changed";

const getResolvedStorageKey = (key: string, scoped = true): string => {
  return scoped ? getUserScopedKey(key) : key;
};

export type SetStorageItemOptions = {
  skipLocalDataUpdatedAt?: boolean;
};

let syncBatchDepth = 0;

// 型レベルでは async 関数の誤用を完全に防げないため、ランタイムで落とす。
// オーバーロード宣言は「async 関数を渡したときの戻り値が never になる」ことで
// 呼び出し側が戻り値を使うコードに対して型エラーを出す効果はあるが、
// 渡す行為そのものをコンパイルエラーにはできない。
//
// ランタイム検知は 2 段階で行う:
//   1. Object.prototype.toString で AsyncFunction を fn() 実行前に検知する。
//      instanceof Promise では fn() を呼んでから判定するため、最初の await
//      までの副作用が発生してしまう（async 関数は最初の await まで同期的に実行される）。
//   2. 通常関数が Promise を返す場合（例: () => Promise.resolve()）は実行前に
//      検知できないため、fn() 後に instanceof Promise で検知する。
//      この時点で fn() の同期部分はすでにバッチ中に実行されている点に注意。
export function withSyncBatch(fn: () => Promise<unknown>): never;
export function withSyncBatch(fn: () => void): void;
export function withSyncBatch(fn: () => unknown): void {
  // async 関数は fn() を実行する前に弾く
  if (Object.prototype.toString.call(fn) === "[object AsyncFunction]") {
    throw new Error("withSyncBatch には同期関数のみ渡してください");
  }
  syncBatchDepth++;
  try {
    const result = fn();
    if (result instanceof Promise) {
      // () => Promise.resolve() のような通常関数は実行前に検知できない。
      // fn() の同期部分はすでにバッチ中に実行されている。
      // （デクリメントは finally に委ねる）
      throw new Error("withSyncBatch には同期関数のみ渡してください");
    }
  } finally {
    syncBatchDepth = Math.max(0, syncBatchDepth - 1);
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
  runStorageWrite(LOCAL_DATA_UPDATED_AT_KEY, () => {
    const scopedKey = getUserScopedKey(LOCAL_DATA_UPDATED_AT_KEY);
    localStorage.setItem(scopedKey, String(timestamp));
    window.dispatchEvent(
      new CustomEvent(LOCAL_DATA_UPDATED_AT_EVENT, {
        detail: { timestamp },
      }),
    );
  });
};

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return cloneDefaultValue(defaultValue);
  try {
    const scopedKey = getResolvedStorageKey(key);
    return parseStorageValue(localStorage.getItem(scopedKey), defaultValue);
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
 * JSON.parse せずに生文字列をそのまま返す unscoped getter。
 * 旧形式（JSON エンコードなし）で保存された値の後方互換読み取りに使用する。
 * 通常の読み書きには getUnscopedStorageItem/setUnscopedStorageItem を使うこと。
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
    const scopedKey = getResolvedStorageKey(key);
    localStorage.setItem(scopedKey, JSON.stringify(value));

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
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

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
  });
};

export const removeStorageItem = (
  key: string,
  options?: SetStorageItemOptions,
): void => {
  runStorageWrite(key, () => {
    const scopedKey = getResolvedStorageKey(key);
    localStorage.removeItem(scopedKey);

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
  });
};

export const removeUnscopedStorageItem = (
  key: string,
  options?: SetStorageItemOptions,
): void => {
  runStorageWrite(key, () => {
    localStorage.removeItem(getResolvedStorageKey(key, false));

    if (
      !options?.skipLocalDataUpdatedAt &&
      syncBatchDepth === 0 &&
      key !== LOCAL_DATA_UPDATED_AT_KEY
    ) {
      setLocalDataUpdatedAt(Date.now());
    }
  });
};
