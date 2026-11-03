import type { JournalEntry } from "@/types/routine";
import {
  getChangedJournalDate,
  getJournalTodayCardHeadingDate,
  resolveJournalDateFieldValue,
} from "../journalFormDate";

const TODAY = "2026-03-15";

const pastEntry: JournalEntry = {
  id: "past",
  date: "2026-03-10",
  title: "過去",
  content: "本文",
  createdAt: "2026-03-10T10:00:00.000Z",
  updatedAt: "2026-03-10T10:00:00.000Z",
};

describe("resolveJournalDateFieldValue", () => {
  it("新規で未操作（null）なら今日", () => {
    expect(resolveJournalDateFieldValue(null, null, TODAY)).toBe(TODAY);
  });

  it("編集で未操作（null）なら編集前の日付（今日にしない）", () => {
    expect(resolveJournalDateFieldValue(null, pastEntry, TODAY)).toBe(
      pastEntry.date,
    );
  });

  it("入力があれば新規・編集どちらでもその値", () => {
    expect(resolveJournalDateFieldValue("2026-03-01", null, TODAY)).toBe(
      "2026-03-01",
    );
    expect(resolveJournalDateFieldValue("2026-03-01", pastEntry, TODAY)).toBe(
      "2026-03-01",
    );
  });

  it('空にした値（""）は既定値に戻さずそのまま返す', () => {
    expect(resolveJournalDateFieldValue("", null, TODAY)).toBe("");
    expect(resolveJournalDateFieldValue("", pastEntry, TODAY)).toBe("");
  });
});

describe("getJournalTodayCardHeadingDate", () => {
  it("新規追加のフォームを開いているときは日付欄の値", () => {
    expect(
      getJournalTodayCardHeadingDate({
        showForm: true,
        editingEntry: null,
        dateValue: "2026-03-01",
        today: TODAY,
      }),
    ).toBe("2026-03-01");
  });

  it("フォームを閉じているときは今日", () => {
    expect(
      getJournalTodayCardHeadingDate({
        showForm: false,
        editingEntry: null,
        dateValue: "2026-03-01",
        today: TODAY,
      }),
    ).toBe(TODAY);
  });

  it("編集中は日付欄を変えても今日", () => {
    expect(
      getJournalTodayCardHeadingDate({
        showForm: true,
        editingEntry: pastEntry,
        dateValue: "2026-03-01",
        today: TODAY,
      }),
    ).toBe(TODAY);
  });
});

describe("getChangedJournalDate", () => {
  it("未操作（null）なら変更なし", () => {
    expect(getChangedJournalDate(null, "2026-03-10")).toBeNull();
  });

  it("編集前と同じ日付なら変更なし", () => {
    expect(getChangedJournalDate("2026-03-10", "2026-03-10")).toBeNull();
  });

  it("違う日付なら変更先を返す", () => {
    expect(getChangedJournalDate("2026-03-01", "2026-03-10")).toBe(
      "2026-03-01",
    );
  });

  it('空にした値（""）も変更として返す（検証は呼び出し側）', () => {
    expect(getChangedJournalDate("", "2026-03-10")).toBe("");
  });
});
