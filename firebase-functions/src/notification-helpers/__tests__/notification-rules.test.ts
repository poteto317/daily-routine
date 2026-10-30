/** @jest-environment node */
import { HOLIDAY_DAY_VALUE } from "../../constants";
import type { Routine } from "../../types";
import { getMigratedDaysOfWeek } from "../day-migration";
import { shouldNotifyRoutine } from "../notification-filter";
import { createNotificationId } from "../notification-id";
import {
  calculateNotificationTime,
  isNotificationTimeNow,
} from "../notification-time";
import { extractUserNotificationData } from "../user-data-extractor";

const makeRoutine = (overrides: Partial<Routine> = {}): Routine => ({
  id: "routine-1",
  title: "朝の運動",
  startTime: "09:00",
  daysOfWeek: [1, 2, 3, 4, 5],
  isActive: true,
  ...overrides,
});

describe("getMigratedDaysOfWeek", () => {
  it("holidayMode が無ければ daysOfWeek をそのまま返す", () => {
    const routine = makeRoutine();
    expect(getMigratedDaysOfWeek(routine)).toBe(routine.daysOfWeek);
  });

  it("daysOfWeek に祝日が含まれていれば holidayMode を無視する", () => {
    const routine = makeRoutine({
      daysOfWeek: [1, HOLIDAY_DAY_VALUE],
      holidayMode: "only",
    });
    expect(getMigratedDaysOfWeek(routine)).toEqual([1, HOLIDAY_DAY_VALUE]);
  });

  it("holidayMode が only なら祝日だけにする", () => {
    const routine = makeRoutine({ holidayMode: "only" });
    expect(getMigratedDaysOfWeek(routine)).toEqual([HOLIDAY_DAY_VALUE]);
  });

  it("holidayMode が include なら祝日を追加し、元の配列は変更しない", () => {
    const routine = makeRoutine({ daysOfWeek: [1, 2], holidayMode: "include" });
    expect(getMigratedDaysOfWeek(routine)).toEqual([1, 2, HOLIDAY_DAY_VALUE]);
    expect(routine.daysOfWeek).toEqual([1, 2]);
  });

  it.each(["normal", "exclude"] as const)(
    "holidayMode が %s なら daysOfWeek をそのまま返す",
    (holidayMode) => {
      const routine = makeRoutine({ daysOfWeek: [0, 6], holidayMode });
      expect(getMigratedDaysOfWeek(routine)).toEqual([0, 6]);
    },
  );
});

describe("shouldNotifyRoutine", () => {
  it("平日は daysOfWeek に今日の曜日があれば通知する", () => {
    const routine = makeRoutine({ daysOfWeek: [1, 3] });
    expect(shouldNotifyRoutine(routine, 1, false)).toBe(true);
    expect(shouldNotifyRoutine(routine, 2, false)).toBe(false);
  });

  it("祝日は曜日が一致しても、祝日指定が無ければ通知しない", () => {
    const routine = makeRoutine({ daysOfWeek: [1] });
    expect(shouldNotifyRoutine(routine, 1, true)).toBe(false);
  });

  it("祝日指定があれば曜日に関係なく祝日に通知する", () => {
    const routine = makeRoutine({ daysOfWeek: [HOLIDAY_DAY_VALUE] });
    expect(shouldNotifyRoutine(routine, 3, true)).toBe(true);
    expect(shouldNotifyRoutine(routine, 3, false)).toBe(false);
  });

  it("旧 holidayMode: include のルーティンは祝日にも通知する", () => {
    const routine = makeRoutine({ daysOfWeek: [1], holidayMode: "include" });
    expect(shouldNotifyRoutine(routine, 1, true)).toBe(true);
    expect(shouldNotifyRoutine(routine, 1, false)).toBe(true);
  });
});

describe("calculateNotificationTime", () => {
  it("notificationMinutes が無ければ開始時刻のまま", () => {
    expect(
      calculateNotificationTime(makeRoutine({ startTime: "07:05" })),
    ).toEqual({ hour: 7, minute: 5 });
  });

  // notificationMinutes は「開始の何分後に通知するか」を表す 0 以上の整数
  it("notificationMinutes を開始時刻に加算する", () => {
    expect(
      calculateNotificationTime(
        makeRoutine({ startTime: "09:50", notificationMinutes: 15 }),
      ),
    ).toEqual({ hour: 10, minute: 5 });
  });

  it("日付をまたぐ場合は 24 時で折り返す", () => {
    expect(
      calculateNotificationTime(
        makeRoutine({ startTime: "23:50", notificationMinutes: 20 }),
      ),
    ).toEqual({ hour: 0, minute: 10 });
  });

  it("notificationMinutes が 0 なら開始時刻のまま", () => {
    expect(
      calculateNotificationTime(
        makeRoutine({ startTime: "00:00", notificationMinutes: 0 }),
      ),
    ).toEqual({ hour: 0, minute: 0 });
  });
});

describe("isNotificationTimeNow", () => {
  const routine = makeRoutine({ startTime: "23:55", notificationMinutes: 10 });

  it("時・分の両方が通知時刻と一致すれば true", () => {
    expect(isNotificationTimeNow(routine, 0, 5)).toBe(true);
  });

  it("時か分のどちらかがずれていれば false", () => {
    expect(isNotificationTimeNow(routine, 0, 4)).toBe(false);
    expect(isNotificationTimeNow(routine, 0, 6)).toBe(false);
    expect(isNotificationTimeNow(routine, 23, 5)).toBe(false);
    expect(isNotificationTimeNow(routine, 23, 55)).toBe(false);
  });
});

describe("createNotificationId", () => {
  it("トークン・ルーティン ID・日付をアンダースコアでつなぐ", () => {
    expect(createNotificationId("tok", "r1", "2026-10-30")).toBe(
      "tok_r1_2026-10-30",
    );
  });
});

describe("extractUserNotificationData", () => {
  it("トークンとルーティンがあれば両方を返す", () => {
    const routines = [makeRoutine()];
    expect(extractUserNotificationData({ fcmToken: "tok", routines })).toEqual({
      fcmToken: "tok",
      routines,
    });
  });

  it("トークンが無ければ null", () => {
    expect(
      extractUserNotificationData({ routines: [makeRoutine()] }),
    ).toBeNull();
    expect(
      extractUserNotificationData({ fcmToken: "", routines: [makeRoutine()] }),
    ).toBeNull();
  });

  it("ルーティンが無い・空なら null", () => {
    expect(extractUserNotificationData({ fcmToken: "tok" })).toBeNull();
    expect(
      extractUserNotificationData({ fcmToken: "tok", routines: [] }),
    ).toBeNull();
  });
});
