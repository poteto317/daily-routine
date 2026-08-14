import { findShiftedDateKey } from "../dateKeyShift";

describe("findShiftedDateKey", () => {
  it("UTC 基準で保存された記録の正しい日付を返す", () => {
    // 2026-08-13 07:00 JST に作られたが、UTC 日付の 2026-08-12 で保存された
    expect(findShiftedDateKey("2026-08-12", "2026-08-12T22:00:00Z")).toBe(
      "2026-08-13",
    );
  });

  it("夜に作られた記録は対象外", () => {
    // 2026-08-12 20:00 JST。UTC 日付と JST 日付が同じなのでずれていない
    expect(findShiftedDateKey("2026-08-12", "2026-08-12T11:00:00Z")).toBeNull();
  });

  it("date が createdAt のどちらの日付とも一致しない記録は対象外", () => {
    // 手で日付を入れ替えた可能性がある。触らない
    expect(findShiftedDateKey("2026-01-01", "2026-08-12T22:00:00Z")).toBeNull();
  });

  it("date が既に JST 日付なら対象外", () => {
    expect(findShiftedDateKey("2026-08-13", "2026-08-12T22:00:00Z")).toBeNull();
  });

  it("createdAt が無い記録は対象外", () => {
    expect(findShiftedDateKey("2026-08-12", undefined)).toBeNull();
    expect(findShiftedDateKey("2026-08-12", "")).toBeNull();
  });

  it("createdAt が日付として読めない記録は対象外", () => {
    expect(findShiftedDateKey("2026-08-12", "not-a-date")).toBeNull();
  });
});
