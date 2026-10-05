/** @jest-environment node */
import { parseQueryListId } from "../../operations/todo/todoQueryParams";

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
