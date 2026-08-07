import {
  cloneDefaultValue,
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

  describe("フォールバック時にdefaultValueを共有しない", () => {
    // 呼び出し元(storageMutations等)は取得結果へ直接pushするため、
    // defaultValueを参照のまま返すとモジュールレベルの共有定数が汚染され、
    // 以降の取得結果に前回のデータが混入してしまう。

    it("dataが無い場合、返り値を変更してもdefaultValueは変わらない", () => {
      const defaultValue: Record<string, string[]> = {};

      const result = parseStorageValue(null, defaultValue);
      result["2026-01-01"] = ["朝食"];

      expect(defaultValue).toEqual({});
    });

    it("形が一致しない場合、返り値を変更してもdefaultValueは変わらない", () => {
      const defaultValue: Record<string, string[]> = {};

      const result = parseStorageValue("null", defaultValue);
      result["2026-01-01"] = ["朝食"];

      expect(defaultValue).toEqual({});
    });

    it("ネストしたオブジェクトも共有しない", () => {
      const defaultValue = { expenses: {} as Record<string, number[]> };

      const result = parseStorageValue(null, defaultValue);
      result.expenses["2026-01"] = [100];

      expect(defaultValue.expenses).toEqual({});
    });
  });
});

describe("cloneDefaultValue", () => {
  it("オブジェクトは複製して返す", () => {
    const value = { a: 1 };

    expect(cloneDefaultValue(value)).not.toBe(value);
    expect(cloneDefaultValue(value)).toEqual(value);
  });

  it("配列は複製して返す", () => {
    const value = [1, 2];

    expect(cloneDefaultValue(value)).not.toBe(value);
    expect(cloneDefaultValue(value)).toEqual(value);
  });

  it("ネストした値も複製する", () => {
    const value = { nested: { a: 1 } };

    expect(cloneDefaultValue(value).nested).not.toBe(value.nested);
  });

  it("nullとプリミティブはそのまま返す", () => {
    expect(cloneDefaultValue(null)).toBeNull();
    expect(cloneDefaultValue(42)).toBe(42);
    expect(cloneDefaultValue("x")).toBe("x");
  });
});
