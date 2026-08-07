import {
  matchesDefaultShape,
  parseStorageValue,
} from "@/lib/storage/core-modules/storageValueGuard";

describe("matchesDefaultShape", () => {
  describe("defaultValueが配列の場合", () => {
    it("配列なら一致する", () => {
      expect(matchesDefaultShape([], [])).toBe(true);
      expect(matchesDefaultShape([1, 2], [])).toBe(true);
    });

    it.each([
      ["null", null],
      ["プレーンオブジェクト", { a: 1 }],
      ["数値", 42],
      ["文字列", "broken"],
      ["真偽値", true],
    ])("%sなら一致しない", (_label, value) => {
      expect(matchesDefaultShape(value, [])).toBe(false);
    });
  });

  describe("defaultValueがプレーンオブジェクトの場合", () => {
    it("プレーンオブジェクトなら一致する", () => {
      expect(matchesDefaultShape({}, {})).toBe(true);
      expect(matchesDefaultShape({ a: 1 }, { b: 2 })).toBe(true);
    });

    it("配列は一致しない（typeofはobjectだが形が異なる）", () => {
      expect(matchesDefaultShape([], {})).toBe(false);
    });

    it.each([
      ["null", null],
      ["数値", 42],
      ["文字列", "broken"],
      ["真偽値", true],
    ])("%sなら一致しない", (_label, value) => {
      expect(matchesDefaultShape(value, {})).toBe(false);
    });
  });

  describe("defaultValueがnullの場合", () => {
    it("期待する形が定まらないため常に一致とみなす", () => {
      expect(matchesDefaultShape(null, null)).toBe(true);
      expect(matchesDefaultShape({ a: 1 }, null)).toBe(true);
      expect(matchesDefaultShape([1], null)).toBe(true);
      expect(matchesDefaultShape(42, null)).toBe(true);
    });
  });

  describe("defaultValueがプリミティブの場合", () => {
    it("既存挙動を維持するため常に一致とみなす", () => {
      expect(matchesDefaultShape("value", "")).toBe(true);
      expect(matchesDefaultShape(1, 0)).toBe(true);
      expect(matchesDefaultShape(null, 0)).toBe(true);
    });
  });
});

describe("parseStorageValue", () => {
  it("dataがnullならデフォルト値を返す", () => {
    expect(parseStorageValue(null, { a: 1 })).toEqual({ a: 1 });
  });

  it("dataが空文字ならデフォルト値を返す", () => {
    expect(parseStorageValue("", [])).toEqual([]);
  });

  it("形が一致すればパース結果を返す", () => {
    expect(parseStorageValue('{"a":1}', {})).toEqual({ a: 1 });
    expect(parseStorageValue("[1,2]", [])).toEqual([1, 2]);
  });

  it("形が一致しなければデフォルト値を返す", () => {
    expect(parseStorageValue("null", {})).toEqual({});
    expect(parseStorageValue('{"a":1}', [])).toEqual([]);
  });

  it("不正なJSONは例外を投げる（呼び出し元のtry/catchに委ねる）", () => {
    expect(() => parseStorageValue("{broken", {})).toThrow();
  });

});
