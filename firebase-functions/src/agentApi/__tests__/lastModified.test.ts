/** @jest-environment node */
import { nextLastModified, readLastModified } from "../lastModified";

describe("readLastModified", () => {
  it("number はそのまま、Timestamp 風（toMillis を持つ）はミリ秒に変換する", () => {
    expect(readLastModified(123)).toBe(123);
    expect(readLastModified({ toMillis: () => 456 })).toBe(456);
  });

  it.each([undefined, null, "x", {}, { toMillis: 1 }])("%p は 0", (value) => {
    expect(readLastModified(value)).toBe(0);
  });
});

describe("nextLastModified", () => {
  it("現在時刻が既存値より新しければ現在時刻", () => {
    expect(nextLastModified(1000, 5000)).toBe(5000);
  });

  it("現在時刻が既存値以下（時計の巻き戻し・同値）なら既存値 + 1", () => {
    expect(nextLastModified(9000, 100)).toBe(9001);
    expect(nextLastModified(5000, 5000)).toBe(5001);
  });

  it("既存値が Timestamp 風でも単調増加を保つ", () => {
    expect(nextLastModified({ toMillis: () => 9000 }, 100)).toBe(9001);
  });

  it("既存値が未設定なら現在時刻（0 + 1 より大きいとき）", () => {
    expect(nextLastModified(undefined, 5000)).toBe(5000);
    expect(nextLastModified(undefined, 0)).toBe(1);
  });
});
