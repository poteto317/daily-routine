/** @jest-environment node */
import { compact, required } from "../../validation/values";
import { expectApiError } from "../testUtils";

describe("required", () => {
  it("値があればそのまま返す（falsy な値も含む）", () => {
    expect(required("name", "a")).toBe("a");
    expect(required("count", 0)).toBe(0);
    expect(required("flag", false)).toBe(false);
    expect(required("text", "")).toBe("");
  });

  it("undefined なら 400 invalid_field でフィールド名を含める", () => {
    expectApiError(() => required("name", undefined), 400, "invalid_field");
    expect(() => required("name", undefined)).toThrow(/name/);
  });
});

describe("compact", () => {
  it("undefined のキーを除去し、他の値（null / 0 / 空文字）は残す", () => {
    expect(compact({ a: 1, b: undefined, c: null, d: 0, e: "" })).toEqual({
      a: 1,
      c: null,
      d: 0,
      e: "",
    });
  });

  it("元のオブジェクトを変更しない", () => {
    const source = { a: 1, b: undefined };
    compact(source);
    expect("b" in source).toBe(true);
  });

  it("空オブジェクトは空オブジェクトを返す", () => {
    expect(compact({})).toEqual({});
  });
});
