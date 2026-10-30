import { DEFAULT_SYNC_STATUS, SYNC_STATUS_KEY } from "../sync/constants";
import {
  getSyncStatus,
  setSyncStatus,
  resetStaleSyncingState,
} from "../sync/statusStore";

describe("statusStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getSyncStatus", () => {
    it("localStorage が空の場合はデフォルト値を返す", () => {
      expect(getSyncStatus()).toMatchObject({
        isSyncing: false,
        lastSyncTime: null,
        hasRemoteChanges: false,
        hasLocalChanges: false,
        error: null,
      });
    });

    it("localStorage に保存された値を返す", () => {
      localStorage.setItem(
        SYNC_STATUS_KEY,
        JSON.stringify({ isSyncing: true, error: "err" }),
      );
      expect(getSyncStatus()).toMatchObject({ isSyncing: true, error: "err" });
    });

    it("localStorage の値が壊れている場合はデフォルト値を返す", () => {
      localStorage.setItem(SYNC_STATUS_KEY, "invalid-json{{{");
      expect(getSyncStatus()).toMatchObject({ isSyncing: false });
    });

    it.each(["null", "123", "true"])(
      "JSON として正しくてもオブジェクトでない値 %s ならデフォルト値を返す",
      (stored) => {
        localStorage.setItem(SYNC_STATUS_KEY, stored);
        expect(getSyncStatus()).toEqual(DEFAULT_SYNC_STATUS);
      },
    );

    it("保存値に無い項目はデフォルト値で補う", () => {
      localStorage.setItem(
        SYNC_STATUS_KEY,
        JSON.stringify({ lastSyncTime: 42 }),
      );
      expect(getSyncStatus()).toEqual({
        ...DEFAULT_SYNC_STATUS,
        lastSyncTime: 42,
      });
    });

    it("localStorage の読み出しが例外を投げてもデフォルト値を返す", () => {
      const getItemSpy = jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation(() => {
          throw new DOMException("denied", "SecurityError");
        });
      try {
        expect(getSyncStatus()).toEqual(DEFAULT_SYNC_STATUS);
      } finally {
        getItemSpy.mockRestore();
      }
    });
  });

  describe("setSyncStatus", () => {
    it("現在の状態を部分的に上書きして保存する", () => {
      setSyncStatus({ isSyncing: true, error: "テストエラー" });

      const status = getSyncStatus();
      expect(status.isSyncing).toBe(true);
      expect(status.error).toBe("テストエラー");
    });

    it("sync-status-changed イベントを発火する", () => {
      const handler = jest.fn();
      window.addEventListener("sync-status-changed", handler);

      setSyncStatus({ isSyncing: true });

      expect(handler).toHaveBeenCalledTimes(1);
      window.removeEventListener("sync-status-changed", handler);
    });

    it("イベントの detail には保存後の状態全体が入る", () => {
      const details: unknown[] = [];
      // WindowEventMap の宣言により、event は CustomEvent<SyncStatus> として受け取れる
      const handler = (event: WindowEventMap["sync-status-changed"]) => {
        details.push(event.detail);
      };
      window.addEventListener("sync-status-changed", handler);

      setSyncStatus({ error: "失敗" });

      window.removeEventListener("sync-status-changed", handler);
      expect(details).toEqual([{ ...DEFAULT_SYNC_STATUS, error: "失敗" }]);
    });
  });

  describe("resetStaleSyncingState", () => {
    it("isSyncing: true が残留している場合に false にリセットする", () => {
      localStorage.setItem(
        SYNC_STATUS_KEY,
        JSON.stringify({ isSyncing: true, error: null }),
      );

      resetStaleSyncingState();

      expect(getSyncStatus().isSyncing).toBe(false);
    });

    it("isSyncing: false の場合はストレージを変更しない", () => {
      localStorage.setItem(
        SYNC_STATUS_KEY,
        JSON.stringify({ isSyncing: false, error: null, lastSyncTime: 12345 }),
      );

      resetStaleSyncingState();

      expect(getSyncStatus()).toMatchObject({
        isSyncing: false,
        lastSyncTime: 12345,
      });
    });

    it("isSyncing: true の場合も sync-status-changed イベントを発火しない（サイレント更新）", () => {
      localStorage.setItem(
        SYNC_STATUS_KEY,
        JSON.stringify({ isSyncing: true }),
      );
      const handler = jest.fn();
      window.addEventListener("sync-status-changed", handler);

      resetStaleSyncingState();

      expect(handler).not.toHaveBeenCalled();
      window.removeEventListener("sync-status-changed", handler);
    });

    it("isSyncing: false の場合は sync-status-changed イベントを発火しない", () => {
      localStorage.setItem(
        SYNC_STATUS_KEY,
        JSON.stringify({ isSyncing: false }),
      );
      const handler = jest.fn();
      window.addEventListener("sync-status-changed", handler);

      resetStaleSyncingState();

      expect(handler).not.toHaveBeenCalled();
      window.removeEventListener("sync-status-changed", handler);
    });

    it("localStorage が空の場合（デフォルト isSyncing: false）は何もしない", () => {
      const handler = jest.fn();
      window.addEventListener("sync-status-changed", handler);

      resetStaleSyncingState();

      expect(handler).not.toHaveBeenCalled();
      window.removeEventListener("sync-status-changed", handler);
    });
  });

  describe("ストレージアクセスエラー（SecurityError 等）", () => {
    it("localStorage.setItem が例外をスローしても setSyncStatus はエラーを投げない", () => {
      const spy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new DOMException("QuotaExceededError");
        });

      try {
        expect(() => setSyncStatus({ isSyncing: true })).not.toThrow();
      } finally {
        spy.mockRestore();
      }
    });

    it("localStorage.setItem が例外をスローしても resetStaleSyncingState はエラーを投げない", () => {
      localStorage.setItem(
        SYNC_STATUS_KEY,
        JSON.stringify({ isSyncing: true }),
      );
      const spy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new DOMException("SecurityError");
        });

      try {
        expect(() => resetStaleSyncingState()).not.toThrow();
      } finally {
        spy.mockRestore();
      }
    });
  });
});
