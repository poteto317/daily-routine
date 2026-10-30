import {
  LOCAL_DATA_UPDATED_AT_EVENT,
  LOCAL_DATA_UPDATED_AT_KEY,
  getLocalDataUpdatedAt,
  setLocalDataUpdatedAt,
} from "../localDataUpdatedAt";
import {
  STORAGE_WRITE_FAILED_EVENT,
  replayLastStorageWriteFailure,
  type StorageWriteFailureDetail,
} from "../storageWriteFailureEvent";
import { setCurrentUserId } from "../userScope";

const SCOPED_KEY = `user:u1:${LOCAL_DATA_UPDATED_AT_KEY}`;

describe("localDataUpdatedAt", () => {
  beforeEach(() => {
    localStorage.clear();
    setCurrentUserId("u1");
  });

  afterEach(() => {
    setCurrentUserId(null);
    jest.restoreAllMocks();
    // 取りこぼし用のバッファがテスト間で持ち越されないようにする
    replayLastStorageWriteFailure();
  });

  describe("getLocalDataUpdatedAt", () => {
    it("ユーザーごとのキーに保存された値を数値で返す", () => {
      localStorage.setItem(SCOPED_KEY, "1761800000000");

      expect(getLocalDataUpdatedAt()).toBe(1761800000000);
    });

    it("未保存なら 0", () => {
      expect(getLocalDataUpdatedAt()).toBe(0);
    });

    it("別ユーザーの値は読まない", () => {
      localStorage.setItem(
        `user:other:${LOCAL_DATA_UPDATED_AT_KEY}`,
        "1761800000000",
      );

      expect(getLocalDataUpdatedAt()).toBe(0);
    });

    it("ログイン前はスコープなしのキーを読む", () => {
      setCurrentUserId(null);
      localStorage.setItem(LOCAL_DATA_UPDATED_AT_KEY, "42");

      expect(getLocalDataUpdatedAt()).toBe(42);
    });

    it("数値に変換できない値なら 0", () => {
      localStorage.setItem(SCOPED_KEY, "broken");

      expect(getLocalDataUpdatedAt()).toBe(0);
    });

    it("localStorage の読み取りが例外を投げても 0", () => {
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });

      expect(getLocalDataUpdatedAt()).toBe(0);
    });
  });

  describe("setLocalDataUpdatedAt", () => {
    it("ユーザーごとのキーに保存し、変更イベントを発火する", () => {
      const listener = jest.fn();
      window.addEventListener(LOCAL_DATA_UPDATED_AT_EVENT, listener);

      setLocalDataUpdatedAt(1761800000000);

      expect(localStorage.getItem(SCOPED_KEY)).toBe("1761800000000");
      expect(listener).toHaveBeenCalledTimes(1);
      expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({
        timestamp: 1761800000000,
      });
      window.removeEventListener(LOCAL_DATA_UPDATED_AT_EVENT, listener);
    });

    it("保存した値を getLocalDataUpdatedAt で読み戻せる", () => {
      setLocalDataUpdatedAt(123);

      expect(getLocalDataUpdatedAt()).toBe(123);
    });

    it("書き込みに失敗したら例外を投げず、保存失敗を通知して変更イベントは出さない", () => {
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("full", "QuotaExceededError");
      });
      const changed = jest.fn();
      const failures: StorageWriteFailureDetail[] = [];
      const onFailure = (event: Event) => {
        failures.push((event as CustomEvent<StorageWriteFailureDetail>).detail);
      };
      window.addEventListener(LOCAL_DATA_UPDATED_AT_EVENT, changed);
      window.addEventListener(STORAGE_WRITE_FAILED_EVENT, onFailure);

      expect(() => setLocalDataUpdatedAt(1)).not.toThrow();

      expect(changed).not.toHaveBeenCalled();
      expect(failures).toEqual([
        expect.objectContaining({ key: LOCAL_DATA_UPDATED_AT_KEY }),
      ]);
      window.removeEventListener(LOCAL_DATA_UPDATED_AT_EVENT, changed);
      window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, onFailure);
    });
  });
});
