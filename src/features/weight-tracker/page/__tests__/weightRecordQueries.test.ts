import {
  getTodayDateKey,
  formatWeightDate,
  calculateWeightChange,
  getRecentWeightRecords,
} from "../weightRecordQueries";
import { type WeightRecord } from "@/types/routine";

describe("weightRecordQueries", () => {
  it("getTodayDateKey returns a valid string", () => {
    expect(typeof getTodayDateKey()).toBe("string");
  });

  describe("formatWeightDate", () => {
    it("日付文字列を日本語ロケール表記に変換する", () => {
      const formatted = formatWeightDate("2026-03-15");
      expect(formatted).toContain("2026");
      expect(formatted).toContain("3");
      expect(formatted).toContain("15");
    });
  });

  describe("calculateWeightChange", () => {
    it("現在の体重と前回の体重の差分を計算する", () => {
      expect(calculateWeightChange(65.5, 65.0)).toBeCloseTo(0.5);
      expect(calculateWeightChange(64.5, 65.0)).toBeCloseTo(-0.5);
      expect(calculateWeightChange(65.0, 65.0)).toBe(0);
    });
  });

  describe("getRecentWeightRecords", () => {
    it("履歴オブジェクトを日付降順で配列に変換し制限件数で切り詰める", () => {
      const history: Record<string, WeightRecord> = {
        "2026-03-01": {
          id: "1",
          date: "2026-03-01",
          weight: 65,
          createdAt: "",
          updatedAt: "",
        },
        "2026-03-03": {
          id: "3",
          date: "2026-03-03",
          weight: 64,
          createdAt: "",
          updatedAt: "",
        },
        "2026-03-02": {
          id: "2",
          date: "2026-03-02",
          weight: 64.5,
          createdAt: "",
          updatedAt: "",
        },
      };

      const records = getRecentWeightRecords(history, 2);
      expect(records).toHaveLength(2);
      expect(records[0].date).toBe("2026-03-03");
      expect(records[1].date).toBe("2026-03-02");
    });
  });
});
