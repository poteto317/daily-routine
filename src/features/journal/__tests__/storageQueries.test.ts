import {
  getJournalEntriesByPeriod,
  getLatestJournalEntry,
} from "../storageQueries";
import * as storageData from "../storageData";
import { type JournalEntry } from "@/types/routine";

jest.mock("../storageData");

const mockGetJournalHistory =
  storageData.getJournalHistory as jest.MockedFunction<
    typeof storageData.getJournalHistory
  >;

describe("journal storageQueries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const entry1: JournalEntry = {
    id: "j-1",
    date: "2026-03-10",
    title: "タイトル1",
    content: "日記1",
    createdAt: "2026-03-10T10:00:00Z",
    updatedAt: "2026-03-10T10:00:00Z",
  };

  const entry2: JournalEntry = {
    id: "j-2",
    date: "2026-03-15",
    title: "タイトル2",
    content: "日記2",
    createdAt: "2026-03-15T12:00:00Z",
    updatedAt: "2026-03-15T12:00:00Z",
  };

  const entry3: JournalEntry = {
    id: "j-3",
    date: "2026-03-15",
    title: "タイトル3",
    content: "日記3（同日更新違い）",
    createdAt: "2026-03-15T14:00:00Z",
    updatedAt: "2026-03-15T18:00:00Z",
  };

  const entry4: JournalEntry = {
    id: "j-4",
    date: "2026-03-20",
    title: "タイトル4",
    content: "日記4",
    createdAt: "2026-03-20T08:00:00Z",
    updatedAt: "2026-03-20T08:00:00Z",
  };

  describe("getJournalEntriesByPeriod", () => {
    it("指定期間内のエントリを日付降順・更新日時降順で返す", () => {
      mockGetJournalHistory.mockReturnValue({
        "2026-03-10": [entry1],
        "2026-03-15": [entry2, entry3],
        "2026-03-20": [entry4],
      });

      const result = getJournalEntriesByPeriod("2026-03-12", "2026-03-18");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("j-3"); // 2026-03-15 updatedAt 18:00
      expect(result[1].id).toBe("j-2"); // 2026-03-15 updatedAt 12:00
    });

    it("期間外のエントリしかない場合は空配列を返す", () => {
      mockGetJournalHistory.mockReturnValue({
        "2026-03-10": [entry1],
      });

      const result = getJournalEntriesByPeriod("2026-04-01", "2026-04-30");
      expect(result).toEqual([]);
    });
  });

  describe("getLatestJournalEntry", () => {
    it("記録が存在しない場合は null を返す", () => {
      mockGetJournalHistory.mockReturnValue({});
      expect(getLatestJournalEntry()).toBeNull();
    });

    it("記録が存在する場合は最も新しい日付・更新日時のエントリを返す", () => {
      mockGetJournalHistory.mockReturnValue({
        "2026-03-10": [entry1],
        "2026-03-20": [entry4],
        "2026-03-15": [entry2, entry3],
      });

      const latest = getLatestJournalEntry();
      expect(latest).toEqual(entry4);
    });
  });
});
