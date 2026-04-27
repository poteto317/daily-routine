import {
  computeContentHash,
  saveSyncedContentHash,
  getSyncedContentHash,
} from "../sync/syncedContentHash";

describe("syncedContentHash", () => {
  beforeEach(() => {
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
  });

  describe("saveSyncedContentHash / getSyncedContentHash", () => {
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

    it("localStorage が破損している場合は null を返す", () => {
      localStorage.setItem("synced-content-hash", "not-a-number");
      expect(getSyncedContentHash()).toBeNull();
    });

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
});
