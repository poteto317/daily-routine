import {
  getJournalHistory,
  saveJournalHistory,
  getJournalEntry,
  saveJournalEntry,
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
});
