/** @jest-environment node */
import { matchRoute } from "../router";

describe("matchRoute", () => {
  it.each([
    ["GET", "/budget/expenses", "expenses", "list", undefined],
    ["POST", "/budget/expenses", "expenses", "create", undefined],
    ["PATCH", "/budget/expenses/expense-1", "expenses", "update", "expense-1"],
    ["DELETE", "/budget/expenses/expense-1", "expenses", "remove", "expense-1"],
    ["GET", "/budget/categories", "categories", "list", undefined],
    ["GET", "/budget/income-items", "incomeItems", "list", undefined],
    ["POST", "/budget/expense-items", "expenseItems", "create", undefined],
    ["GET", "/journal/entries", "journalEntries", "list", undefined],
    [
      "DELETE",
      "/journal/entries/journal-1",
      "journalEntries",
      "remove",
      "journal-1",
    ],
  ])("%s %s", (method, path, resource, action, id) => {
    expect(matchRoute(method, path)).toEqual({ resource, action, id });
  });

  it("末尾スラッシュと URL エンコードされた ID を扱う", () => {
    expect(matchRoute("GET", "/budget/expenses/")).toMatchObject({
      action: "list",
    });
    expect(matchRoute("DELETE", "/budget/expenses/a%20b")).toMatchObject({
      id: "a b",
    });
  });

  it("未知のパスは 404", () => {
    expect(() => matchRoute("GET", "/unknown")).toThrow(
      expect.objectContaining({ status: 404, code: "not_found" }),
    );
    expect(() => matchRoute("GET", "/budget/expenses/a/b")).toThrow(
      expect.objectContaining({ status: 404 }),
    );
  });

  it("メソッド不一致は 405", () => {
    expect(() => matchRoute("PUT", "/budget/expenses")).toThrow(
      expect.objectContaining({ status: 405, code: "method_not_allowed" }),
    );
    expect(() => matchRoute("POST", "/budget/expenses/expense-1")).toThrow(
      expect.objectContaining({ status: 405 }),
    );
    expect(() => matchRoute("GET", "/budget/expenses/expense-1")).toThrow(
      expect.objectContaining({ status: 405 }),
    );
  });

  it("不正なパーセントエンコードは 400", () => {
    expect(() => matchRoute("DELETE", "/budget/expenses/%E0%A4%A")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_path" }),
    );
  });
});
