import journalTexts from "../locales/ja.json";
import {
  formatJournalDate,
  formatUpdatedAt,
  getJournalDateError,
  getTodayDateString,
  isValidJournalDate,
  JOURNAL_MIN_DATE,
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

  describe("isValidJournalDate", () => {
    it.each(["2026-03-07", "2028-02-29", "0050-01-01", "2099-12-31"])(
      "形式どおりで実在する日付（%s）は true（未来の日付も true）",
      (date) => {
        expect(isValidJournalDate(date)).toBe(true);
      },
    );

    it.each([
      "",
      "2026-3-7",
      "2026/03/07",
      "123456-01-01",
      "2026-02-30",
      "2026-04-31",
      "2026-02-29",
    ])("空・形式違い・実在しない日付（%s）は false", (date) => {
      expect(isValidJournalDate(date)).toBe(false);
    });
  });

  describe("getJournalDateError", () => {
    const today = "2026-03-07";

    it("今日と過去の日付は null", () => {
      expect(getJournalDateError("2026-03-07", today)).toBeNull();
      expect(getJournalDateError("2026-03-06", today)).toBeNull();
      expect(getJournalDateError("2028-02-29", "2028-03-01")).toBeNull();
    });

    it("下限は 1900-01-01", () => {
      expect(JOURNAL_MIN_DATE).toBe("1900-01-01");
    });

    it("不正な日付の文言が、下限の定数と同じ日付を示している（定数だけ変えて文言が古くならない）", () => {
      const [year, month, day] = JOURNAL_MIN_DATE.split("-").map(Number);
      expect(journalTexts.page.alertInvalidDate).toContain(
        `${year}年${month}月${day}日`,
      );
    });

    it.each(["1900-01-01", "2000-01-01"])(
      "下限（1900-01-01）以降の日付（%s）は null",
      (date) => {
        expect(getJournalDateError(date, today)).toBeNull();
      },
    );

    it.each([
      "0202-11-03",
      "1899-12-31",
      "0050-01-01",
      "0002-11-03",
      // 西暦 0 年は実在の判定（API の isRealDate と同じ）では実在する日付として扱う
      "0000-01-01",
    ])(
      "下限より前の日付（%s）は too-old（Chrome で年を打ちかけた値など）",
      (date) => {
        expect(getJournalDateError(date, today)).toBe("too-old");
      },
    );

    it.each(["0000-02-30", "0050-02-30", "1899-02-29"])(
      "下限より前でも実在しない日付（%s）は not-real のまま（実在の判定が先）",
      (date) => {
        expect(getJournalDateError(date, today)).toBe("not-real");
      },
    );

    it.each(["", "2026-3-7", "2026/03/07", "123456-01-01"])(
      "空・形式違い（%s）は invalid-format",
      (date) => {
        expect(getJournalDateError(date, today)).toBe("invalid-format");
      },
    );

    it.each(["2026-02-30", "2026-04-31", "2026-02-29"])(
      "実在しない日付（%s）は not-real",
      (date) => {
        expect(getJournalDateError(date, today)).toBe("not-real");
      },
    );

    it("今日より後は future", () => {
      expect(getJournalDateError("2026-03-08", today)).toBe("future");
      expect(getJournalDateError("2027-01-01", today)).toBe("future");
    });

    it("下限の判定を足しても、今日より後は future のまま", () => {
      expect(getJournalDateError("2099-12-31", today)).toBe("future");
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

    it.each(["", "123456-01-01", "2026-02-30", "abc"])(
      "不正な入力（%s）は例外を投げず、入力をそのまま返す",
      (input) => {
        expect(formatJournalDate(input)).toBe(input);
      },
    );
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
