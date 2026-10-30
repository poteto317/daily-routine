import { HOLIDAY_DAY_VALUE } from "@/types/routine";
import { migrateRoutineRecord } from "../storageMigration";

type LegacyInput = Parameters<typeof migrateRoutineRecord>[0];

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKEND = [0, 6];

/** 旧形式の項目を含められる、最小限の保存データ */
const legacy = (overrides: Record<string, unknown> = {}): LegacyInput =>
  ({ id: "r1", title: "朝の運動", ...overrides }) as LegacyInput;

const daysOf = (overrides: Record<string, unknown>) =>
  migrateRoutineRecord(legacy(overrides)).daysOfWeek;

describe("migrateRoutineRecord", () => {
  describe("曜日の決め方", () => {
    it("daysOfWeek があれば sets より優先する", () => {
      expect(daysOf({ daysOfWeek: [3], sets: ["weekend"] })).toEqual([3]);
    });

    it("空の daysOfWeek も保存された値として残す", () => {
      expect(daysOf({ daysOfWeek: [] })).toEqual([]);
    });

    it.each([
      ["weekday", WEEKDAYS],
      ["weekend", WEEKEND],
    ])("daysOfWeek が無く sets に %s があればその曜日にする", (set, days) => {
      expect(daysOf({ sets: [set] })).toEqual(days);
    });

    it("weekday と weekend の両方があれば weekday を優先する", () => {
      expect(daysOf({ sets: ["weekend", "weekday"] })).toEqual(WEEKDAYS);
    });

    it("daysOfWeek も sets も無ければ毎日にする", () => {
      expect(daysOf({})).toEqual(ALL_DAYS);
    });
  });

  describe("祝日の扱い（旧フィールドの読み替え）", () => {
    it("holidayMode: only は祝日だけにする", () => {
      expect(daysOf({ daysOfWeek: WEEKDAYS, holidayMode: "only" })).toEqual([
        HOLIDAY_DAY_VALUE,
      ]);
    });

    it("holidayMode: include は祝日を足す（既にあれば重複させない）", () => {
      expect(daysOf({ daysOfWeek: [1], holidayMode: "include" })).toEqual([
        1,
        HOLIDAY_DAY_VALUE,
      ]);
      expect(
        daysOf({ daysOfWeek: [1, HOLIDAY_DAY_VALUE], holidayMode: "include" }),
      ).toEqual([1, HOLIDAY_DAY_VALUE]);
    });

    it("holidayMode が normal / exclude なら曜日を変えず、他の旧フィールドも見ない", () => {
      expect(
        daysOf({
          daysOfWeek: [1],
          holidayMode: "exclude",
          showOnHoliday: true,
        }),
      ).toEqual([1]);
      expect(
        daysOf({ daysOfWeek: [1], holidayMode: "normal", sets: ["holiday"] }),
      ).toEqual([1]);
    });

    it("isHolidayPriority は祝日だけにする", () => {
      expect(daysOf({ daysOfWeek: [1], isHolidayPriority: true })).toEqual([
        HOLIDAY_DAY_VALUE,
      ]);
    });

    it("showOnHoliday は祝日を足す", () => {
      expect(daysOf({ daysOfWeek: [1], showOnHoliday: true })).toEqual([
        1,
        HOLIDAY_DAY_VALUE,
      ]);
    });

    it("isHolidayPriority は showOnHoliday より優先する", () => {
      expect(
        daysOf({
          daysOfWeek: [1],
          isHolidayPriority: true,
          showOnHoliday: true,
        }),
      ).toEqual([HOLIDAY_DAY_VALUE]);
    });

    it("holidayBehavior: only は祝日だけにする", () => {
      expect(daysOf({ daysOfWeek: [1], holidayBehavior: "only" })).toEqual([
        HOLIDAY_DAY_VALUE,
      ]);
    });

    it("holidayBehavior: show と sets の holiday は祝日を足す", () => {
      expect(daysOf({ daysOfWeek: [1], holidayBehavior: "show" })).toEqual([
        1,
        HOLIDAY_DAY_VALUE,
      ]);
      expect(daysOf({ sets: ["weekday", "holiday"] })).toEqual([
        ...WEEKDAYS,
        HOLIDAY_DAY_VALUE,
      ]);
    });

    it("祝日を足す読み替えでも、既に祝日があれば重複させない", () => {
      const withHoliday = [1, HOLIDAY_DAY_VALUE];
      expect(daysOf({ daysOfWeek: withHoliday, showOnHoliday: true })).toEqual(
        withHoliday,
      );
      expect(
        daysOf({ daysOfWeek: withHoliday, holidayBehavior: "show" }),
      ).toEqual(withHoliday);
    });

    it("holidayBehavior が hide などの値なら曜日を変えない", () => {
      expect(daysOf({ daysOfWeek: [1], holidayBehavior: "hide" })).toEqual([1]);
    });
  });

  describe("既定値と旧フィールドの削除", () => {
    it("category が無ければ other、sortOrder が無ければ 0 にする", () => {
      const migrated = migrateRoutineRecord(legacy());
      expect(migrated.category).toBe("other");
      expect(migrated.sortOrder).toBe(0);
    });

    it("保存済みの category と sortOrder は保つ", () => {
      expect(
        migrateRoutineRecord(legacy({ category: "work", sortOrder: 3 })),
      ).toMatchObject({ category: "work", sortOrder: 3 });
    });

    it("旧フィールドを取り除き、それ以外の項目は保つ", () => {
      const migrated = migrateRoutineRecord(
        legacy({
          startTime: "07:00",
          notificationMinutes: 5,
          sets: ["weekday"],
          holidayBehavior: "show",
          showOnHoliday: true,
          isHolidayPriority: false,
          holidayMode: "include",
        }),
      );

      expect(migrated).toEqual({
        id: "r1",
        title: "朝の運動",
        startTime: "07:00",
        notificationMinutes: 5,
        category: "other",
        daysOfWeek: [...WEEKDAYS, HOLIDAY_DAY_VALUE],
        sortOrder: 0,
      });
    });

    it("元の保存データは書き換えない", () => {
      const days = [1];
      const input = legacy({ daysOfWeek: days, holidayMode: "include" });

      migrateRoutineRecord(input);

      expect(days).toEqual([1]);
      expect(input).toHaveProperty("holidayMode", "include");
    });
  });
});
