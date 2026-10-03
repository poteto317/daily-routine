/** @jest-environment node */
import { RESOURCE_OPERATIONS, RESOURCE_QUERY_KEYS } from "../../operations";

describe("RESOURCE_QUERY_KEYS", () => {
  it("すべてのリソースに許可キーの定義がある（操作の定義と同じキー集合）", () => {
    expect(Object.keys(RESOURCE_QUERY_KEYS).sort()).toEqual(
      Object.keys(RESOURCE_OPERATIONS).sort(),
    );
  });

  it("支出一覧は month、ジャーナル一覧は date のみ、他は受け付けない", () => {
    expect(RESOURCE_QUERY_KEYS.expenses).toEqual(["month"]);
    expect(RESOURCE_QUERY_KEYS.journalEntries).toEqual(["date"]);
    expect(RESOURCE_QUERY_KEYS.categories).toEqual([]);
    expect(RESOURCE_QUERY_KEYS.incomeItems).toEqual([]);
    expect(RESOURCE_QUERY_KEYS.expenseItems).toEqual([]);
  });
});
