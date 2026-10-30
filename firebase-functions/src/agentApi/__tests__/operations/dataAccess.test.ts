/** @jest-environment node */
import { readArray, readObject } from "../../operations/dataAccess";

// 同期ドキュメントの中身は端末側が書くため、想定と違う形が入っていても
// 例外にせず空の値として読む（壊れたフィールドで API 全体が 500 にならないように）。
describe("readArray", () => {
  it("配列ならそのまま（同じ参照で）返す", () => {
    const routines = [{ id: "r1" }];
    expect(readArray({ routines }, "routines")).toBe(routines);
  });

  it("空配列は空配列のまま返す", () => {
    expect(readArray({ routines: [] }, "routines")).toEqual([]);
  });

  it.each([
    ["未設定", undefined],
    ["null", null],
    ["オブジェクト", { 0: "a" }],
    ["文字列", "abc"],
    ["数値", 1],
  ])("値が%sなら空配列を返す", (_label, value) => {
    expect(readArray({ routines: value }, "routines")).toEqual([]);
  });

  it("フィールド自体が無ければ空配列を返す", () => {
    expect(readArray({}, "routines")).toEqual([]);
  });
});

describe("readObject", () => {
  it("オブジェクトならそのまま（同じ参照で）返す", () => {
    const journalHistory = { "2026-10-30": [] };
    expect(readObject({ journalHistory }, "journalHistory")).toBe(
      journalHistory,
    );
  });

  it.each([
    ["未設定", undefined],
    ["null", null],
    ["配列", [{ a: 1 }]],
    ["文字列", "abc"],
    ["数値", 0],
    ["真偽値", true],
  ])("値が%sなら空オブジェクトを返す", (_label, value) => {
    expect(readObject({ journalHistory: value }, "journalHistory")).toEqual({});
  });

  it("入れ子の読み出しで途中が壊れていても空オブジェクトになる", () => {
    // expenseStore は readObject(readObject(data, "budgetData"), "expenses") と読む
    const data = { budgetData: "broken" };
    expect(readObject(readObject(data, "budgetData"), "expenses")).toEqual({});
  });
});
