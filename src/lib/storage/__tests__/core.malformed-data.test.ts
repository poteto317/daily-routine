import { getStorageItem, setStorageItem } from "@/lib/storage/core";

/**
 * localStorage / 同期経由の値はJSON.parseされるだけで型検証されないため、
 * defaultValueの形と一致しない値が呼び出し元に渡ると
 * Object.entries()や.map()で例外になる。
 * getStorageItemは同期のアップロード収集(collectLocalSyncData)からも
 * 呼ばれるため、ここで例外を投げると同期全体が停止してしまう。
 */
describe("getStorageItem の不正データ耐性", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("defaultValueがオブジェクトの場合", () => {
    it.each([
      ["null", "null"],
      ["配列", "[1,2,3]"],
      ["数値", "42"],
      ["文字列", '"broken"'],
      ["真偽値", "true"],
    ])("保存値が%sならデフォルト値を返す", (_label, raw) => {
      localStorage.setItem("test-key", raw);

      expect(getStorageItem("test-key", {})).toEqual({});
    });

    it("正常なオブジェクトはそのまま返す", () => {
      localStorage.setItem("test-key", JSON.stringify({ a: 1 }));

      expect(getStorageItem("test-key", {})).toEqual({ a: 1 });
    });
  });

  describe("defaultValueが配列の場合", () => {
    it.each([
      ["null", "null"],
      ["オブジェクト", '{"a":1}'],
      ["数値", "42"],
      ["文字列", '"broken"'],
    ])("保存値が%sならデフォルト値を返す", (_label, raw) => {
      localStorage.setItem("test-key", raw);

      expect(getStorageItem("test-key", [])).toEqual([]);
    });

    it("正常な配列はそのまま返す", () => {
      localStorage.setItem("test-key", JSON.stringify([1, 2]));

      expect(getStorageItem("test-key", [])).toEqual([1, 2]);
    });
  });

  describe("defaultValueがnullの場合", () => {
    it("期待する形が定まらないため検証せずそのまま返す", () => {
      localStorage.setItem("test-key", JSON.stringify({ id: "x" }));

      expect(getStorageItem<{ id: string } | null>("test-key", null)).toEqual({
        id: "x",
      });
    });

    it("保存値がnullならnullを返す", () => {
      localStorage.setItem("test-key", "null");

      expect(getStorageItem<number | null>("test-key", null)).toBeNull();
    });
  });

  it("保存値が無ければデフォルト値を返す", () => {
    expect(getStorageItem("missing-key", { a: 1 })).toEqual({ a: 1 });
  });

  it("setStorageItemで保存した値は正常に読み戻せる", () => {
    setStorageItem("test-key", { nested: { value: 1 } });

    expect(getStorageItem("test-key", {})).toEqual({ nested: { value: 1 } });
  });
});
