import {
  deleteJournalEntryAndReload,
  saveJournalEntryAndReload,
} from "../journalMutationActions";

describe("journalMutationActions", () => {
  it("空入力なら保存せず alert する", () => {
    const alertFn = jest.fn();
    const saveEntry = jest.fn();

    const result = saveJournalEntryAndReload({
      today: "2024-01-12",
      titleInput: "  ",
      contentInput: "  ",
      defaultTitle: "無題",
      alertMessage: "内容を入力してください",
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
      titleInput: "  ",
      contentInput: " memo ",
      defaultTitle: "無題",
      alertMessage: "内容を入力してください",
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
