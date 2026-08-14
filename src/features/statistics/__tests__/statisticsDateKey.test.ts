import { formatDate } from "../statistics/helpers";

describe("formatDate", () => {
  it("JST の日付を返す", () => {
    expect(formatDate(new Date("2026-08-12T22:00:00Z"))).toBe("2026-08-13");
  });

  it("期間指定で使う UTC 深夜の日付はそのまま扱える", () => {
    // 期間は "YYYY-MM-DD" 文字列から new Date(...) で作られ、UTC 深夜になる。
    // JST 基準にしても同じ日付を指すことを固定する。
    expect(formatDate(new Date("2026-08-13"))).toBe("2026-08-13");
  });
});
