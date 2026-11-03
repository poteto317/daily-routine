import { DETAILED_TEST_CASES } from "../detailedTestCases";

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
});
