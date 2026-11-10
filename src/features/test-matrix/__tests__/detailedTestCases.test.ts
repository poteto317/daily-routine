import { DETAILED_TEST_CASES } from "../detailedTestCases";
import { buildInitialData } from "../initialData";

describe("DETAILED_TEST_CASES", () => {
  // 保存済みの確認結果は項目 ID とケース ID で引き当てる。ID は変えず、
  // 確認を消しても後ろの番号は詰めない（欠番は許す）ため、連番かどうかは見ない
  it.each(Object.entries(DETAILED_TEST_CASES))(
    "%s の詳細ケースの ID は項目 ID を接頭辞に持ち、項目の中で重複しない",
    (itemId, cases) => {
      const ids = cases.map((testCase) => testCase.id);

      expect(ids.filter((id) => !id.startsWith(`${itemId}-`))).toEqual([]);
      expect(new Set(ids).size).toBe(ids.length);
    },
  );

  it("業務日誌の詳細ケースは 27-1〜27-3 にあり、ジャーナルの 3-7〜3-9 には残らない", () => {
    expect(Object.keys(DETAILED_TEST_CASES)).toEqual(
      expect.arrayContaining(["27-1", "27-2", "27-3"]),
    );
    expect(DETAILED_TEST_CASES["3-7"]).toBeUndefined();
    expect(DETAILED_TEST_CASES["3-8"]).toBeUndefined();
    expect(DETAILED_TEST_CASES["3-9"]).toBeUndefined();
  });

  it("詳細ケースのキーはすべて、初期データのどれかの項目 ID に対応する", () => {
    const itemIds = new Set(
      buildInitialData().flatMap((category) =>
        category.items.map((item) => item.id),
      ),
    );

    expect(
      Object.keys(DETAILED_TEST_CASES).filter((id) => !itemIds.has(id)),
    ).toEqual([]);
  });
});
