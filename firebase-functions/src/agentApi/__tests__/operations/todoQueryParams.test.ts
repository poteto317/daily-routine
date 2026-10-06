/** @jest-environment node */
import {
  parseQueryCompleted,
  parseQueryListId,
} from "../../operations/todo/todoQueryParams";

describe("parseQueryListId", () => {
  it("正常な listId 文字列を返す", () => {
    expect(parseQueryListId("todo-list-1")).toBe("todo-list-1");
  });

  it("前後の空白をトリムして返す", () => {
    expect(parseQueryListId("  todo-list-1  ")).toBe("todo-list-1");
  });

  it("undefined は 400 invalid_query", () => {
    expect(() => parseQueryListId(undefined)).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_query" }),
    );
  });

  it("空文字・空白文字列は 400 invalid_query", () => {
    expect(() => parseQueryListId("")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_query" }),
    );
    expect(() => parseQueryListId("   ")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_query" }),
    );
  });

  it("200 文字を超える場合は 400 invalid_query", () => {
    expect(() => parseQueryListId("a".repeat(201))).toThrow(
      expect.objectContaining({
        status: 400,
        code: "invalid_query",
        message: "listId は 200 文字以内で指定してください",
      }),
    );
  });
});

describe("parseQueryCompleted", () => {
  it("undefined の場合は undefined を返す", () => {
    expect(parseQueryCompleted(undefined)).toBeUndefined();
  });

  it("'true' をパースして true を返す", () => {
    expect(parseQueryCompleted("true")).toBe(true);
    expect(parseQueryCompleted("  true  ")).toBe(true);
  });

  it("'false' をパースして false を返す", () => {
    expect(parseQueryCompleted("false")).toBe(false);
    expect(parseQueryCompleted("  false  ")).toBe(false);
  });

  it("不正な文字列は 400 invalid_query を投げる", () => {
    for (const invalid of ["", "   ", "1", "0", "yes", "no", "TRUE", "null"]) {
      expect(() => parseQueryCompleted(invalid)).toThrow(
        expect.objectContaining({
          status: 400,
          code: "invalid_query",
          message: "completed は true または false で指定してください",
        }),
      );
    }
  });
});

