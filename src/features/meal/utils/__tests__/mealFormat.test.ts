import {
  getTodayDateString,
  getCurrentTimeString,
  formatMealDate,
  getMealTypeLabel,
  getMealTypeIcon,
  sortMealsByDateTimeDesc,
  sortMealsByTimeAsc,
} from "../mealFormat";
import { type MealRecord } from "@/types/routine";

describe("mealFormat utils", () => {
  it("getTodayDateString and getCurrentTimeString return valid strings", () => {
    expect(typeof getTodayDateString()).toBe("string");
    expect(typeof getCurrentTimeString()).toBe("string");
  });

  describe("formatMealDate", () => {
    it("日付文字列を日本語ロケール表記に変換する", () => {
      const formatted = formatMealDate("2026-03-15");
      expect(formatted).toContain("2026");
      expect(formatted).toContain("3");
      expect(formatted).toContain("15");
    });
  });

  describe("getMealTypeLabel", () => {
    it("各食事種別のラベルを返す", () => {
      expect(getMealTypeLabel("breakfast")).toBe("朝食");
      expect(getMealTypeLabel("lunch")).toBe("昼食");
      expect(getMealTypeLabel("dinner")).toBe("夕食");
      expect(getMealTypeLabel("snack")).toBe("間食");
    });
  });

  describe("getMealTypeIcon", () => {
    it("各食事種別のアイコンを返す", () => {
      expect(getMealTypeIcon("breakfast")).toBe("🌅");
      expect(getMealTypeIcon("lunch")).toBe("🌞");
      expect(getMealTypeIcon("dinner")).toBe("🌙");
      expect(getMealTypeIcon("snack")).toBe("🍪");
    });
  });

  describe("sortMealsByDateTimeDesc", () => {
    it("日付の降順、同日の場合は時間の降順にソートする", () => {
      const meals: MealRecord[] = [
        {
          id: "1",
          date: "2026-03-15",
          time: "08:00",
          mealType: "breakfast",
          description: "朝ごはん",
          createdAt: "2026-03-15T08:00:00Z",
          updatedAt: "2026-03-15T08:00:00Z",
        },
        {
          id: "2",
          date: "2026-03-16",
          time: "12:00",
          mealType: "lunch",
          description: "昼ごはん",
          createdAt: "2026-03-16T12:00:00Z",
          updatedAt: "2026-03-16T12:00:00Z",
        },
        {
          id: "3",
          date: "2026-03-15",
          time: "19:00",
          mealType: "dinner",
          description: "夜ごはん",
          createdAt: "2026-03-15T19:00:00Z",
          updatedAt: "2026-03-15T19:00:00Z",
        },
      ];

      const sorted = sortMealsByDateTimeDesc(meals);
      expect(sorted.map((m) => m.id)).toEqual(["2", "3", "1"]);
    });
  });

  describe("sortMealsByTimeAsc", () => {
    it("時間の昇順にソートする", () => {
      const meals: MealRecord[] = [
        {
          id: "1",
          date: "2026-03-15",
          time: "19:00",
          mealType: "dinner",
          description: "夜ごはん",
          createdAt: "2026-03-15T19:00:00Z",
          updatedAt: "2026-03-15T19:00:00Z",
        },
        {
          id: "2",
          date: "2026-03-15",
          time: "08:00",
          mealType: "breakfast",
          description: "朝ごはん",
          createdAt: "2026-03-15T08:00:00Z",
          updatedAt: "2026-03-15T08:00:00Z",
        },
        {
          id: "3",
          date: "2026-03-15",
          time: "12:00",
          mealType: "lunch",
          description: "昼ごはん",
          createdAt: "2026-03-15T12:00:00Z",
          updatedAt: "2026-03-15T12:00:00Z",
        },
      ];

      const sorted = sortMealsByTimeAsc(meals);
      expect(sorted.map((m) => m.id)).toEqual(["2", "3", "1"]);
    });
  });
});
