/** @jest-environment node */
import { toStringQuery } from "../requestQuery";
import { expectApiError } from "./testUtils";

describe("toStringQuery", () => {
  it("文字列の値はそのまま返す", () => {
    expect(toStringQuery({ month: "2026-10", date: "2026-10-03" })).toEqual({
      month: "2026-10",
      date: "2026-10-03",
    });
  });

  it("空のクエリは空オブジェクト、空文字は空文字のまま", () => {
    expect(toStringQuery({})).toEqual({});
    expect(toStringQuery({ month: "" })).toEqual({ month: "" });
  });

  it("undefined の値はそのまま通す", () => {
    expect(toStringQuery({ month: undefined })).toEqual({ month: undefined });
  });

  it("同じキーの重複（配列）は黙って無視せず 400 invalid_query", () => {
    expectApiError(
      () => toStringQuery({ month: ["2026-10", "2026-11"] }),
      400,
      "invalid_query",
    );
  });

  it.each([{ nested: "x" }, 1, null, true])(
    "文字列でない値 %j は 400 invalid_query",
    (value) => {
      expectApiError(
        () => toStringQuery({ month: value }),
        400,
        "invalid_query",
      );
    },
  );

  it("エラーメッセージに対象のキーを含める", () => {
    expect(() => toStringQuery({ month: ["a", "b"] })).toThrow(/month/);
  });
});
