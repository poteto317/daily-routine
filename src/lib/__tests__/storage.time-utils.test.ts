import {
  getCurrentTime,
  getTodayString,
  isTimePassed,
  minutesToTime,
  timeToMinutes,
} from "../storage";

describe("storage time utilities", () => {
  it("getTodayStringはYYYY-MM-DD形式で返す", () => {
    expect(getTodayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("getCurrentTimeはHH:mm形式で返す", () => {
    expect(getCurrentTime()).toMatch(/^\d{2}:\d{2}$/);
  });

  it("timeToMinutes/minutesToTimeを相互変換できる", () => {
    expect(timeToMinutes("09:00")).toBe(540);
    expect(timeToMinutes("23:59")).toBe(1439);
    expect(minutesToTime(540)).toBe("09:00");
    expect(minutesToTime(1439)).toBe("23:59");
  });

  it("isTimePassedはminutesAfterを考慮して判定する", () => {
    jest.useFakeTimers();
    // タイムゾーン指定の無い文字列は端末ローカルとして解釈される。
    // JST の 11:15 を指す瞬間を UTC で明示する
    jest.setSystemTime(new Date("2024-01-01T02:15:00Z"));

    expect(isTimePassed("11:00", 10)).toBe(true);
    expect(isTimePassed("11:00", 20)).toBe(false);

    jest.useRealTimers();
  });
});

describe("JST 基準の時刻", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("getCurrentTime は JST の時刻を返す", () => {
    // 2026-08-13 07:00 JST = 2026-08-12 22:00 UTC
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    expect(getCurrentTime()).toBe("07:00");
  });

  it("isTimePassed は JST の時刻で判定する", () => {
    // JST 07:00。06:00 は過ぎていて 08:00 はまだ
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    expect(isTimePassed("06:00")).toBe(true);
    expect(isTimePassed("08:00")).toBe(false);
  });

  it("isTimePassed は minutesAfter を足して判定する", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    expect(isTimePassed("06:30", 30)).toBe(true);
    expect(isTimePassed("06:30", 40)).toBe(false);
  });

  it("isTimePassed はちょうどの時刻を過ぎたものとして扱う", () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T22:00:00Z"));

    expect(isTimePassed("07:00")).toBe(true);
  });

  it("isTimePassed は minutesAfter で翌日にずれる時刻を過ぎたと判定しない", () => {
    // JST 23:50。23:40 + 30 分は翌日 00:10 なのでまだ過ぎていない
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T14:50:00Z"));

    expect(isTimePassed("23:40", 30)).toBe(false);
  });

  it("isTimePassed は日付をまたぐと前日の時刻を過ぎたと判定しない", () => {
    // JST 00:30。同じ日の 23:00 はまだ来ていない
    jest.useFakeTimers().setSystemTime(new Date("2026-08-12T15:30:00Z"));

    expect(isTimePassed("23:00")).toBe(false);
    expect(isTimePassed("00:10")).toBe(true);
  });
});
