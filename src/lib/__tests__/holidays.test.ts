import { isHoliday, isWeekday, isWeekend, getDateType } from "../holidays";

describe("holidays", () => {
  describe("isHoliday", () => {
    it("元日（1月1日）を祝日として認識", () => {
      const date = new Date("2024-01-01");
      expect(isHoliday(date)).toBe(true);
    });

    it("建国記念の日（2月11日）を祝日として認識", () => {
      const date = new Date("2024-02-11");
      expect(isHoliday(date)).toBe(true);
    });

    it("天皇誕生日（2月23日）を祝日として認識", () => {
      const date = new Date("2024-02-23");
      expect(isHoliday(date)).toBe(true);
    });

    it("昭和の日（4月29日）を祝日として認識", () => {
      const date = new Date("2024-04-29");
      expect(isHoliday(date)).toBe(true);
    });

    it("憲法記念日（5月3日）を祝日として認識", () => {
      const date = new Date("2024-05-03");
      expect(isHoliday(date)).toBe(true);
    });

    it("みどりの日（5月4日）を祝日として認識", () => {
      const date = new Date("2024-05-04");
      expect(isHoliday(date)).toBe(true);
    });

    it("こどもの日（5月5日）を祝日として認識", () => {
      const date = new Date("2024-05-05");
      expect(isHoliday(date)).toBe(true);
    });

    it("山の日（8月11日）を祝日として認識", () => {
      const date = new Date("2024-08-11");
      expect(isHoliday(date)).toBe(true);
    });

    it("文化の日（11月3日）を祝日として認識", () => {
      const date = new Date("2024-11-03");
      expect(isHoliday(date)).toBe(true);
    });

    it("勤労感謝の日（11月23日）を祝日として認識", () => {
      const date = new Date("2024-11-23");
      expect(isHoliday(date)).toBe(true);
    });

    it("通常の平日を祝日として認識しない", () => {
      const date = new Date("2024-01-10"); // 水曜日
      expect(isHoliday(date)).toBe(false);
    });

    it("春分の日を祝日として認識", () => {
      const date = new Date("2024-03-20T00:00:00");
      expect(isHoliday(date)).toBe(true);
    });

    it("秋分の日を祝日として認識", () => {
      const date = new Date("2024-09-22T00:00:00");
      expect(isHoliday(date)).toBe(true);
    });

    it("成人の日（ハッピーマンデー）を祝日として認識", () => {
      const date = new Date("2024-01-08T00:00:00"); // 1月第2月曜日
      expect(isHoliday(date)).toBe(true);
    });

    it("振替休日（祝日が日曜日の場合の翌月曜日）を祝日として認識", () => {
      // 2024年2月11日（日）建国記念の日 -> 2月12日（月）振替休日
      const date = new Date("2024-02-12T00:00:00");
      expect(isHoliday(date)).toBe(true);
    });
  });

  describe("isWeekday", () => {
    it("平日は true を返す", () => {
      const date = new Date("2024-01-10T00:00:00"); // 水曜日
      expect(isWeekday(date)).toBe(true);
    });

    it("祝日の平日は false を返す", () => {
      const date = new Date("2024-01-01T00:00:00"); // 月曜日・元日
      expect(isWeekday(date)).toBe(false);
    });

    it("土日は false を返す", () => {
      expect(isWeekday(new Date("2024-01-06T00:00:00"))).toBe(false); // 土曜日
      expect(isWeekday(new Date("2024-01-07T00:00:00"))).toBe(false); // 日曜日
    });
  });

  describe("isWeekend", () => {
    it("土日は true を返す", () => {
      expect(isWeekend(new Date("2024-01-06T00:00:00"))).toBe(true); // 土曜日
      expect(isWeekend(new Date("2024-01-07T00:00:00"))).toBe(true); // 日曜日
    });

    it("平日は false を返す", () => {
      expect(isWeekend(new Date("2024-01-10T00:00:00"))).toBe(false);
    });
  });

  describe("getDateType", () => {
    it("祝日なら holiday を返す", () => {
      expect(getDateType(new Date("2024-01-01T00:00:00"))).toBe("holiday");
    });

    it("土日なら weekend を返す", () => {
      expect(getDateType(new Date("2024-01-06T00:00:00"))).toBe("weekend");
    });

    it("平日なら weekday を返す", () => {
      expect(getDateType(new Date("2024-01-10T00:00:00"))).toBe("weekday");
    });
  });
});
