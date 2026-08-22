let syncBatchDepth = 0;

export const isSyncBatchActive = (): boolean => syncBatchDepth > 0;

// 型レベルだけではasync関数の誤用を完全に防げないため、実行時にも検証する。
export function withSyncBatch(fn: () => Promise<unknown>): never;
export function withSyncBatch(fn: () => void): void;
export function withSyncBatch(fn: () => unknown): void {
  // async関数は最初のawaitまで同期副作用を起こすため、実行前に弾く。
  if (Object.prototype.toString.call(fn) === "[object AsyncFunction]") {
    throw new Error("withSyncBatch には同期関数のみ渡してください");
  }

  syncBatchDepth++;
  try {
    const result = fn();
    // 通常関数がPromiseを返すケースも拒否する。
    if (result instanceof Promise) {
      throw new Error("withSyncBatch には同期関数のみ渡してください");
    }
  } finally {
    syncBatchDepth = Math.max(0, syncBatchDepth - 1);
  }
}
