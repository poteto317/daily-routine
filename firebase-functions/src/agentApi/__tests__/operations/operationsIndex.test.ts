/** @jest-environment node */
import {
  getAllowedQueryKeys,
  RESOURCE_OPERATIONS,
  RESOURCE_QUERY_KEYS,
  RESOURCE_REMOVE_QUERY_KEYS,
} from "../../operations";

describe("RESOURCE_QUERY_KEYS", () => {
  it("すべてのリソースに許可キーの定義がある（操作の定義と同じキー集合）", () => {
    expect(Object.keys(RESOURCE_QUERY_KEYS).sort()).toEqual(
      Object.keys(RESOURCE_OPERATIONS).sort(),
    );
  });

  it("リソースごとの許可クエリパラメータが定義されている", () => {
    expect(RESOURCE_QUERY_KEYS.expenses).toEqual(["month"]);
    expect(RESOURCE_QUERY_KEYS.journalEntries).toEqual(["date"]);
    expect(RESOURCE_QUERY_KEYS.todoItems).toEqual(["listId"]);
    expect(RESOURCE_QUERY_KEYS.categories).toEqual([]);
    expect(RESOURCE_QUERY_KEYS.incomeItems).toEqual([]);
    expect(RESOURCE_QUERY_KEYS.expenseItems).toEqual([]);
    expect(RESOURCE_QUERY_KEYS.todoLists).toEqual([]);
    expect(RESOURCE_QUERY_KEYS.todoCategories).toEqual([]);
  });

  it("削除で許可されるクエリパラメータが定義されている", () => {
    expect(RESOURCE_REMOVE_QUERY_KEYS.todoItems).toEqual(["listId"]);
  });
});

describe("getAllowedQueryKeys", () => {
  it("list アクションでは RESOURCE_QUERY_KEYS のキーを返す", () => {
    expect(getAllowedQueryKeys("expenses", "list")).toEqual(["month"]);
    expect(getAllowedQueryKeys("todoItems", "list")).toEqual(["listId"]);
    expect(getAllowedQueryKeys("todoLists", "list")).toEqual([]);
  });

  it("remove アクションでは RESOURCE_REMOVE_QUERY_KEYS のキーを返す", () => {
    expect(getAllowedQueryKeys("todoItems", "remove")).toEqual(["listId"]);
    expect(getAllowedQueryKeys("todoLists", "remove")).toEqual([]);
    expect(getAllowedQueryKeys("expenses", "remove")).toEqual([]);
  });

  it("create / update アクションでは常に空配列を返す", () => {
    expect(getAllowedQueryKeys("todoItems", "create")).toEqual([]);
    expect(getAllowedQueryKeys("todoItems", "update")).toEqual([]);
    expect(getAllowedQueryKeys("expenses", "create")).toEqual([]);
  });
});
