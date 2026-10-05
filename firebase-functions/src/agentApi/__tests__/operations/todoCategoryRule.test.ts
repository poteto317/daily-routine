/** @jest-environment node */
import { assertCategoryExists } from "../../operations/todo/todoCategoryRule";

describe("assertCategoryExists", () => {
  const syncData = {
    todoCategories: [
      { id: "cat-1", name: "仕事" },
      { id: "cat-2", name: "買い物" },
    ],
  };

  it("実在する categoryId の場合は例外を投げない", () => {
    expect(() => assertCategoryExists(syncData, "cat-1")).not.toThrow();
    expect(() => assertCategoryExists(syncData, "cat-2")).not.toThrow();
  });

  it("存在しない categoryId の場合は 400 invalid_field", () => {
    expect(() => assertCategoryExists(syncData, "non-existent")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });

  it("todoCategories フィールドが存在しない場合も 400 invalid_field", () => {
    expect(() => assertCategoryExists({}, "cat-1")).toThrow(
      expect.objectContaining({ status: 400, code: "invalid_field" }),
    );
  });
});
