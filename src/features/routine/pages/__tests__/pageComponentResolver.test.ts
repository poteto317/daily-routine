import { resolvePageContent } from "../pageComponentResolver";
import type { PageType } from "../types";

const FEATURE_PAGES: PageType[] = [
  "journal",
  "settings",
  "calendar",
  "statistics",
  "pomodoro",
  "worktracker",
  "weight-tracker",
  "workout-tracker",
  "weather",
  "meal",
  "budget",
  "budget-category-management",
  "budget-allowance-settings",
  "budget-summary",
  "preset",
  "todo-lists",
  "todo-list-management",
  "todo-category-management",
  "sync-management",
  "test-matrix",
  "account-admin",
  "bug-report",
];

describe("resolvePageContent", () => {
  it("homeは専用コンポーネントを持たない", () => {
    expect(resolvePageContent("home")).toBeUndefined();
  });

  it.each(FEATURE_PAGES)("%sは機能ページを解決できる", (page) => {
    expect(resolvePageContent(page)).toBeDefined();
  });
});
