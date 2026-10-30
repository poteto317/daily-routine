import type { DailyHistory, MonthlyHistory } from "@/types/routine";
import { getLocalDataUpdatedAt, setCurrentUserId } from "@/lib/storage/core";
import {
  getDailyHistory,
  getHistoryForMonth,
  getMonthlyHistory,
  saveMonthlyHistory,
} from "../storageHistoryQuery";

const entry = (date: string): DailyHistory => ({
  date,
  completedRoutineIds: ["r1"],
  routineSnapshots: [],
});

/** 月の境目をまたぐ日付を並べた履歴 */
const HISTORY: MonthlyHistory = {
  "2025-10-31": entry("2025-10-31"),
  "2026-01-01": entry("2026-01-01"),
  "2026-01-31": entry("2026-01-31"),
  "2026-10-01": entry("2026-10-01"),
  "2026-11-01": entry("2026-11-01"),
};

describe("storageHistoryQuery", () => {
  beforeEach(() => {
    localStorage.clear();
    setCurrentUserId("u1");
  });

  afterEach(() => {
    setCurrentUserId(null);
  });

  describe("getMonthlyHistory / saveMonthlyHistory", () => {
    it("未保存なら空のオブジェクトを返す", () => {
      expect(getMonthlyHistory()).toEqual({});
    });

    it("ユーザーごとのキーに保存し、読み戻せる", () => {
      saveMonthlyHistory(HISTORY);

      expect(localStorage.getItem("user:u1:daily-history")).not.toBeNull();
      expect(getMonthlyHistory()).toEqual(HISTORY);
    });

    it("skipLocalDataUpdatedAt を渡すとローカルの更新時刻を変えない", () => {
      saveMonthlyHistory(HISTORY, { skipLocalDataUpdatedAt: true });

      expect(getLocalDataUpdatedAt()).toBe(0);
    });

    it("オプションなしで保存するとローカルの更新時刻を進める", () => {
      saveMonthlyHistory(HISTORY);

      expect(getLocalDataUpdatedAt()).toBeGreaterThan(0);
    });
  });

  describe("getDailyHistory", () => {
    it("指定した日の履歴を返す", () => {
      saveMonthlyHistory(HISTORY);

      expect(getDailyHistory("2026-01-31")).toEqual(entry("2026-01-31"));
    });

    it("その日の履歴が無ければ null", () => {
      saveMonthlyHistory(HISTORY);

      expect(getDailyHistory("2026-01-02")).toBeNull();
    });
  });

  describe("getHistoryForMonth", () => {
    beforeEach(() => {
      saveMonthlyHistory(HISTORY);
    });

    it("1 桁の月は 0 埋めして、その月の日付だけを返す", () => {
      // "2026-1" の前方一致だと 10 月・11 月まで含んでしまう
      expect(Object.keys(getHistoryForMonth(2026, 1))).toEqual([
        "2026-01-01",
        "2026-01-31",
      ]);
    });

    it("2 桁の月は、同じ月の別の年を含めない", () => {
      expect(getHistoryForMonth(2026, 10)).toEqual({
        "2026-10-01": entry("2026-10-01"),
      });
    });

    it("履歴の無い月は空のオブジェクト", () => {
      expect(getHistoryForMonth(2026, 2)).toEqual({});
    });
  });
});
