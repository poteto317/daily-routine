import {
  getJstToday,
  getTodayString,
  toJstDateKey,
  toJstDay,
  toJstTime,
} from "../storage";

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

describe("toJstDay", () => {
  it("JST の曜日を返す", () => {
    // 2026-08-13(木) 07:00 JST = 2026-08-12(水) 22:00 UTC
    expect(toJstDay(new Date("2026-08-12T22:00:00Z"))).toBe(4);
  });

  it("UTC の曜日をそのまま返さない", () => {
    // ここが UTC のままだと、日本時間の 0〜9 時が前日の曜日になる
    expect(toJstDay(new Date("2026-08-12T22:00:00Z"))).not.toBe(3);
  });

  it("日付が変わる境目で切り替わる", () => {
    expect(toJstDay(new Date("2026-08-12T14:59:59Z"))).toBe(3);
    expect(toJstDay(new Date("2026-08-12T15:00:00Z"))).toBe(4);
  });

  it("日付キーと同じ日を指す", () => {
    // 曜日だけ別基準だと、表示する曜日と記録する日付が食い違う
    const instant = new Date("2026-08-12T22:00:00Z");
    expect(toJstDateKey(instant)).toBe("2026-08-13");
    expect(toJstDay(instant)).toBe(4);
  });
});

describe("toJstTime", () => {
  it("JST の時刻を返す", () => {
    expect(toJstTime(new Date("2026-08-12T22:00:00Z"))).toBe("07:00");
  });

  it("0 埋めする", () => {
    expect(toJstTime(new Date("2026-08-12T15:05:00Z"))).toBe("00:05");
  });

  it("日付をまたいでも時刻だけを返す", () => {
    expect(toJstTime(new Date("2026-08-12T14:59:00Z"))).toBe("23:59");
  });
});

describe("getJstToday", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("JST の今日と同じ日付を指す", () => {
    // 祝日判定は Date を受け取るため、JST の日付から組み立て直す必要がある
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    const today = getJstToday();
    expect(today.getFullYear()).toBe(2026);
    expect(today.getMonth()).toBe(7);
    expect(today.getDate()).toBe(13);
  });

  it("組み立てた日付の曜日が JST の曜日と一致する", () => {
    // 素の getDay() を使う関数へ渡すため、ここが一致していないと意味がない
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    expect(getJstToday().getDay()).toBe(4);
  });

  it("日付キーと同じ日を指す", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    const today = getJstToday();
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(key).toBe(getTodayString());
  });
});
