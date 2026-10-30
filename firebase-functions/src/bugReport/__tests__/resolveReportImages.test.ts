import { MAX_IMAGE_BYTES } from "../imageFormats";
import {
  countReferencedImages,
  type ImageStore,
  resolveReportImages,
} from "../resolveReportImages";

function makePngBuffer(): Buffer {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x11, 0x22,
  ]);
}

function makeJpegBuffer(): Buffer {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
}

function createFakeStore(overrides: Partial<ImageStore> = {}): {
  store: ImageStore;
  getSize: jest.Mock<Promise<number | null>, [string]>;
  download: jest.Mock<Promise<Buffer>, [string]>;
  getDownloadUrl: jest.Mock<Promise<string>, [string]>;
} {
  const getSize = jest
    .fn<Promise<number | null>, [string]>()
    .mockResolvedValue(1024);
  const download = jest
    .fn<Promise<Buffer>, [string]>()
    .mockResolvedValue(makePngBuffer());
  const getDownloadUrl = jest
    .fn<Promise<string>, [string]>()
    .mockImplementation(async (path) => `https://example.test/${path}`);

  const store: ImageStore = {
    getSize,
    download,
    getDownloadUrl,
    ...overrides,
  };
  return { store, getSize, download, getDownloadUrl };
}

describe("resolveReportImages", () => {
  describe("countReferencedImages", () => {
    it("配列でない場合は 0、配列の場合は上限 3 までの件数を返す", () => {
      expect(countReferencedImages(undefined)).toBe(0);
      expect(countReferencedImages(null)).toBe(0);
      expect(countReferencedImages("not-array")).toBe(0);
      expect(countReferencedImages([])).toBe(0);
      expect(countReferencedImages([{}, {}])).toBe(2);
      expect(countReferencedImages([{}, {}, {}, {}])).toBe(3);
    });
  });

  it("有効な 2 件の画像参照を順に解決し、mediaType・data・url と skippedCount=0 を返す", async () => {
    const pngBuf = makePngBuffer();
    const jpegBuf = makeJpegBuffer();
    const { store, download, getDownloadUrl } = createFakeStore();
    download.mockResolvedValueOnce(pngBuf).mockResolvedValueOnce(jpegBuf);
    getDownloadUrl
      .mockResolvedValueOnce("https://example.test/tok1")
      .mockResolvedValueOnce("https://example.test/tok2");
    const logger = { warn: jest.fn() };

    const result = await resolveReportImages({
      uid: "u1",
      reportId: "r1",
      images: [
        {
          path: "bugReports/u1/r1/img1.png",
          contentType: "image/png",
          size: 10,
        },
        {
          path: "bugReports/u1/r1/img2.jpg",
          contentType: "image/jpeg",
          size: 6,
        },
      ],
      store,
      logger,
    });

    expect(result).toEqual({
      images: [
        {
          mediaType: "image/png",
          data: pngBuf,
          url: "https://example.test/tok1",
        },
        {
          mediaType: "image/jpeg",
          data: jpegBuf,
          url: "https://example.test/tok2",
        },
      ],
      skippedCount: 0,
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("images が配列でない場合は空の結果を返し store を呼ばない", async () => {
    const { store, getSize, download, getDownloadUrl } = createFakeStore();
    const logger = { warn: jest.fn() };

    for (const invalid of [undefined, null, "str", 123, { path: "x" }]) {
      const result = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: invalid,
        store,
        logger,
      });
      expect(result).toEqual({ images: [], skippedCount: 0 });
    }

    expect(getSize).not.toHaveBeenCalled();
    expect(download).not.toHaveBeenCalled();
    expect(getDownloadUrl).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("4 件以上の参照がある場合は先頭 3 件のみ処理し、4 件目以降は skippedCount に数えない", async () => {
    const { store, download } = createFakeStore();
    const logger = { warn: jest.fn() };

    const result = await resolveReportImages({
      uid: "u1",
      reportId: "r1",
      images: [
        { path: "bugReports/u1/r1/a.png" },
        { path: "bugReports/u1/r1/b.png" },
        { path: "bugReports/u1/r1/c.png" },
        { path: "bugReports/u1/r1/d.png" },
      ],
      store,
      logger,
    });

    expect(result.images).toHaveLength(3);
    expect(result.skippedCount).toBe(0);
    expect(download).toHaveBeenCalledTimes(3);
  });

  describe("パス検証（先頭 3 件の不正参照は飛ばして skippedCount に数え store を呼ばない）", () => {
    it.each([
      ["別の uid のパス", { path: "bugReports/u2/r1/x.png" }],
      ["別の報告 ID のパス", { path: "bugReports/u1/r2/x.png" }],
      [
        "親ディレクトリ参照 (..) を含むパス",
        { path: "bugReports/u1/r1/../x.png" },
      ],
      [
        "ファイル名が IMAGE_FILE_NAME_PATTERN に合わないパス",
        { path: "bugReports/u1/r1/bad.svg" },
      ],
      ["余分な階層を含むパス", { path: "bugReports/u1/r1/sub/x.png" }],
      ["path が文字列でない要素", { path: 123 }],
      ["オブジェクトでない要素 (null)", null],
      ["オブジェクトでない要素 (文字列)", "bugReports/u1/r1/x.png"],
    ])(
      "%s を飛ばして skippedCount=1 にし store を呼ばない",
      async (_label, badEntry) => {
        const { store, getSize, download, getDownloadUrl } = createFakeStore();
        const logger = { warn: jest.fn() };

        const result = await resolveReportImages({
          uid: "u1",
          reportId: "r1",
          images: [badEntry],
          store,
          logger,
        });

        expect(result).toEqual({ images: [], skippedCount: 1 });
        expect(getSize).not.toHaveBeenCalled();
        expect(download).not.toHaveBeenCalled();
        expect(getDownloadUrl).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledTimes(1);
      },
    );
  });

  describe("サイズ検証", () => {
    it("getSize が null または 0 の場合は download を呼ばず skippedCount に数える", async () => {
      const { store, getSize, download } = createFakeStore();
      getSize.mockResolvedValueOnce(null).mockResolvedValueOnce(0);
      const logger = { warn: jest.fn() };

      const result1 = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [{ path: "bugReports/u1/r1/a.png" }],
        store,
        logger,
      });
      expect(result1).toEqual({ images: [], skippedCount: 1 });

      const result2 = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [{ path: "bugReports/u1/r1/b.png" }],
        store,
        logger,
      });
      expect(result2).toEqual({ images: [], skippedCount: 1 });
      expect(download).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledTimes(2);
    });

    it("getSize が例外を投げた場合は download を呼ばず skippedCount に数える", async () => {
      const { store, getSize, download } = createFakeStore();
      getSize.mockRejectedValueOnce(new Error("Not Found"));
      const logger = { warn: jest.fn() };

      const result = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [{ path: "bugReports/u1/r1/a.png" }],
        store,
        logger,
      });

      expect(result).toEqual({ images: [], skippedCount: 1 });
      expect(download).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it("getSize が 5MB + 1 の場合は download を呼ばず skippedCount に数える", async () => {
      const { store, getSize, download } = createFakeStore();
      getSize.mockResolvedValueOnce(MAX_IMAGE_BYTES + 1);
      const logger = { warn: jest.fn() };

      const result = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [{ path: "bugReports/u1/r1/a.png" }],
        store,
        logger,
      });

      expect(result).toEqual({ images: [], skippedCount: 1 });
      expect(download).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it("getSize がちょうど 5MB の場合は通過して解決される", async () => {
      const { store, getSize, download } = createFakeStore();
      getSize.mockResolvedValueOnce(MAX_IMAGE_BYTES);
      const logger = { warn: jest.fn() };

      const result = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [{ path: "bugReports/u1/r1/a.png" }],
        store,
        logger,
      });

      expect(result.images).toHaveLength(1);
      expect(result.skippedCount).toBe(0);
      expect(download).toHaveBeenCalledTimes(1);
    });
  });

  describe("ダウンロード・マジックナンバー・URL 取得の検証", () => {
    it("download が例外を投げた場合は飛ばして skippedCount に数える", async () => {
      const { store, download, getDownloadUrl } = createFakeStore();
      download.mockRejectedValueOnce(new Error("network failure"));
      const logger = { warn: jest.fn() };

      const result = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [{ path: "bugReports/u1/r1/a.png" }],
        store,
        logger,
      });

      expect(result).toEqual({ images: [], skippedCount: 1 });
      expect(getDownloadUrl).not.toHaveBeenCalled();
    });

    it("download で取得したバッファが空（0バイト）の場合は missing として飛ばし、skippedCount に数える", async () => {
      const { store, download, getDownloadUrl } = createFakeStore();
      download.mockResolvedValueOnce(Buffer.alloc(0));
      const logger = { warn: jest.fn() };

      const result = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [{ path: "bugReports/u1/r1/empty.png" }],
        store,
        logger,
      });

      expect(result).toEqual({ images: [], skippedCount: 1 });
      expect(getDownloadUrl).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("(missing)"),
      );
    });

    it("download で取得したバッファが 5MB 超の場合は too_large として飛ばし、skippedCount に数える", async () => {
      const { store, download, getDownloadUrl } = createFakeStore();
      download.mockResolvedValueOnce(Buffer.alloc(MAX_IMAGE_BYTES + 1));
      const logger = { warn: jest.fn() };

      const result = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [{ path: "bugReports/u1/r1/huge.png" }],
        store,
        logger,
      });

      expect(result).toEqual({ images: [], skippedCount: 1 });
      expect(getDownloadUrl).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledTimes(1);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("(too_large)"),
      );
    });

    it("バイト列が許可形式でない（SVG・テキスト・PDF）場合は飛ばして skippedCount に数える", async () => {
      const { store, download, getDownloadUrl } = createFakeStore();
      download
        .mockResolvedValueOnce(Buffer.from("<svg></svg>"))
        .mockResolvedValueOnce(Buffer.from("%PDF-1.5"));
      const logger = { warn: jest.fn() };

      const result = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [
          { path: "bugReports/u1/r1/a.png" },
          { path: "bugReports/u1/r1/b.png" },
        ],
        store,
        logger,
      });

      expect(result).toEqual({ images: [], skippedCount: 2 });
      expect(getDownloadUrl).not.toHaveBeenCalled();
    });

    it("申告された contentType が image/png でもバイト列が JPEG なら mediaType は image/jpeg になる", async () => {
      const { store, download } = createFakeStore();
      download.mockResolvedValueOnce(makeJpegBuffer());
      const logger = { warn: jest.fn() };

      const result = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [
          {
            path: "bugReports/u1/r1/a.png",
            contentType: "image/png",
            size: 10,
          },
        ],
        store,
        logger,
      });

      expect(result.images).toHaveLength(1);
      expect(result.images[0]?.mediaType).toBe("image/jpeg");
      expect(result.skippedCount).toBe(0);
    });

    it("getDownloadUrl が例外を投げた場合はその画像だけ飛ばす", async () => {
      const { store, getDownloadUrl } = createFakeStore();
      getDownloadUrl.mockRejectedValueOnce(new Error("setMetadata failed"));
      const logger = { warn: jest.fn() };

      const result = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [{ path: "bugReports/u1/r1/a.png" }],
        store,
        logger,
      });

      expect(result).toEqual({ images: [], skippedCount: 1 });
    });

    it("1 件目が失敗しても 2 件目は続けて処理され、ログにパス・URL・バイト列を含めない", async () => {
      const { store, download, getDownloadUrl } = createFakeStore();
      download
        .mockRejectedValueOnce(
          new Error("secret failure at https://secret.example/token"),
        )
        .mockResolvedValueOnce(makePngBuffer());
      getDownloadUrl.mockResolvedValueOnce(
        "https://firebasestorage.googleapis.com/v0/b/b1/o/p?alt=media&token=secret-tok",
      );
      const logger = { warn: jest.fn() };

      const result = await resolveReportImages({
        uid: "u1",
        reportId: "r1",
        images: [
          { path: "bugReports/u1/r1/fail.png" },
          { path: "bugReports/u1/r1/ok.png" },
        ],
        store,
        logger,
      });

      expect(result.images).toHaveLength(1);
      expect(result.skippedCount).toBe(1);
      expect(logger.warn).toHaveBeenCalledTimes(1);

      const serializedWarn = JSON.stringify(logger.warn.mock.calls);
      expect(serializedWarn).not.toContain("bugReports/");
      expect(serializedWarn).not.toContain("https://");
      expect(serializedWarn).not.toContain("secret");
      expect(serializedWarn).toContain("download_failed");
    });
  });
});
