import type { WeeklyLogEntry } from "@/types/routine";
import {
  listWeeklyLogsByLatest,
  normalizeWeeklyLogHistory,
} from "../weeklyLogHistoryData";

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

describe("normalizeWeeklyLogHistory", () => {
  it("正しい履歴はそのまま返す", () => {
    const history = { "2026-11-02": entry("2026-11-02") };
    expect(normalizeWeeklyLogHistory(history)).toEqual(history);
  });

  it.each([null, undefined, [], "text", 1])(
    "オブジェクトでない値 %p は空にする",
    (value) => {
      expect(normalizeWeeklyLogHistory(value)).toEqual({});
    },
  );

  it("フィールドが欠けた値・型の違う値・null を捨てる", () => {
    expect(
      normalizeWeeklyLogHistory({
        "2026-11-02": entry("2026-11-02"),
        "2026-10-26": { id: "x", content: 1 },
        "2026-10-19": null,
        "2026-10-12": "text",
      }),
    ).toEqual({ "2026-11-02": entry("2026-11-02") });
  });

  it("形の違うキーを捨てる", () => {
    expect(
      normalizeWeeklyLogHistory({
        "not-a-date": entry("not-a-date"),
        "2026-1-2": entry("2026-1-2"),
      }),
    ).toEqual({});
  });

  it.each(["2026-13-01", "2026-02-30", "2026-11-03"])(
    "存在しない日付・月曜でないキー %s を捨てる",
    (key) => {
      expect(
        normalizeWeeklyLogHistory({
          [key]: entry(key),
          "2026-11-02": entry("2026-11-02"),
        }),
      ).toEqual({ "2026-11-02": entry("2026-11-02") });
    },
  );

  it("weekStart はキーで上書きする（置き場所を正とする）", () => {
    const result = normalizeWeeklyLogHistory({
      "2026-11-02": entry("2026-10-26"),
    });
    expect(result["2026-11-02"].weekStart).toBe("2026-11-02");
  });

  it("検査に通ったエントリは、知らないフィールドも残す", () => {
    const raw = {
      "2026-11-02": { ...entry("2026-11-02"), tags: ["a"] },
    };
    expect(normalizeWeeklyLogHistory(raw)).toEqual(raw);
  });

  it("毎回新しいオブジェクトを返す", () => {
    const raw = { "2026-11-02": entry("2026-11-02") };
    const first = normalizeWeeklyLogHistory(raw);
    expect(first).not.toBe(raw);
    expect(first["2026-11-02"]).not.toBe(raw["2026-11-02"]);
    expect(normalizeWeeklyLogHistory(raw)).not.toBe(first);
  });
});

describe("listWeeklyLogsByLatest", () => {
  it("週の開始日の降順に並べる", () => {
    const history = {
      "2026-10-19": entry("2026-10-19"),
      "2026-11-02": entry("2026-11-02"),
      "2026-10-26": entry("2026-10-26"),
    };

    expect(
      listWeeklyLogsByLatest(history).map((item) => item.weekStart),
    ).toEqual(["2026-11-02", "2026-10-26", "2026-10-19"]);
  });

  it("空の履歴は空配列", () => {
    expect(listWeeklyLogsByLatest({})).toEqual([]);
  });
});
