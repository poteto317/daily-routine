/** @jest-environment node */
import { setOrClear } from "../../operations/todo/setOrClear";

describe("setOrClear", () => {
  it("undefined は既存のオブジェクトを変更せずそのまま返す", () => {
    const obj = { a: 1, b: "hello" };
    expect(setOrClear(obj, "c", undefined)).toBe(obj);
  });

  it("値が指定された場合はプロパティを追加または更新する", () => {
    const obj = { a: 1, b: "hello" };
    expect(setOrClear(obj, "c", "world")).toEqual({ a: 1, b: "hello", c: "world" });
    expect(setOrClear(obj, "a", 2)).toEqual({ a: 2, b: "hello" });
  });

  it("null が指定された場合はプロパティを削除する", () => {
    const obj = { a: 1, b: "hello" };
    const result = setOrClear(obj, "b", null);
    expect(result).toEqual({ a: 1 });
    expect("b" in result).toBe(false);
  });

  it("存在しないプロパティを null で削除指定しても他のプロパティは維持される", () => {
    const obj = { a: 1 };
    expect(setOrClear(obj, "nonExistent", null)).toEqual({ a: 1 });
  });
});
