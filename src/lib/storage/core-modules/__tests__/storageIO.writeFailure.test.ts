import {
  getStorageItem,
  removeStorageItem,
  removeUnscopedStorageItem,
  setStorageItem,
  setUnscopedStorageItem,
} from "../storageItems";
import { setLocalDataUpdatedAt } from "../localDataUpdatedAt";
import {
  STORAGE_WRITE_FAILED_EVENT,
  type StorageWriteFailureDetail,
} from "../storageWriteFailureEvent";
import * as storageIO from "../storageIO";

describe("storageIO compatibility", () => {
  it("分割後の公開APIを旧moduleから再公開する", () => {
    expect(Object.keys(storageIO).sort()).toEqual(
      [
        "LOCAL_DATA_UPDATED_AT_EVENT",
        "getLocalDataUpdatedAt",
        "getRawUnscopedStorageItem",
        "getStorageItem",
        "getUnscopedStorageItem",
        "removeStorageItem",
        "removeUnscopedStorageItem",
        "setLocalDataUpdatedAt",
        "setStorageItem",
        "setUnscopedStorageItem",
        "withSyncBatch",
      ].sort(),
    );
  });
});

/** 発火された detail を集めるリスナーを張る */
const listenFailures = () => {
  const details: StorageWriteFailureDetail[] = [];
  const handle = (event: Event) => {
    details.push((event as CustomEvent<StorageWriteFailureDetail>).detail);
  };
  window.addEventListener(STORAGE_WRITE_FAILED_EVENT, handle);
  return {
    details,
    cleanup: () =>
      window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, handle),
  };
};

/** localStorage.setItem を必ず失敗させる */
const breakSetItem = (error: unknown) =>
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw error;
  });

/** localStorage.removeItem を必ず失敗させる */
const breakRemoveItem = (error: unknown) =>
  jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
    throw error;
  });

describe("storageIO の書き込み失敗通知", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it("setStorageItem が失敗したら通知する", () => {
    const { details, cleanup } = listenFailures();
    breakSetItem(new DOMException("full", "QuotaExceededError"));

    setStorageItem("todo-lists", [{ id: "1" }]);

    expect(details).toEqual([{ key: "todo-lists", reason: "quota-exceeded" }]);
    cleanup();
  });

  it("setUnscopedStorageItem が失敗したら通知する", () => {
    const { details, cleanup } = listenFailures();
    breakSetItem(new DOMException("full", "QuotaExceededError"));

    setUnscopedStorageItem("theme", "dark");

    expect(details).toEqual([{ key: "theme", reason: "quota-exceeded" }]);
    cleanup();
  });

  it("removeStorageItem が失敗したら通知する", () => {
    const { details, cleanup } = listenFailures();
    breakRemoveItem(new Error("boom"));

    removeStorageItem("todo-lists");

    expect(details).toEqual([{ key: "todo-lists", reason: "unknown" }]);
    cleanup();
  });

  it("removeUnscopedStorageItem が失敗したら通知する", () => {
    const { details, cleanup } = listenFailures();
    breakRemoveItem(new Error("boom"));

    removeUnscopedStorageItem("theme");

    expect(details).toEqual([{ key: "theme", reason: "unknown" }]);
    cleanup();
  });

  it("setLocalDataUpdatedAt が失敗したら通知する", () => {
    const { details, cleanup } = listenFailures();
    breakSetItem(new DOMException("full", "QuotaExceededError"));

    setLocalDataUpdatedAt(1234567890);

    expect(details).toHaveLength(1);
    expect(details[0].reason).toBe("quota-exceeded");
    cleanup();
  });

  it("書き込みが成功したときは通知しない", () => {
    const { details, cleanup } = listenFailures();

    setStorageItem("todo-lists", [{ id: "1" }]);

    expect(details).toEqual([]);
    cleanup();
  });

  it("読み取りの失敗では通知しない（デフォルト値へのフォールバックは正常系）", () => {
    // 読み取りは既定値に落ちるだけでデータ消失ではないため、
    // バナーを出す対象にしない
    const { details, cleanup } = listenFailures();
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("boom");
    });

    expect(getStorageItem("todo-lists", [])).toEqual([]);

    expect(details).toEqual([]);
    cleanup();
  });
});
