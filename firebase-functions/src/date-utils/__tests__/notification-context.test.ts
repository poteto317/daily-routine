/** @jest-environment node */
import { getDayOfWeek } from "../day-of-week";
import { getCurrentNotificationContext } from "../notification-context";

// npm test は TZ=Asia/Tokyo で実行されるため、時・分・曜日は JST で評価される
describe("getCurrentNotificationContext", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("現在時刻の時・分・曜日と日付を返す", () => {
    jest.useFakeTimers({ now: new Date("2026-10-30T12:34:00+09:00") });

    expect(getCurrentNotificationContext()).toEqual({
      currentHour: 12,
      currentMinute: 34,
      currentDayOfWeek: 5,
      isHoliday: false,
      todayStr: "2026-10-30",
    });
  });

  it("祝日なら isHoliday が true", () => {
    jest.useFakeTimers({ now: new Date("2026-11-03T10:00:00+09:00") });

    expect(getCurrentNotificationContext().isHoliday).toBe(true);
  });

  it("todayStr は UTC の日付になる（JST の午前 9 時前は前日）", () => {
    jest.useFakeTimers({ now: new Date("2026-10-30T08:59:00+09:00") });

    const context = getCurrentNotificationContext();
    expect(context.currentHour).toBe(8);
    expect(context.todayStr).toBe("2026-10-29");
  });
});

describe("getDayOfWeek", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("現在の曜日を 0（日）〜 6（土）で返す", () => {
    jest.useFakeTimers({ now: new Date("2026-11-01T12:00:00+09:00") });
    expect(getDayOfWeek()).toBe(0);

    jest.setSystemTime(new Date("2026-11-07T12:00:00+09:00"));
    expect(getDayOfWeek()).toBe(6);
  });
});
