import { MAX_BUG_REPORT_IMAGE_BYTES } from "../constants";
import { selectBugReportImages } from "../imageSelection";

function makeFile(name: string, type: string, sizeBytes = 1024): File {
  const file = new File([new Uint8Array(1)], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}

describe("selectBugReportImages", () => {
  it("許可された 4 形式（PNG・JPEG・WebP・GIF）を受け付ける", () => {
    const png = makeFile("a.png", "image/png");
    const jpg = makeFile("b.jpg", "image/jpeg");
    const webp = makeFile("c.webp", "image/webp");
    const gif = makeFile("d.gif", "image/gif");

    const res1 = selectBugReportImages([], [png, jpg, webp]);
    expect(res1.next).toEqual([png, jpg, webp]);
    expect(res1.errors).toEqual([]);

    const res2 = selectBugReportImages([], [gif]);
    expect(res2.next).toEqual([gif]);
    expect(res2.errors).toEqual([]);
  });

  it("許可外の形式（SVG・BMP・PDF・空 type）および 0 バイトファイルを取り除き unsupportedType を返す", () => {
    const svg = makeFile("a.svg", "image/svg+xml");
    const bmp = makeFile("b.bmp", "image/bmp");
    const pdf = makeFile("c.pdf", "application/pdf");
    const empty = makeFile("d.bin", "");
    const zeroByte = makeFile("zero.png", "image/png", 0);
    const png = makeFile("ok.png", "image/png");

    const res = selectBugReportImages(
      [],
      [svg, bmp, pdf, empty, zeroByte, png],
    );
    expect(res.next).toEqual([png]);
    expect(res.errors).toEqual(["unsupportedType"]);
  });

  it("ちょうど 5MB は受け付け、5MB + 1 は取り除き tooLarge を返す", () => {
    const exact = makeFile(
      "exact.png",
      "image/png",
      MAX_BUG_REPORT_IMAGE_BYTES,
    );
    const over = makeFile(
      "over.png",
      "image/png",
      MAX_BUG_REPORT_IMAGE_BYTES + 1,
    );

    const res = selectBugReportImages([], [exact, over]);
    expect(res.next).toEqual([exact]);
    expect(res.errors).toEqual(["tooLarge"]);
  });

  it("現在 2 枚に 2 枚追加すると先頭 1 枚だけ加わり tooMany を返し、現在 3 枚に 1 枚追加すると加わらず tooMany を返す", () => {
    const cur1 = makeFile("1.png", "image/png");
    const cur2 = makeFile("2.png", "image/png");
    const add1 = makeFile("3.png", "image/png");
    const add2 = makeFile("4.png", "image/png");

    const res1 = selectBugReportImages([cur1, cur2], [add1, add2]);
    expect(res1.next).toEqual([cur1, cur2, add1]);
    expect(res1.errors).toEqual(["tooMany"]);

    const res2 = selectBugReportImages([cur1, cur2, add1], [add2]);
    expect(res2.next).toEqual([cur1, cur2, add1]);
    expect(res2.errors).toEqual(["tooMany"]);
  });

  it("形式やサイズが不正なファイルは枠を消費しない（不正 1 + 有効 3 → 有効 3 が入り tooMany は出ない）", () => {
    const svg = makeFile("bad.svg", "image/svg+xml");
    const p1 = makeFile("1.png", "image/png");
    const p2 = makeFile("2.png", "image/png");
    const p3 = makeFile("3.png", "image/png");

    const res = selectBugReportImages([], [svg, p1, p2, p3]);
    expect(res.next).toEqual([p1, p2, p3]);
    expect(res.errors).toEqual(["unsupportedType"]);
  });

  it("複数のエラーが同時に起きた場合も重複せず unsupportedType → tooLarge → tooMany の順で返す", () => {
    const cur1 = makeFile("1.png", "image/png");
    const cur2 = makeFile("2.png", "image/png");
    const addOk1 = makeFile("3.png", "image/png");
    const addOk2 = makeFile("4.png", "image/png");
    const over = makeFile(
      "over.png",
      "image/png",
      MAX_BUG_REPORT_IMAGE_BYTES + 1,
    );
    const svg1 = makeFile("s1.svg", "image/svg+xml");
    const svg2 = makeFile("s2.svg", "image/svg+xml");

    const res = selectBugReportImages(
      [cur1, cur2],
      [addOk1, addOk2, over, svg1, svg2],
    );
    expect(res.next).toEqual([cur1, cur2, addOk1]);
    expect(res.errors).toEqual(["unsupportedType", "tooLarge", "tooMany"]);
  });

  it("引数の current / incoming 配列を破壊的に変更しない", () => {
    const cur = [makeFile("1.png", "image/png")];
    const inc = [makeFile("2.png", "image/png")];
    const curSnapshot = [...cur];
    const incSnapshot = [...inc];

    const res = selectBugReportImages(cur, inc);
    expect(cur).toEqual(curSnapshot);
    expect(inc).toEqual(incSnapshot);
    expect(res.next).not.toBe(cur);
  });
});
