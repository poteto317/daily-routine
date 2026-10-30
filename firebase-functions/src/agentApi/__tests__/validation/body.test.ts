/** @jest-environment node */
import {
  asJsonObject,
  assertKnownKeys,
  isJsonObject,
  parseBody,
} from "../../validation/body";
import { expectApiError } from "../testUtils";

describe("isJsonObject", () => {
  it.each([{}, { a: 1 }, Object.create(null)])("%p は true", (value) => {
    expect(isJsonObject(value)).toBe(true);
  });

  it.each([null, undefined, [], [{ a: 1 }], "x", 1, true])(
    "%p は false",
    (value) => {
      expect(isJsonObject(value)).toBe(false);
    },
  );
});

describe("asJsonObject", () => {
  it("オブジェクトはそのまま返す", () => {
    const body = { a: 1 };
    expect(asJsonObject(body)).toBe(body);
  });

  it.each([null, undefined, [], "x", 1, true])(
    "%p は 400 invalid_body",
    (value) => {
      expectApiError(() => asJsonObject(value), 400, "invalid_body");
    },
  );
});

describe("assertKnownKeys", () => {
  it("未知キーは 400 unknown_field", () => {
    expectApiError(
      () => assertKnownKeys({ name: "a", typo: 1 }, ["name"]),
      400,
      "unknown_field",
    );
  });

  it("エラーメッセージに未対応キーをすべて含める", () => {
    expect(() => assertKnownKeys({ a: 1, b: 2, c: 3 }, ["a"])).toThrow(/b, c/);
  });

  it("既知キーのみ、または空オブジェクトなら何も投げない", () => {
    expect(() => assertKnownKeys({ name: "a" }, ["name"])).not.toThrow();
    expect(() => assertKnownKeys({}, ["name"])).not.toThrow();
  });

  it("__proto__ キーは未知キーとして拒否する", () => {
    const body = JSON.parse('{"__proto__": {"x": 1}}') as Record<
      string,
      unknown
    >;
    expectApiError(() => assertKnownKeys(body, ["name"]), 400, "unknown_field");
  });
});

describe("parseBody", () => {
  it("許可キーのみのオブジェクトをそのまま返す", () => {
    const body = { title: "a" };
    expect(parseBody(body, ["title", "content"])).toBe(body);
  });

  it("オブジェクト以外は invalid_body", () => {
    expectApiError(() => parseBody(null, ["title"]), 400, "invalid_body");
    expectApiError(() => parseBody([], ["title"]), 400, "invalid_body");
  });

  it("許可外のキーは unknown_field", () => {
    expectApiError(
      () => parseBody({ date: "2026-10-01" }, ["title"]),
      400,
      "unknown_field",
    );
  });

  it("本文が undefined（JSON 以外の Content-Type）でも invalid_body", () => {
    expectApiError(() => parseBody(undefined, ["title"]), 400, "invalid_body");
  });
});
