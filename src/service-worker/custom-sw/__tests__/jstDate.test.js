import { diffFromJstScheduleMs, toJstDateKey, toJstDay } from "../jstDate";

describe("service worker の JST 日付", () => {
  it("JST の日付を返す", () => {
    // 2026-08-13 07:00 JST = 2026-08-12 22:00 UTC
    expect(toJstDateKey(new Date("2026-08-12T22:00:00Z"))).toBe("2026-08-13");
  });

  it("UTC の日付をそのまま返さない", () => {
    // 通知の重複防止キーに使うため、本体と同じ基準にする必要がある
    expect(toJstDateKey(new Date("2026-08-12T22:00:00Z"))).not.toBe(
      "2026-08-12",
    );
  });

  it("JST の曜日を返す", () => {
    expect(toJstDay(new Date("2026-08-12T22:00:00Z"))).toBe(4);
  });

  it("日付が変わる境目で切り替わる", () => {
    expect(toJstDateKey(new Date("2026-08-12T14:59:59Z"))).toBe("2026-08-12");
    expect(toJstDateKey(new Date("2026-08-12T15:00:00Z"))).toBe("2026-08-13");
    expect(toJstDay(new Date("2026-08-12T14:59:59Z"))).toBe(3);
    expect(toJstDay(new Date("2026-08-12T15:00:00Z"))).toBe(4);
  });

  it("日付と曜日が同じ日を指す", () => {
    // 片方だけ別基準だと、通知する曜日と重複防止キーが食い違う
    const instant = new Date("2026-08-12T22:00:00Z");
    expect(toJstDateKey(instant)).toBe("2026-08-13");
    expect(toJstDay(instant)).toBe(4);
  });
});

describe("diffFromJstScheduleMs", () => {
  /** JST の時刻を指す瞬間を作る */
  const jst = (time) => new Date(`2026-08-13T${time}:00+09:00`);

  it("時刻がちょうど一致すると 0 を返す", () => {
    expect(diffFromJstScheduleMs(jst("09:00"), "09:00")).toBe(0);
  });

  it("差をミリ秒で返す", () => {
    expect(diffFromJstScheduleMs(jst("09:01"), "09:00")).toBe(60 * 1000);
    expect(diffFromJstScheduleMs(jst("08:59"), "09:00")).toBe(60 * 1000);
  });

  it("minutesAfter を足した時刻と比べる", () => {
    expect(diffFromJstScheduleMs(jst("09:10"), "09:00", 10)).toBe(0);
    expect(diffFromJstScheduleMs(jst("09:00"), "09:00", 10)).toBe(
      10 * 60 * 1000,
    );
  });

  it("minutesAfter で日付をまたいでも近いほうの差を返す", () => {
    // 23:50 の 30 分後は翌日 00:20。ほぼ 24 時間差として扱ってはいけない
    expect(diffFromJstScheduleMs(jst("00:20"), "23:50", 30)).toBe(0);
  });

  it("秒まで見て差を出す", () => {
    // 呼び出し側は 90 秒を境に通知するか決めるため、分に丸めてはいけない
    expect(
      diffFromJstScheduleMs(new Date("2026-08-13T09:01:30+09:00"), "09:00"),
    ).toBe(90 * 1000);
  });

  it("0 時をまたぐ時刻どうしを近いほうで比べる", () => {
    // 23:59 と 00:01 の差は 2 分。23 時間 58 分ではない
    expect(diffFromJstScheduleMs(jst("00:01"), "23:59")).toBe(2 * 60 * 1000);
  });

  it("端末のタイムゾーンに依存しない", () => {
    // 同じ瞬間を別表記で渡しても同じ差になる
    expect(
      diffFromJstScheduleMs(new Date("2026-08-13T00:00:00Z"), "09:00"),
    ).toBe(0);
  });
});
