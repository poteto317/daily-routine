import * as coreStorage from "@/lib/storage/core";
import {
  deleteWeeklyLog,
  getWeeklyLogHistory,
  saveWeeklyLog,
  saveWeeklyLogHistory,
} from "../weeklyLogStorage";
import type { WeeklyLogEntry } from "@/types/routine";

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

const entry = (
  weekStart: string,
  overrides: Partial<WeeklyLogEntry> = {},
): WeeklyLogEntry => ({
  id: `w-${weekStart}`,
  weekStart,
  content: `${weekStart} の内容`,
  createdAt: "2026-11-06T12:00:00.000Z",
  updatedAt: "2026-11-06T12:00:00.000Z",
  ...overrides,
});

describe("weeklyLogStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetStorageItem.mockReturnValue({} as never);
    mockSetStorageItem.mockReturnValue(true);
    mockGenerateId.mockReturnValue("weekly-log-new");
  });

  describe("getWeeklyLogHistory", () => {
    it("weekly-log-history を読む", () => {
      const history = { "2026-11-02": entry("2026-11-02") };
      mockGetStorageItem.mockReturnValue(history as never);

      expect(getWeeklyLogHistory()).toEqual(history);
      expect(mockGetStorageItem).toHaveBeenCalledWith("weekly-log-history", {});
    });

    it("壊れた値は正規化して返す", () => {
      mockGetStorageItem.mockReturnValue({
        "2026-11-02": entry("2026-11-02"),
        "not-a-date": entry("not-a-date"),
      } as never);

      expect(getWeeklyLogHistory()).toEqual({
        "2026-11-02": entry("2026-11-02"),
      });
    });

    it("毎回新しいオブジェクトを返す", () => {
      expect(getWeeklyLogHistory()).not.toBe(getWeeklyLogHistory());
    });
  });

  describe("saveWeeklyLogHistory", () => {
    it("書き込みの成否を返す", () => {
      mockSetStorageItem.mockReturnValue(false);
      expect(saveWeeklyLogHistory({})).toBe(false);
      expect(mockSetStorageItem).toHaveBeenCalledWith("weekly-log-history", {});
    });
  });

  describe("saveWeeklyLog", () => {
    const now = new Date("2026-11-07T03:00:00.000Z");

    it("その週の日誌が無ければ新しく作る", () => {
      expect(saveWeeklyLog("2026-11-02", "本文", now)).toBe(true);

      expect(mockGenerateId).toHaveBeenCalledWith("weekly-log");
      expect(mockSetStorageItem).toHaveBeenCalledWith("weekly-log-history", {
        "2026-11-02": {
          id: "weekly-log-new",
          weekStart: "2026-11-02",
          content: "本文",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      });
    });

    it("有れば本文と updatedAt だけを変え、id と createdAt は据え置く", () => {
      const other = entry("2026-10-26");
      mockGetStorageItem.mockReturnValue({
        "2026-11-02": entry("2026-11-02"),
        "2026-10-26": other,
      } as never);

      saveWeeklyLog("2026-11-02", "新しい本文", now);

      expect(mockGenerateId).not.toHaveBeenCalled();
      expect(mockSetStorageItem).toHaveBeenCalledWith("weekly-log-history", {
        "2026-11-02": {
          ...entry("2026-11-02"),
          content: "新しい本文",
          updatedAt: now.toISOString(),
        },
        "2026-10-26": other,
      });
    });

    it("知らないフィールドは、保存した週も別の週も残す", () => {
      const other = { ...entry("2026-10-26"), tags: ["other"] };
      mockGetStorageItem.mockReturnValue({
        "2026-11-02": { ...entry("2026-11-02"), tags: ["a"] },
        "2026-10-26": other,
      } as never);

      saveWeeklyLog("2026-11-02", "新しい本文", now);

      expect(mockSetStorageItem).toHaveBeenCalledWith("weekly-log-history", {
        "2026-11-02": {
          ...entry("2026-11-02"),
          tags: ["a"],
          content: "新しい本文",
          updatedAt: now.toISOString(),
        },
        "2026-10-26": other,
      });
    });

    it("書き込みに失敗したら false を返す", () => {
      mockSetStorageItem.mockReturnValue(false);
      expect(saveWeeklyLog("2026-11-02", "本文", now)).toBe(false);
    });
  });

  describe("deleteWeeklyLog", () => {
    it("その週を除いて保存する", () => {
      const other = entry("2026-10-26");
      mockGetStorageItem.mockReturnValue({
        "2026-11-02": entry("2026-11-02"),
        "2026-10-26": other,
      } as never);

      expect(deleteWeeklyLog("2026-11-02")).toBe(true);
      expect(mockSetStorageItem).toHaveBeenCalledWith("weekly-log-history", {
        "2026-10-26": other,
      });
    });

    it("その週が無ければ書き込まずに true を返す", () => {
      expect(deleteWeeklyLog("2026-11-02")).toBe(true);
      expect(mockSetStorageItem).not.toHaveBeenCalled();
    });

    it("書き込みに失敗したら false を返す", () => {
      mockGetStorageItem.mockReturnValue({
        "2026-11-02": entry("2026-11-02"),
      } as never);
      mockSetStorageItem.mockReturnValue(false);
      expect(deleteWeeklyLog("2026-11-02")).toBe(false);
    });
  });
});
