import { MAX_BUG_REPORT_IMAGE_BYTES } from "../constants";
import { encodeBugReportImages } from "../imageUpload";

const makeFile = (type: string, bytes: readonly number[] = [1, 2, 3]) =>
  new File([new Uint8Array(bytes)], "sample", { type });

describe("encodeBugReportImages", () => {
  it("encodes the bytes and preserves attachment order", async () => {
    await expect(
      encodeBugReportImages([
        makeFile("image/png"),
        makeFile("image/jpeg", [4, 5, 6]),
      ]),
    ).resolves.toEqual([
      { contentType: "image/png", base64: "AQID" },
      { contentType: "image/jpeg", base64: "BAUG" },
    ]);
  });

  it.each(
    [
      [makeFile("text/plain")],
      [makeFile("image/png", [])],
      [
        new File(
          [new Uint8Array(MAX_BUG_REPORT_IMAGE_BYTES + 1)],
          "large.png",
          { type: "image/png" },
        ),
      ],
      Array.from({ length: 4 }, () => makeFile("image/png")),
    ].map((files) => [files]),
  )("rejects invalid files before encoding", (files) => {
    expect(() => encodeBugReportImages(files)).toThrow();
  });
});
