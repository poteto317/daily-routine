/** @jest-environment node */
import { findMissingFields } from "../syncDoc";

describe("findMissingFields", () => {
  it("値が無い（undefined / キー自体が無い / null）フィールドだけを返す", () => {
    expect(
      findMissingFields({ a: [], b: null, c: undefined }, ["a", "b", "c", "d"]),
    ).toEqual(["b", "c", "d"]);
  });

  it("空配列・空オブジェクト・0・空文字・false は存在するとみなす（欠損と空を区別する）", () => {
    expect(
      findMissingFields({ a: [], b: {}, c: 0, d: "", e: false }, [
        "a",
        "b",
        "c",
        "d",
        "e",
      ]),
    ).toEqual([]);
  });

  it("対象が空なら空配列", () => {
    expect(findMissingFields({}, [])).toEqual([]);
  });

  it("結果は対象の指定順を保つ", () => {
    expect(findMissingFields({}, ["z", "a"])).toEqual(["z", "a"]);
  });
});
