import {
  buildDateString,
  getDaysInMonth,
  getFirstDayOfMonth,
  shiftMonth,
  toMonthDate,
} from "../utils/calendarDate";

describe("calendarDate", () => {
  describe("toMonthDate", () => {
    it("月（1 始まり）の 1 日を返す", () => {
      const date = toMonthDate(2026, 1);
      expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
        2026, 0, 1,
      ]);
    });

    it("12 月を返す", () => {
      const date = toMonthDate(2026, 12);
      expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
        2026, 11, 1,
      ]);
    });
  });

  describe("getDaysInMonth", () => {
    it("各月の日数を返す", () => {
      expect(getDaysInMonth(2026, 1)).toBe(31);
      expect(getDaysInMonth(2026, 4)).toBe(30);
      expect(getDaysInMonth(2026, 12)).toBe(31);
    });

    it("うるう年の 2 月は 29 日、平年は 28 日", () => {
      expect(getDaysInMonth(2028, 2)).toBe(29);
      expect(getDaysInMonth(2026, 2)).toBe(28);
    });

    it("100 の倍数の年は平年、400 の倍数の年はうるう年", () => {
      expect(getDaysInMonth(2100, 2)).toBe(28);
      expect(getDaysInMonth(2000, 2)).toBe(29);
    });
  });

  describe("getFirstDayOfMonth", () => {
    it("1 日の曜日を返す（日曜 0）", () => {
      expect(getFirstDayOfMonth(2026, 3)).toBe(0); // 2026-03-01 は日曜
      expect(getFirstDayOfMonth(2026, 1)).toBe(4); // 2026-01-01 は木曜
      expect(getFirstDayOfMonth(2026, 8)).toBe(6); // 2026-08-01 は土曜
    });
  });

  describe("buildDateString", () => {
    it("月日を 2 桁に埋める", () => {
      expect(buildDateString(2026, 1, 5)).toBe("2026-01-05");
    });

    it("2 桁の月日はそのまま", () => {
      expect(buildDateString(2026, 12, 31)).toBe("2026-12-31");
    });
  });

  describe("shiftMonth", () => {
    const ymd = (d: Date) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

    it("オフセット 0 は同じ月の 1 日", () => {
      expect(ymd(shiftMonth(2026, 5, 0))).toEqual([2026, 5, 1]);
    });

    it("12 月の翌月は翌年 1 月", () => {
      expect(ymd(shiftMonth(2026, 12, 1))).toEqual([2027, 1, 1]);
    });

    it("1 月の前月は前年 12 月", () => {
      expect(ymd(shiftMonth(2026, 1, -1))).toEqual([2025, 12, 1]);
    });

    it("12 か月以上のシフトで年を繰り上げ・繰り下げる", () => {
      expect(ymd(shiftMonth(2026, 3, 14))).toEqual([2027, 5, 1]);
      expect(ymd(shiftMonth(2026, 3, -15))).toEqual([2024, 12, 1]);
    });

    it("うるう年の 2 月に入る", () => {
      expect(ymd(shiftMonth(2028, 1, 1))).toEqual([2028, 2, 1]);
    });
  });
});
