import {
  MEAL_PAGE_MESSAGES,
  MEAL_HEADER_TEXT,
  MEAL_TODAY_TITLE_LABEL,
  formatMealNotes,
  MEAL_TYPE_OPTIONS,
  getMealRecentItemClassName,
  formatMealRecentMemo,
} from "../helpers";
import type { MealType } from "@/types/routine";

describe("meal helpers", () => {
  it("MEAL_PAGE_MESSAGES.confirmDeleteMeal formats message with date", () => {
    expect(MEAL_PAGE_MESSAGES.confirmDeleteMeal("2026-03-15")).toContain(
      "2026-03-15",
    );
  });

  it("formatMealNotes adds prefix", () => {
    expect(formatMealNotes("よく噛んで食べた")).toContain("よく噛んで食べた");
  });

  it("getMealRecentItemClassName returns green-themed styles for today and gray-themed for others", () => {
    const todayClass = getMealRecentItemClassName(true);
    const otherClass = getMealRecentItemClassName(false);

    expect(todayClass).toContain("border-green-300");
    expect(otherClass).toContain("border-gray-200");
  });

  it("formatMealRecentMemo adds memo prefix", () => {
    expect(formatMealRecentMemo("テストメモ")).toContain("テストメモ");
  });

  it("constants are defined", () => {
    expect(MEAL_HEADER_TEXT.title).toBeDefined();
    expect(MEAL_TODAY_TITLE_LABEL).toBeDefined();
    expect(MEAL_TYPE_OPTIONS.length).toBeGreaterThan(0);
  });

  it("MEAL_TYPE_OPTIONS の value は MealType の全値と過不足なく一致する", () => {
    // locales/ja.json の値を as MealType[] で受けているため、
    // 綴り違いや追加漏れは型では見つからない。ここで実際の値を確かめる。
    const mealTypes: readonly MealType[] = [
      "breakfast",
      "lunch",
      "dinner",
      "snack",
    ];

    expect(MEAL_TYPE_OPTIONS.map(({ value }) => value)).toEqual(mealTypes);
    expect(MEAL_TYPE_OPTIONS.every(({ label }) => label.length > 0)).toBe(true);
  });
});
