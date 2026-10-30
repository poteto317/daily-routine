import {
  formatJournalDate,
  formatUpdatedAt,
  getTodayDateString,
} from "../utils/journalDate";

describe("journalDate", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe("getTodayDateString", () => {
    it("月日を 2 桁に埋めた YYYY-MM-DD を返す", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-03-07T03:00:00+09:00"));

      expect(getTodayDateString()).toBe("2026-03-07");
    });

    it("月末と年末の境界をそのまま返す", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-12-31T23:59:59+09:00"));
      expect(getTodayDateString()).toBe("2026-12-31");

      jest.setSystemTime(new Date("2027-01-01T00:00:00+09:00"));
      expect(getTodayDateString()).toBe("2027-01-01");
    });

    it("うるう日を返す", () => {
      jest.useFakeTimers().setSystemTime(new Date("2028-02-29T12:00:00+09:00"));

      expect(getTodayDateString()).toBe("2028-02-29");
    });

    it("日本時間の 0 時台はローカル（Asia/Tokyo）の日付になる", () => {
      // ローカル時刻基準。UTC では前日の 2026-03-06 になる時刻
      jest.useFakeTimers().setSystemTime(new Date("2026-03-07T00:30:00+09:00"));

      expect(getTodayDateString()).toBe("2026-03-07");
    });
  });

  describe("formatJournalDate", () => {
    it("年月日と曜日を日本語で整形する", () => {
      expect(formatJournalDate("2026-03-07")).toBe("2026年3月7日(土)");
    });

    it("月末・年末・うるう日を整形する", () => {
      expect(formatJournalDate("2026-12-31")).toBe("2026年12月31日(木)");
      expect(formatJournalDate("2028-02-29")).toBe("2028年2月29日(火)");
    });
  });

  describe("formatUpdatedAt", () => {
    it("日時を ja-JP のロケール表記にする", () => {
      expect(formatUpdatedAt("2026-03-07T05:06:07+09:00")).toBe(
        "2026/3/7 5:06:07",
      );
    });

    it("年をまたぐ UTC の時刻をローカル（JST）に直す", () => {
      expect(formatUpdatedAt("2026-12-31T15:00:00Z")).toBe("2027/1/1 0:00:00");
    });
  });
});
