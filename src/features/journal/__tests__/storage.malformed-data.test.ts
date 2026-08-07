import { getJournalHistory } from "../storage";

/**
 * getJournalHistoryは取得結果をそのままObject.entries()に渡すため、
 * 保存値が壊れていると例外になっていた。
 * この関数は同期のアップロード収集(collectLocalSyncData)からも呼ばれるため、
 * ここで例外を投げるとジャーナル以外も含めた同期全体が停止してしまう。
 */
describe("getJournalHistory の不正データ耐性", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each([
    ["null", "null"],
    ["配列", "[1,2,3]"],
    ["数値", "42"],
    ["文字列", '"broken"'],
  ])("保存値が%sでも例外を投げず空の履歴を返す", (_label, raw) => {
    localStorage.setItem("journal-history", raw);

    expect(() => getJournalHistory()).not.toThrow();
    expect(getJournalHistory()).toEqual({});
  });

  it("正常な履歴はそのまま読み取れる", () => {
    localStorage.setItem(
      "journal-history",
      JSON.stringify({
        "2026-03-01": [
          {
            id: "j1",
            date: "2026-03-01",
            content: "メモ",
            createdAt: "2026-03-01T00:00:00.000Z",
            updatedAt: "2026-03-01T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(Object.keys(getJournalHistory())).toEqual(["2026-03-01"]);
  });
});
