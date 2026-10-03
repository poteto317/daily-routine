/** @jest-environment node */
import {
  assertKnownQueryKeys,
  parseQueryDate,
  parseQueryMonth,
} from "../../validation/queryParams";
import { expectApiError } from "../testUtils";

describe("parseQueryMonth", () => {
  it("未指定は undefined、YYYY-MM は返す", () => {
    expect(parseQueryMonth(undefined)).toBeUndefined();
    expect(parseQueryMonth("2026-02")).toBe("2026-02");
  });

  it.each(["2026-2", "2026-13", "", "abc"])("%p は 400 invalid_query", (v) => {
    expectApiError(() => parseQueryMonth(v), 400, "invalid_query");
  });
});

describe("parseQueryDate", () => {
  it("未指定は undefined、実在する日付は返す", () => {
    expect(parseQueryDate(undefined)).toBeUndefined();
    expect(parseQueryDate("2026-02-03")).toBe("2026-02-03");
    expect(parseQueryDate("2024-02-29")).toBe("2024-02-29");
  });

  it.each(["x", "2026-02-30", "2026-2-3", ""])(
    "%p は 400 invalid_query",
    (v) => {
      expectApiError(() => parseQueryDate(v), 400, "invalid_query");
    },
  );
});

describe("assertKnownQueryKeys", () => {
  it("許可されたキーのみ、または空なら何も投げない", () => {
    expect(() =>
      assertKnownQueryKeys({ month: "2026-10" }, ["month"]),
    ).not.toThrow();
    expect(() => assertKnownQueryKeys({}, ["month"])).not.toThrow();
    expect(() => assertKnownQueryKeys({}, [])).not.toThrow();
  });

  it("打ち間違いなど未対応のキーは 400 invalid_query で、メッセージにキー名を含む", () => {
    expectApiError(
      () => assertKnownQueryKeys({ mont: "2026-10" }, ["month"]),
      400,
      "invalid_query",
    );
    expect(() =>
      assertKnownQueryKeys({ mont: "2026-10", foo: "x" }, ["month"]),
    ).toThrow(/mont, foo/);
  });

  it("許可キーが空のときは、どのキーも 400", () => {
    expectApiError(
      () => assertKnownQueryKeys({ month: "2026-10" }, []),
      400,
      "invalid_query",
    );
  });

  it("値が undefined のキーは指定されていないものとして無視する", () => {
    expect(() =>
      assertKnownQueryKeys({ mont: undefined }, ["month"]),
    ).not.toThrow();
  });

  it("許可キーと未対応キーが混在していれば 400", () => {
    expectApiError(
      () => assertKnownQueryKeys({ month: "2026-10", mont: "x" }, ["month"]),
      400,
      "invalid_query",
    );
  });
});
