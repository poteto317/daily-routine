import type { JournalEntry } from "@/types/routine";
import {
  createJournalPageData,
  deleteJournalEntryAndReload,
  getRecentJournalEntries,
  resetJournalFormInputs,
  saveJournalEntryAndReload,
} from "../pageStateActions";

describe("journal pageStateActions", () => {
  const entryA: JournalEntry = {
    id: "a",
    date: "2024-01-10",
    title: "A",
    content: "alpha",
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
  };
  const entryB: JournalEntry = {
    id: "b",
    date: "2024-01-12",
    title: "B",
    content: "beta",
    createdAt: "2024-01-12T00:00:00.000Z",
    updatedAt: "2024-01-12T00:00:00.000Z",
  };

  it("recent entries を新しい日付順で返す", () => {
    const entries = getRecentJournalEntries({
      [entryA.date]: [entryA],
      [entryB.date]: [entryB],
    });

    expect(entries).toEqual([entryB, entryA]);
  });

  it("today entry から page data を生成する", () => {
    const data = createJournalPageData(entryA, { [entryA.date]: [entryA] });

    expect(data).toEqual({
      todayEntry: entryA,
      titleInput: "",
      contentInput: "",
      dateInput: null,
      recentEntries: [entryA],
    });
  });

  it("cancel 時のフォーム入力を空に戻す", () => {
    expect(resetJournalFormInputs()).toEqual({
      titleInput: "",
      contentInput: "",
      dateInput: null,
    });
  });

  it("同じ日付の recent entries は更新日時の新しい順で返す", () => {
    const older = {
      ...entryA,
      id: "older",
      updatedAt: "2024-01-10T09:00:00.000Z",
    };
    const newer = {
      ...entryA,
      id: "newer",
      updatedAt: "2024-01-10T12:00:00.000Z",
    };

    const entries = getRecentJournalEntries({
      [entryA.date]: [older, newer],
    });

    expect(entries).toEqual([newer, older]);
  });

  it("空入力なら保存せず alert する", () => {
    const alertFn = jest.fn();
    const saveEntry = jest.fn();

    const result = saveJournalEntryAndReload({
      today: "2024-01-12",
      date: "2024-01-12",
      titleInput: "  ",
      contentInput: "  ",
      defaultTitle: "無題",
      alertMessage: "内容を入力してください",
      dateAlertMessages: {
        invalid: "日付を正しく入力してください",
        future: "未来の日付は保存できません",
      },
      saveEntry,
      reloadData: jest.fn(),
      closeForm: jest.fn(),
      alertFn,
    });

    expect(result).toBe(false);
    expect(alertFn).toHaveBeenCalledWith("内容を入力してください");
    expect(saveEntry).not.toHaveBeenCalled();
  });

  it("入力があれば保存して再読込しフォームを閉じる", () => {
    const saveEntry = jest.fn();
    const reloadData = jest.fn();
    const closeForm = jest.fn();

    const result = saveJournalEntryAndReload({
      today: "2024-01-12",
      date: "2024-01-12",
      titleInput: "  ",
      contentInput: " memo ",
      defaultTitle: "無題",
      alertMessage: "内容を入力してください",
      dateAlertMessages: {
        invalid: "日付を正しく入力してください",
        future: "未来の日付は保存できません",
      },
      saveEntry,
      reloadData,
      closeForm,
    });

    expect(result).toBe(true);
    expect(saveEntry).toHaveBeenCalledWith("2024-01-12", "無題", "memo");
    expect(reloadData).toHaveBeenCalled();
    expect(closeForm).toHaveBeenCalled();
  });

  it("削除確認で同意したときだけ削除して再読込する", () => {
    const deleteEntry = jest.fn();
    const reloadData = jest.fn();
    const confirmFn = jest.fn(() => true);

    expect(
      deleteJournalEntryAndReload({
        entryId: "entry-1",
        confirmMessage: "delete?",
        deleteEntry,
        reloadData,
        confirmFn,
      }),
    ).toBe(true);
    expect(deleteEntry).toHaveBeenCalledWith("entry-1");
    expect(reloadData).toHaveBeenCalled();
  });

  it("削除確認で拒否したときは何もしない", () => {
    const deleteEntry = jest.fn();
    const reloadData = jest.fn();

    expect(
      deleteJournalEntryAndReload({
        entryId: "entry-1",
        confirmMessage: "delete?",
        deleteEntry,
        reloadData,
        confirmFn: jest.fn(() => false),
      }),
    ).toBe(false);
    expect(deleteEntry).not.toHaveBeenCalled();
    expect(reloadData).not.toHaveBeenCalled();
  });
});
