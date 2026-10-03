import {
  resolveExpenseUsedTime,
  sortExpensesByDateDesc,
} from "../budgetExpenseListSort";

describe("budgetExpenseListSort", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2026-03-07T12:00:00+09:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("支出一覧を日付降順に並べる", () => {
    expect(
      sortExpensesByDateDesc([
        {
          id: "e1",
          date: "2026-03-03",
          amount: 100,
          createdAt: "2026-03-03T00:00:00.000Z",
        },
        {
          id: "e2",
          date: "2026-03-05",
          amount: 200,
          createdAt: "2026-03-05T00:00:00.000Z",
        },
      ]),
    ).toEqual([
      expect.objectContaining({ id: "e2" }),
      expect.objectContaining({ id: "e1" }),
    ]);
  });

  describe("追加時刻(resolveExpenseUsedTime)と一覧の並び順(sortExpensesByDateDesc)", () => {
    it("resolveExpenseUsedTimeはusedTimeが設定済みならその値をそのまま返す", () => {
      expect(
        resolveExpenseUsedTime({
          id: "e1",
          date: "2026-03-03",
          amount: 100,
          createdAt: "2026-03-03T00:00:00.000Z",
          usedTime: "18:30",
        }),
      ).toBe("18:30");
    });

    it("resolveExpenseUsedTimeはusedTime未設定ならcreatedAtの時刻部分（ローカル）にフォールバックする", () => {
      // "2026-03-03T00:00:00.000Z" はJST（UTC+9）で09:00になる。
      expect(
        resolveExpenseUsedTime({
          id: "e1",
          date: "2026-03-03",
          amount: 100,
          createdAt: "2026-03-03T00:00:00.000Z",
        }),
      ).toBe("09:00");
    });

    it("resolveExpenseUsedTimeはusedTimeが空文字列（以前の編集画面で時刻をクリアして保存されたデータ等）でもcreatedAtへフォールバックする", () => {
      // usedTime: "" は null/undefined ではないため `??` では素通りしてしまう
      // （回帰: `new Date("2026-03-03T")` は Invalid Date になり並び替えが壊れる）。
      // "2026-03-03T00:00:00.000Z" はJST（UTC+9）で09:00になる。
      expect(
        resolveExpenseUsedTime({
          id: "e1",
          date: "2026-03-03",
          amount: 100,
          createdAt: "2026-03-03T00:00:00.000Z",
          usedTime: "",
        }),
      ).toBe("09:00");
    });

    it("同じ日付の支出はusedTimeが新しい順（追加時刻が遅い順）に並ぶ", () => {
      const morning = {
        id: "morning",
        date: "2026-03-05",
        amount: 100,
        createdAt: "2026-03-05T00:00:00.000Z",
        usedTime: "08:00",
      };
      const evening = {
        id: "evening",
        date: "2026-03-05",
        amount: 200,
        createdAt: "2026-03-05T00:00:00.000Z",
        usedTime: "20:00",
      };

      // 配列の格納順（先に記録した方が先頭）に関わらず、追加時刻が
      // 遅い方（evening）が上に来ることを確認する。
      expect(
        sortExpensesByDateDesc([morning, evening]).map((e) => e.id),
      ).toEqual(["evening", "morning"]);
      expect(
        sortExpensesByDateDesc([evening, morning]).map((e) => e.id),
      ).toEqual(["evening", "morning"]);
    });

    it("usedTime未設定の同日の支出同士は、記録時刻(createdAt)が新しい順に並ぶ", () => {
      // 配列の格納順（addExpenseがpushする順=先に記録した方が先頭）通りに
      // 並べると「先に追加した支出が上」という誤った順序になっていた
      // 不具合の回帰確認。usedTimeが無い場合はcreatedAtへフォールバックし、
      // 後から記録した方（recordedLater）が上に来る。
      const recordedEarlier = {
        id: "recorded-earlier",
        date: "2026-03-05",
        amount: 100,
        createdAt: "2026-03-05T01:00:00.000Z",
      };
      const recordedLater = {
        id: "recorded-later",
        date: "2026-03-05",
        amount: 200,
        createdAt: "2026-03-05T05:00:00.000Z",
      };

      expect(
        sortExpensesByDateDesc([recordedEarlier, recordedLater]).map(
          (e) => e.id,
        ),
      ).toEqual(["recorded-later", "recorded-earlier"]);
    });

    it("usedTime設定済みの支出と未設定の支出が混在していても正しく並ぶ", () => {
      const explicitEarly = {
        id: "explicit-early",
        date: "2026-03-05",
        amount: 100,
        createdAt: "2026-03-05T00:00:00.000Z",
        usedTime: "07:00",
      };
      const fallbackFromCreatedAt = {
        id: "fallback",
        date: "2026-03-05",
        amount: 200,
        // usedTime未設定 → createdAtの時刻部分（JSTで21:00）にフォールバック
        createdAt: "2026-03-05T12:00:00.000Z",
      };

      expect(
        sortExpensesByDateDesc([explicitEarly, fallbackFromCreatedAt]).map(
          (e) => e.id,
        ),
      ).toEqual(["fallback", "explicit-early"]);
    });

    it("日付が異なる場合は追加時刻に関わらず日付が優先される", () => {
      const earlierDateLaterTime = {
        id: "earlier-date",
        date: "2026-03-04",
        amount: 100,
        createdAt: "2026-03-04T00:00:00.000Z",
        usedTime: "23:59",
      };
      const laterDateEarlierTime = {
        id: "later-date",
        date: "2026-03-05",
        amount: 200,
        createdAt: "2026-03-05T00:00:00.000Z",
        usedTime: "00:01",
      };

      expect(
        sortExpensesByDateDesc([
          earlierDateLaterTime,
          laterDateEarlierTime,
        ]).map((e) => e.id),
      ).toEqual(["later-date", "earlier-date"]);
    });

    it("usedTimeが空文字列の支出が混在していても、Invalid Dateにならず正しく並ぶ（回帰）", () => {
      const clearedTime = {
        id: "cleared",
        date: "2026-03-05",
        amount: 100,
        // ネイティブの<input type="time">をクリアすると空文字列になりうる。
        // "2026-03-05T05:00:00.000Z" はJSTで14:00にフォールバックする。
        createdAt: "2026-03-05T05:00:00.000Z",
        usedTime: "",
      };
      const explicitTime = {
        id: "explicit",
        date: "2026-03-05",
        amount: 200,
        createdAt: "2026-03-05T00:00:00.000Z",
        usedTime: "09:00",
      };

      const result = sortExpensesByDateDesc([clearedTime, explicitTime]);

      // 14:00（フォールバック） > 09:00 なので cleared が上に来る。
      expect(result.map((e) => e.id)).toEqual(["cleared", "explicit"]);
    });
  });
});
