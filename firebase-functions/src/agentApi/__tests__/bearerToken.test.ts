/** @jest-environment node */
import { extractBearerToken } from "../bearerToken";

describe("extractBearerToken", () => {
  it("Bearer トークンを取り出す", () => {
    expect(extractBearerToken("Bearer abc")).toBe("abc");
  });

  it.each(["bearer abc", "BEARER abc", "BeArEr abc"])(
    "スキーム名は大文字小文字を区別しない: %p",
    (header) => {
      expect(extractBearerToken(header)).toBe("abc");
    },
  );

  it.each([
    undefined,
    "",
    "Basic abc",
    "Bearer",
    "Bearer ",
    "bearer abc x",
    "Bearer  abc",
    "Bearer abc ",
    " Bearer abc",
    "Bearer a b",
  ])("%p は null（厳密な形式のみ受け付ける）", (header) => {
    expect(extractBearerToken(header)).toBeNull();
  });
});
