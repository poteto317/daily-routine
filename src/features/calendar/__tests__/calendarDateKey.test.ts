import { toDateString } from "../utils/calendarDate";

describe("toDateString", () => {
  it("JST の日付を返す", () => {
    // 2026-08-13 07:00 JST = 2026-08-12 22:00 UTC
    expect(toDateString(new Date("2026-08-12T22:00:00Z"))).toBe("2026-08-13");
  });

  it("UTC の日付をそのまま返さない", () => {
    // UTC 基準だと日本時間の 0〜9 時が前日になり、
    // カレンダーの「今日」が前日のセルに付く
    expect(toDateString(new Date("2026-08-12T22:00:00Z"))).not.toBe(
      "2026-08-12",
    );
  });

  it("JST の日付が変わる境目で切り替わる", () => {
    expect(toDateString(new Date("2026-08-12T14:59:59Z"))).toBe("2026-08-12");
    expect(toDateString(new Date("2026-08-12T15:00:00Z"))).toBe("2026-08-13");
  });
});
