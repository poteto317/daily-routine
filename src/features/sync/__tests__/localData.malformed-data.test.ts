import { collectLocalSyncData } from "../sync/localData";

/**
 * collectLocalSyncDataは全機能のストレージ取得関数を集約して呼ぶため、
 * どれか1つでも不正データで例外を投げると同期のアップロード全体が停止する。
 * 実装をモックせず、実際のストレージ取得経路で保護されていることを検証する。
 */
const STORAGE_KEYS = [
  "daily-routines",
  "daily-progress",
  "daily-history",
  "app-settings",
  "pomodoro-history",
  "work-sessions",
  "work-templates",
  "weight-history",
  "workout-records",
  "journal-history",
  "budget-data",
  "budget-categories",
  "budget-income-items",
  "budget-expense-items",
  "meal-history",
  "routine-presets",
  "todo-lists",
  "todo-categories",
];

describe("collectLocalSyncData の不正データ耐性", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each([
    ["null", "null"],
    ["数値", "42"],
    ["文字列", '"broken"'],
    ["真偽値", "true"],
  ])(
    "全ストレージキーに%sが保存されていても例外を投げない",
    (_label, raw) => {
      STORAGE_KEYS.forEach((key) => localStorage.setItem(key, raw));

      expect(() => collectLocalSyncData()).not.toThrow();
    },
  );

  it("一部のキーだけ壊れていても他の正常なデータは収集できる", () => {
    localStorage.setItem("journal-history", "null");
    localStorage.setItem("routine-presets", '"broken"');
    localStorage.setItem(
      "meal-history",
      JSON.stringify({
        "2026-01-01": [
          {
            id: "m1",
            date: "2026-01-01",
            mealType: "breakfast",
            time: "07:00",
            description: "朝食",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
    );

    const collected = collectLocalSyncData();

    expect(collected.journalHistory).toEqual({});
    expect(collected.presets).toEqual([]);
    expect(Object.keys(collected.mealHistory)).toEqual(["2026-01-01"]);
  });

  it("ストレージが空でも例外を投げず既定値で収集する", () => {
    expect(() => collectLocalSyncData()).not.toThrow();
    expect(collectLocalSyncData().journalHistory).toEqual({});
  });
});
