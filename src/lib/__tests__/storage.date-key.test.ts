import { getTodayString, toJstDateKey } from "../storage";

describe("toJstDateKey", () => {
  it("JST の日付を返す", () => {
    // 2026-08-13 07:00 JST = 2026-08-12 22:00 UTC
    expect(toJstDateKey(new Date("2026-08-12T22:00:00Z"))).toBe("2026-08-13");
  });

  it("UTC の日付をそのまま返さない", () => {
    // ここが UTC のままだと、日本時間の 0〜9 時が前日になる
    expect(toJstDateKey(new Date("2026-08-12T22:00:00Z"))).not.toBe(
      "2026-08-12",
    );
  });

  it("JST の日付が変わる境目で切り替わる", () => {
    // 2026-08-12 23:59:59 JST
    expect(toJstDateKey(new Date("2026-08-12T14:59:59Z"))).toBe("2026-08-12");
    // 2026-08-13 00:00:00 JST
    expect(toJstDateKey(new Date("2026-08-12T15:00:00Z"))).toBe("2026-08-13");
  });

  it("月をまたぐ", () => {
    // 2026-09-01 00:30 JST = 2026-08-31 15:30 UTC
    expect(toJstDateKey(new Date("2026-08-31T15:30:00Z"))).toBe("2026-09-01");
  });

  it("実行環境のタイムゾーンに依存しない", () => {
    // 同じ瞬間なら、どの環境で動かしても同じ日付になる必要がある。
    // 端末ローカル基準にすると海外で日付がずれる。
    const instant = new Date("2026-08-12T22:00:00Z");
    expect(toJstDateKey(instant)).toBe("2026-08-13");
    expect(toJstDateKey(new Date(instant.getTime()))).toBe("2026-08-13");
  });
});

describe("getTodayString", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("日本時間の朝でも当日を返す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));
    expect(getTodayString()).toBe("2026-08-13");
  });

  it("日本時間の夜も当日を返す", () => {
    // 2026-08-12 20:00 JST = 2026-08-12 11:00 UTC
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T11:00:00Z"));
    expect(getTodayString()).toBe("2026-08-12");
  });
});
