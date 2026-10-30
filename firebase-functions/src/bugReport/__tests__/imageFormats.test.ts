import {
  IMAGE_FILE_NAME_PATTERN,
  MAX_IMAGE_BYTES,
  MAX_REPORT_IMAGES,
  sniffImageMediaType,
} from "../imageFormats";

describe("imageFormats", () => {
  describe("constants", () => {
    it("上限値とファイル名パターンが仕様通り定義されている", () => {
      expect(MAX_REPORT_IMAGES).toBe(3);
      expect(MAX_IMAGE_BYTES).toBe(5 * 1024 * 1024);
      expect(IMAGE_FILE_NAME_PATTERN.source).toBe(
        "^[A-Za-z0-9_-]{1,64}\\.(png|jpg|webp|gif)$",
      );
    });

    it("IMAGE_FILE_NAME_PATTERN が有効なファイル名に一致し不正なファイル名を拒否する", () => {
      expect(IMAGE_FILE_NAME_PATTERN.test("a1_-Z.png")).toBe(true);
      expect(IMAGE_FILE_NAME_PATTERN.test("x.jpg")).toBe(true);
      expect(IMAGE_FILE_NAME_PATTERN.test("x.webp")).toBe(true);
      expect(IMAGE_FILE_NAME_PATTERN.test("x.gif")).toBe(true);
      expect(IMAGE_FILE_NAME_PATTERN.test(`${"a".repeat(64)}.png`)).toBe(true);

      expect(IMAGE_FILE_NAME_PATTERN.test(`${"a".repeat(65)}.png`)).toBe(false);
      expect(IMAGE_FILE_NAME_PATTERN.test("x.jpeg")).toBe(false);
      expect(IMAGE_FILE_NAME_PATTERN.test("x.svg")).toBe(false);
      expect(IMAGE_FILE_NAME_PATTERN.test("../x.png")).toBe(false);
      expect(IMAGE_FILE_NAME_PATTERN.test("a/b.png")).toBe(false);
      expect(IMAGE_FILE_NAME_PATTERN.test("x.png.exe")).toBe(false);
      expect(IMAGE_FILE_NAME_PATTERN.test(".png")).toBe(false);
      expect(IMAGE_FILE_NAME_PATTERN.test("")).toBe(false);
    });
  });

  describe("sniffImageMediaType", () => {
    it("PNG のマジックナンバーを image/png と判定する", () => {
      const png = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x01,
      ]);
      expect(sniffImageMediaType(png)).toBe("image/png");
    });

    it("JPEG のマジックナンバーを image/jpeg と判定する", () => {
      const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      expect(sniffImageMediaType(jpeg)).toBe("image/jpeg");
    });

    it("GIF87a / GIF89a のマジックナンバーを image/gif と判定する", () => {
      expect(sniffImageMediaType(Buffer.from("GIF87a\x01\x00", "ascii"))).toBe(
        "image/gif",
      );
      expect(sniffImageMediaType(Buffer.from("GIF89a\x01\x00", "ascii"))).toBe(
        "image/gif",
      );
    });

    it("WebP (RIFF....WEBP) のマジックナンバーを image/webp と判定する", () => {
      const webp = Buffer.concat([
        Buffer.from("RIFF", "ascii"),
        Buffer.from([0x24, 0x00, 0x00, 0x00]),
        Buffer.from("WEBP", "ascii"),
        Buffer.from([0x56, 0x50, 0x38, 0x20]),
      ]);
      expect(sniffImageMediaType(webp)).toBe("image/webp");
    });

    it("RIFF で始まるが 8〜11 バイト目が WEBP でない場合は null を返す", () => {
      const wave = Buffer.concat([
        Buffer.from("RIFF", "ascii"),
        Buffer.from([0x24, 0x00, 0x00, 0x00]),
        Buffer.from("WAVE", "ascii"),
      ]);
      expect(sniffImageMediaType(wave)).toBeNull();
    });

    it("PNG の途中までしか一致しないバイト列は null を返す", () => {
      const partialPng = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      expect(sniffImageMediaType(partialPng)).toBeNull();
      const corruptedPng = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x00,
      ]);
      expect(sniffImageMediaType(corruptedPng)).toBeNull();
    });

    it("空・短すぎるバッファ・SVG・HTML・PDF は null を返す", () => {
      expect(sniffImageMediaType(Buffer.alloc(0))).toBeNull();
      expect(sniffImageMediaType(Buffer.from([0xff, 0xd8]))).toBeNull();
      expect(
        sniffImageMediaType(
          Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'>"),
        ),
      ).toBeNull();
      expect(
        sniffImageMediaType(Buffer.from("<!DOCTYPE html><html>")),
      ).toBeNull();
      expect(sniffImageMediaType(Buffer.from("%PDF-1.7\n"))).toBeNull();
    });
  });
});
