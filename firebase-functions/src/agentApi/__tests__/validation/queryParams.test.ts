/** @jest-environment node */
import { parseQueryDate, parseQueryMonth } from "../../validation/queryParams";
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
