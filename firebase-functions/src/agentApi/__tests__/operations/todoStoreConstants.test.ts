/** @jest-environment node */
import {
  TODO_CATEGORIES_FIELD,
  TODO_LISTS_FIELD,
} from "../../operations/todo/todoStoreConstants";

describe("todoStoreConstants", () => {
  it("Firestore 同期ドキュメントのフィールド名が正しく定義されている", () => {
    expect(TODO_LISTS_FIELD).toBe("todoLists");
    expect(TODO_CATEGORIES_FIELD).toBe("todoCategories");
  });
});
