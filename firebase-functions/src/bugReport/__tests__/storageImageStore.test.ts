import {
  type BucketLike,
  ensurePrivateReportImage,
  createStorageImageStore,
  type FileLike,
} from "../storageImageStore";

function createFakeBucket(): {
  bucket: BucketLike;
  fileMock: jest.Mock<FileLike, [string]>;
  getMetadata: jest.Mock;
  download: jest.Mock;
  setMetadata: jest.Mock;
  getSignedUrl: jest.Mock;
} {
  const getMetadata = jest.fn();
  const download = jest.fn();
  const setMetadata = jest.fn().mockResolvedValue([{}]);
  const getSignedUrl = jest
    .fn()
    .mockResolvedValue(["https://example.test/signed-image"]);
  const fileObj: FileLike = {
    getMetadata,
    download,
    setMetadata,
    getSignedUrl,
  };
  const fileMock = jest.fn<FileLike, [string]>().mockReturnValue(fileObj);
  const bucket: BucketLike = {
    file: fileMock,
  };
  return { bucket, fileMock, getMetadata, download, setMetadata, getSignedUrl };
}

describe("storageImageStore", () => {
  describe("getSize", () => {
    it("メタデータの size が数値または数値文字列の場合はその数値を返す", async () => {
      const { bucket, fileMock, getMetadata } = createFakeBucket();
      const store = createStorageImageStore(bucket);

      getMetadata.mockResolvedValueOnce([{ size: "1234" }]);
      await expect(store.getSize("bugReports/u1/r1/a.png")).resolves.toBe(1234);
      expect(fileMock).toHaveBeenCalledWith("bugReports/u1/r1/a.png");

      getMetadata.mockResolvedValueOnce([{ size: 5678 }]);
      await expect(store.getSize("bugReports/u1/r1/b.png")).resolves.toBe(5678);
    });

    it("size が undefined・非数値文字列・負数・NaN の場合は null を返す", async () => {
      const { bucket, getMetadata } = createFakeBucket();
      const store = createStorageImageStore(bucket);

      for (const badSize of [undefined, "abc", "", -1, "-5", Number.NaN]) {
        getMetadata.mockResolvedValueOnce([{ size: badSize }]);
        await expect(
          store.getSize("bugReports/u1/r1/a.png"),
        ).resolves.toBeNull();
      }
    });

    it("getMetadata が例外を投げた場合はそのまま例外を投げる", async () => {
      const { bucket, getMetadata } = createFakeBucket();
      const store = createStorageImageStore(bucket);
      getMetadata.mockRejectedValueOnce(new Error("404 Not Found"));

      await expect(store.getSize("bugReports/u1/r1/a.png")).rejects.toThrow(
        "404 Not Found",
      );
    });
  });

  describe("download", () => {
    it("file.download() の先頭 Buffer を返す", async () => {
      const { bucket, fileMock, download } = createFakeBucket();
      const buf = Buffer.from([1, 2, 3]);
      download.mockResolvedValueOnce([buf]);
      const store = createStorageImageStore(bucket);

      const res = await store.download("bugReports/u1/r1/a.png");
      expect(fileMock).toHaveBeenCalledWith("bugReports/u1/r1/a.png");
      expect(res).toBe(buf);
    });
  });

  describe("getDownloadUrl", () => {
    const path = "bugReports/u1/r1/a.png";
    const now = 1_800_000_000_000;
    const cacheControl = "private, no-store, max-age=0";
    const generation = "1784213261164653";
    const secureMetadata = { cacheControl, generation, metageneration: "2" };
    const legacyMetadata = {
      generation,
      metageneration: "1",
      metadata: {
        firebaseStorageDownloadTokens: "fixture-a,fixture-b",
        other: "keep",
      },
    };

    it("既存トークンを条件付きで削除し、再確認後、同じ世代に15分の読み取り署名を発行する", async () => {
      const { bucket, getMetadata, setMetadata, getSignedUrl } =
        createFakeBucket();
      getMetadata
        .mockResolvedValueOnce([legacyMetadata])
        .mockResolvedValueOnce([secureMetadata]);

      await expect(
        createStorageImageStore(bucket, () => now).getDownloadUrl(path),
      ).resolves.toBe("https://example.test/signed-image");

      expect(setMetadata).toHaveBeenCalledWith(
        { cacheControl, metadata: { firebaseStorageDownloadTokens: null } },
        { ifGenerationMatch: generation, ifMetagenerationMatch: "1" },
      );
      expect(getMetadata).toHaveBeenCalledTimes(2);
      expect(getSignedUrl).toHaveBeenCalledWith({
        version: "v4",
        action: "read",
        expires: now + 15 * 60 * 1000,
        queryParams: { generation },
      });
      expect(getSignedUrl.mock.invocationCallOrder[0]).toBeGreaterThan(
        getMetadata.mock.invocationCallOrder[1],
      );
    });

    it("保護済みオブジェクトのメタデータを書き換えない", async () => {
      const { bucket, getMetadata, setMetadata, getSignedUrl } =
        createFakeBucket();
      getMetadata.mockResolvedValue([secureMetadata]);

      await createStorageImageStore(bucket).getDownloadUrl(path);

      expect(setMetadata).not.toHaveBeenCalled();
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it.each([
      [
        "トークンが残る",
        { ...secureMetadata, metadata: legacyMetadata.metadata },
      ],
      [
        "キャッシュ設定が反映されない",
        { ...secureMetadata, cacheControl: "public" },
      ],
      ["世代が変わる", { ...secureMetadata, generation: "9999" }],
    ])("%s 場合に署名を発行しない", async (_, finalMetadata) => {
      const { bucket, getMetadata, getSignedUrl } = createFakeBucket();
      getMetadata
        .mockResolvedValueOnce([legacyMetadata])
        .mockResolvedValueOnce([finalMetadata]);

      await expect(
        createStorageImageStore(bucket).getDownloadUrl(path),
      ).rejects.toThrow();
      expect(getSignedUrl).not.toHaveBeenCalled();
    });

    it("メタデータの更新失敗時に署名を発行しない", async () => {
      const { bucket, getMetadata, setMetadata, getSignedUrl } =
        createFakeBucket();
      getMetadata.mockResolvedValueOnce([legacyMetadata]);
      setMetadata.mockRejectedValueOnce(new Error("fixture update failed"));

      await expect(
        createStorageImageStore(bucket).getDownloadUrl(path),
      ).rejects.toThrow();
      expect(getSignedUrl).not.toHaveBeenCalled();
    });

    it("移行の確認モードはメタデータを変更しない", async () => {
      const { bucket, getMetadata, setMetadata, getSignedUrl } =
        createFakeBucket();
      getMetadata.mockResolvedValueOnce([legacyMetadata]);

      await expect(
        ensurePrivateReportImage(bucket.file(path), false),
      ).resolves.toEqual({ generation, needsUpdate: true });
      expect(setMetadata).not.toHaveBeenCalled();
      expect(getSignedUrl).not.toHaveBeenCalled();
    });
  });
});
