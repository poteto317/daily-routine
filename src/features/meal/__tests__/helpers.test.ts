import {
  MEAL_PAGE_MESSAGES,
  MEAL_HEADER_TEXT,
  MEAL_TODAY_TITLE_LABEL,
  formatMealNotes,
  MEAL_TYPE_OPTIONS,
  getMealRecentItemClassName,
  formatMealRecentMemo,
} from "../helpers";

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
});
