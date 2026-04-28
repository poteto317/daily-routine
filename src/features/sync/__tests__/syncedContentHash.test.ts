import {
  computeContentHash,
  saveSyncedContentHash,
  getSyncedContentHash,
} from "../sync/syncedContentHash";
import { setCurrentUserId, getUserScopedKey } from "@/lib/storage/core";
import { SYNCED_CONTENT_HASH_KEY } from "../sync/constants";

describe("syncedContentHash", () => {
  beforeEach(() => {
    setCurrentUserId(null);
    localStorage.clear();
  });

  describe("computeContentHash", () => {
    it("同じデータは同じハッシュを返す", () => {
      const data = { routines: [], settings: { theme: "auto" } };
      expect(computeContentHash(data)).toBe(computeContentHash(data));
    });

    it("異なるデータは異なるハッシュを返す", () => {
      const a = { routines: [] };
      const b = { routines: [{ id: "r1" }] };
      expect(computeContentHash(a)).not.toBe(computeContentHash(b));
    });

    it("空オブジェクトでも数値を返す", () => {
      expect(typeof computeContentHash({})).toBe("number");
    });

    it("キー順序が異なっても同じハッシュを返す", () => {
      const a = { b: 1, a: 2 };
      const b = { a: 2, b: 1 };
      expect(computeContentHash(a)).toBe(computeContentHash(b));
    });

    it("ネストされたオブジェクトのキー順序が異なっても同じハッシュを返す", () => {
      const a = { settings: { z: true, a: false }, routines: [] };
      const b = { routines: [], settings: { a: false, z: true } };
      expect(computeContentHash(a)).toBe(computeContentHash(b));
    });
  });

  describe("saveSyncedContentHash / getSyncedContentHash", () => {
    beforeEach(() => {
      // ハッシュ保存・取得はユーザースコープが確立されている前提
      setCurrentUserId("test-user");
    });

    it("保存したハッシュを取得できる", () => {
      const data = { routines: [], settings: { theme: "dark" } };
      saveSyncedContentHash(data);
      expect(getSyncedContentHash()).toBe(computeContentHash(data));
    });

    it("未保存の場合は null を返す", () => {
      expect(getSyncedContentHash()).toBeNull();
    });

    it("上書き保存した場合は新しいハッシュを返す", () => {
      const data1 = { routines: [] };
      const data2 = { routines: [{ id: "r1" }] };
      saveSyncedContentHash(data1);
      saveSyncedContentHash(data2);
      expect(getSyncedContentHash()).toBe(computeContentHash(data2));
    });

    it.each([
      "not-a-number",
      JSON.stringify("123"),
      JSON.stringify(true),
      JSON.stringify({}),
    ])(
      "不正なハッシュ値 (%s) が保存されている場合は null を返す",
      (storedValue) => {
        localStorage.setItem(getUserScopedKey(SYNCED_CONTENT_HASH_KEY), storedValue);
        expect(getSyncedContentHash()).toBeNull();
      },
    );

    it("localStorage.setItem が失敗しても例外をスローしない", () => {
      const spy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new DOMException("QuotaExceededError");
        });
      expect(() => saveSyncedContentHash({ routines: [] })).not.toThrow();
      spy.mockRestore();
    });
  });

  describe("currentUserId が null のとき（スコープ未確立）", () => {
    it("saveSyncedContentHash は何も保存しない", () => {
      saveSyncedContentHash({ routines: [] });
      expect(localStorage.length).toBe(0);
    });

    it("getSyncedContentHash は null を返す", () => {
      // スコープなしキーに値があっても null を返す
      localStorage.setItem(SYNCED_CONTENT_HASH_KEY, "12345");
      expect(getSyncedContentHash()).toBeNull();
    });
  });

  describe("ユーザースコープ分離", () => {
    afterEach(() => {
      setCurrentUserId(null);
    });

    it("ユーザーごとにハッシュが独立して保存される", () => {
      const data1 = { routines: [{ id: "r1" }] };
      const data2 = { routines: [{ id: "r2" }] };

      setCurrentUserId("uid-1");
      saveSyncedContentHash(data1);

      setCurrentUserId("uid-2");
      saveSyncedContentHash(data2);

      expect(getSyncedContentHash()).toBe(computeContentHash(data2));

      setCurrentUserId("uid-1");
      expect(getSyncedContentHash()).toBe(computeContentHash(data1));
    });

    it("別ユーザーのハッシュ保存後も元ユーザーのハッシュは変わらない", () => {
      const originalData = { routines: [] };

      setCurrentUserId("uid-1");
      saveSyncedContentHash(originalData);
      const originalHash = getSyncedContentHash();

      setCurrentUserId("uid-2");
      saveSyncedContentHash({ routines: [{ id: "r-new" }] });

      setCurrentUserId("uid-1");
      expect(getSyncedContentHash()).toBe(originalHash);
    });
  });
});
