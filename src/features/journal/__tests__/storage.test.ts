import {
  getJournalHistory,
  saveJournalHistory,
  getJournalEntry,
  saveJournalEntry,
  updateJournalEntry,
} from "../storage";
import * as coreStorage from "@/lib/storage/core";

jest.mock("@/lib/storage/core");

const mockGetStorageItem = coreStorage.getStorageItem as jest.MockedFunction<
  typeof coreStorage.getStorageItem
>;
const mockSetStorageItem = coreStorage.setStorageItem as jest.MockedFunction<
  typeof coreStorage.setStorageItem
>;
const mockGenerateId = coreStorage.generateId as jest.MockedFunction<
  typeof coreStorage.generateId
>;

describe("journal storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStorageItem.mockReturnValue({} as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("getJournalHistoryは履歴を取得する", () => {
    const history = {
      "2026-02-12": [
        {
          id: "j1",
          date: "2026-02-12",
          title: "t",
          content: "c",
          createdAt: "2026-02-12T00:00:00.000Z",
          updatedAt: "2026-02-12T00:00:00.000Z",
        },
      ],
    };
    mockGetStorageItem.mockReturnValue(history as never);

    const result = getJournalHistory();

    expect(result).toEqual(history);
    expect(mockGetStorageItem).toHaveBeenCalledWith("journal-history", {});
  });

  it("saveJournalHistoryは履歴を保存する", () => {
    const history = {
      "2026-02-12": [
        {
          id: "j1",
          date: "2026-02-12",
          title: "t",
          content: "c",
          createdAt: "2026-02-12T00:00:00.000Z",
          updatedAt: "2026-02-12T00:00:00.000Z",
        },
      ],
    };

    saveJournalHistory(history);

    expect(mockSetStorageItem).toHaveBeenCalledWith("journal-history", history);
  });

  it("getJournalEntryは指定日のエントリを返す", () => {
    const history = {
      "2026-02-12": [
        {
          id: "j1",
          date: "2026-02-12",
          title: "t",
          content: "c",
          createdAt: "2026-02-12T00:00:00.000Z",
          updatedAt: "2026-02-12T00:00:00.000Z",
        },
      ],
    };
    mockGetStorageItem.mockReturnValue(history as never);

    const result = getJournalEntry("2026-02-12");

    expect(result).toEqual(history["2026-02-12"][0]);
  });

  it("旧形式の単一エントリ履歴を配列に正規化する", () => {
    const legacyHistory = {
      "2026-02-12": {
        id: "j1",
        date: "2026-02-12",
        title: "t",
        content: "c",
        createdAt: "2026-02-12T00:00:00.000Z",
        updatedAt: "2026-02-12T00:00:00.000Z",
      },
    };
    mockGetStorageItem.mockReturnValue(legacyHistory as never);

    expect(getJournalHistory()).toEqual({
      "2026-02-12": [legacyHistory["2026-02-12"]],
    });
  });

  it("saveJournalEntryは新規エントリを作成して保存する", () => {
    mockGenerateId.mockReturnValue("new-journal-id");
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-12T10:00:00.000Z");

    saveJournalEntry("2026-02-12", "title", "content");

    expect(mockSetStorageItem).toHaveBeenCalledWith("journal-history", {
      "2026-02-12": [
        {
          id: "new-journal-id",
          date: "2026-02-12",
          title: "title",
          content: "content",
          createdAt: "2026-02-12T10:00:00.000Z",
          updatedAt: "2026-02-12T10:00:00.000Z",
        },
      ],
    });
  });

  it("saveJournalEntryは同日の既存記録を上書きせず追記する", () => {
    mockGenerateId.mockReturnValue("new-journal-id");
    mockGetStorageItem.mockReturnValue({
      "2026-02-12": [
        {
          id: "existing-id",
          date: "2026-02-12",
          title: "existing",
          content: "existing-content",
          createdAt: "2026-02-12T09:00:00.000Z",
          updatedAt: "2026-02-12T09:00:00.000Z",
        },
      ],
    } as never);
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-12T10:00:00.000Z");

    saveJournalEntry("2026-02-12", "title", "content");

    expect(mockSetStorageItem).toHaveBeenCalledWith("journal-history", {
      "2026-02-12": [
        {
          id: "existing-id",
          date: "2026-02-12",
          title: "existing",
          content: "existing-content",
          createdAt: "2026-02-12T09:00:00.000Z",
          updatedAt: "2026-02-12T09:00:00.000Z",
        },
        {
          id: "new-journal-id",
          date: "2026-02-12",
          title: "title",
          content: "content",
          createdAt: "2026-02-12T10:00:00.000Z",
          updatedAt: "2026-02-12T10:00:00.000Z",
        },
      ],
    });
  });

  it("updateJournalEntryは指定IDのtitle・contentとupdatedAtを更新する", () => {
    mockGetStorageItem.mockReturnValue({
      "2026-02-12": [
        {
          id: "journal-1",
          date: "2026-02-12",
          title: "old title",
          content: "old content",
          createdAt: "2026-02-12T08:00:00.000Z",
          updatedAt: "2026-02-12T08:00:00.000Z",
        },
      ],
    } as never);
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-12T10:00:00.000Z");

    updateJournalEntry("journal-1", "new title", "new content");

    expect(mockSetStorageItem).toHaveBeenCalledWith("journal-history", {
      "2026-02-12": [
        {
          id: "journal-1",
          date: "2026-02-12",
          title: "new title",
          content: "new content",
          createdAt: "2026-02-12T08:00:00.000Z",
          updatedAt: "2026-02-12T10:00:00.000Z",
        },
      ],
    });
  });

  it("updateJournalEntryは対象外のエントリを変更しない", () => {
    const entry2 = {
      id: "journal-2",
      date: "2026-02-12",
      title: "title 2",
      content: "content 2",
      createdAt: "2026-02-12T09:00:00.000Z",
      updatedAt: "2026-02-12T09:00:00.000Z",
    };
    mockGetStorageItem.mockReturnValue({
      "2026-02-12": [
        {
          id: "journal-1",
          date: "2026-02-12",
          title: "title 1",
          content: "content 1",
          createdAt: "2026-02-12T08:00:00.000Z",
          updatedAt: "2026-02-12T08:00:00.000Z",
        },
        entry2,
      ],
    } as never);
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2026-02-12T10:00:00.000Z");

    updateJournalEntry("journal-1", "updated", "updated content");

    const saved = mockSetStorageItem.mock.calls[0][1] as Record<
      string,
      (typeof entry2)[]
    >;
    expect(saved["2026-02-12"].find((e) => e.id === "journal-2")).toEqual(
      entry2,
    );
  });
});

// 読み出し → applyJournalEntryUpdate → 1 回の書き込み、の受け渡しだけを確かめる。
// バケットの移動・置き換えの場合分けは journalHistoryUpdate.test.ts で確かめる
describe("updateJournalEntry の日付の受け渡し", () => {
  const NOW = "2026-02-12T10:00:00.000Z";

  const makeEntry = (id: string, date: string) => ({
    id,
    date,
    title: `${id} title`,
    content: `${id} content`,
    createdAt: `${date}T08:00:00.000Z`,
    updatedAt: `${date}T08:00:00.000Z`,
  });

  // 1 回の書き込みで保存したことを確かめ、保存した履歴を返す
  const savedHistory = () => {
    expect(mockSetStorageItem).toHaveBeenCalledTimes(1);
    expect(mockSetStorageItem.mock.calls[0][0]).toBe("journal-history");
    return mockSetStorageItem.mock.calls[0][1];
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date.prototype, "toISOString").mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("日付を変えると旧バケットから除き、変更先の末尾に入れる（変更先の既存と共存し、createdAt は据え置く）", () => {
    const target = makeEntry("j1", "2026-02-12");
    const sameDay = makeEntry("j2", "2026-02-12");
    const destination = makeEntry("j3", "2026-02-01");
    mockGetStorageItem.mockReturnValue({
      "2026-02-12": [target, sameDay],
      "2026-02-01": [destination],
    } as never);

    updateJournalEntry("j1", "new title", "new content", "2026-02-01");

    expect(savedHistory()).toEqual({
      "2026-02-12": [sameDay],
      "2026-02-01": [
        destination,
        {
          ...target,
          date: "2026-02-01",
          title: "new title",
          content: "new content",
          createdAt: "2026-02-12T08:00:00.000Z",
          updatedAt: NOW,
        },
      ],
    });
  });

  it("date を省略したときは、位置も entry.date も変えない（キーと entry.date が食い違うデータでも）", () => {
    const mismatched = makeEntry("j1", "2026-02-10");
    const second = makeEntry("j2", "2026-02-12");
    mockGetStorageItem.mockReturnValue({
      "2026-02-12": [mismatched, second],
    } as never);

    updateJournalEntry("j1", "t", "c");

    expect(savedHistory()).toEqual({
      "2026-02-12": [
        {
          ...mismatched,
          date: "2026-02-10",
          title: "t",
          content: "c",
          updatedAt: NOW,
        },
        second,
      ],
    });
  });

  it("ID が見つからなければ、履歴の内容を変えない", () => {
    const history = { "2026-02-12": [makeEntry("j1", "2026-02-12")] };
    mockGetStorageItem.mockReturnValue(history as never);

    updateJournalEntry("missing", "t", "c", "2026-02-01");

    expect(savedHistory()).toEqual(history);
  });
});
