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

    it("resolveExpenseUsedTimeはusedTimeが未設定・空文字でcreatedAtが不正な日時文字列の場合に'00:00'へフォールバックする", () => {
      expect(
        resolveExpenseUsedTime({
          id: "invalid-unset",
          date: "2026-03-03",
          amount: 100,
          createdAt: "invalid-date",
        }),
      ).toBe("00:00");
      expect(
        resolveExpenseUsedTime({
          id: "invalid-empty",
          date: "2026-03-03",
          amount: 100,
          createdAt: "",
          usedTime: "",
        }),
      ).toBe("00:00");
    });

    it("同日でusedTimeが異なる場合は、createdAtの前後に関わらずusedTimeが優先される", () => {
      const earlierUsedTimeButRecordedLater = {
        id: "used-early-recorded-late",
        date: "2026-03-05",
        amount: 100,
        createdAt: "2026-03-05T10:00:00.000Z",
        usedTime: "08:00",
      };
      const laterUsedTimeButRecordedEarlier = {
        id: "used-late-recorded-early",
        date: "2026-03-05",
        amount: 200,
        createdAt: "2026-03-05T01:00:00.000Z",
        usedTime: "20:00",
      };

      expect(
        sortExpensesByDateDesc([
          earlierUsedTimeButRecordedLater,
          laterUsedTimeButRecordedEarlier,
        ]).map((e) => e.id),
      ).toEqual(["used-late-recorded-early", "used-early-recorded-late"]);
      expect(
        sortExpensesByDateDesc([
          laterUsedTimeButRecordedEarlier,
          earlierUsedTimeButRecordedLater,
        ]).map((e) => e.id),
      ).toEqual(["used-late-recorded-early", "used-early-recorded-late"]);
    });

    it("同じ日付・同じusedTime（同じ分）の支出同士は、記録時刻(createdAt)が新しい順に並ぶ", () => {
      const firstInSameMinute = {
        id: "first-in-minute",
        date: "2026-03-05",
        amount: 100,
        createdAt: "2026-03-05T05:08:10.100Z",
        usedTime: "14:08",
      };
      const secondInSameMinute = {
        id: "second-in-minute",
        date: "2026-03-05",
        amount: 200,
        createdAt: "2026-03-05T05:08:45.900Z",
        usedTime: "14:08",
      };

      expect(
        sortExpensesByDateDesc([firstInSameMinute, secondInSameMinute]).map(
          (e) => e.id,
        ),
      ).toEqual(["second-in-minute", "first-in-minute"]);
      expect(
        sortExpensesByDateDesc([secondInSameMinute, firstInSameMinute]).map(
          (e) => e.id,
        ),
      ).toEqual(["second-in-minute", "first-in-minute"]);
    });

    it("usedTime未設定で同じ分に記録された同日の支出同士も、createdAtの秒・ミリ秒が新しい順に並ぶ", () => {
      const earlierSecond = {
        id: "earlier-second",
        date: "2026-03-05",
        amount: 100,
        createdAt: "2026-03-05T05:08:05.000Z",
      };
      const laterSecond = {
        id: "later-second",
        date: "2026-03-05",
        amount: 200,
        createdAt: "2026-03-05T05:08:50.000Z",
      };

      expect(
        sortExpensesByDateDesc([earlierSecond, laterSecond]).map((e) => e.id),
      ).toEqual(["later-second", "earlier-second"]);
      expect(
        sortExpensesByDateDesc([laterSecond, earlierSecond]).map((e) => e.id),
      ).toEqual(["later-second", "earlier-second"]);
    });

    it("同じ日付・同じusedTimeでcreatedAtのタイムゾーン表記が異なる場合でも、実時刻が新しい順に並ぶ", () => {
      // 2026-03-05T05:08:30.000Z (14:08:30 JST) と 2026-03-05T14:08:10.000+09:00 (05:08:10 UTC)
      // 文字列比較だと "2026-03-05T14:..." > "2026-03-05T05:..." になるが、実時刻は UTC 05:08:30 の方が新しい。
      const offsetNotationEarlier = {
        id: "offset-earlier",
        date: "2026-03-05",
        amount: 100,
        createdAt: "2026-03-05T14:08:10.000+09:00",
        usedTime: "14:08",
      };
      const utcNotationLater = {
        id: "utc-later",
        date: "2026-03-05",
        amount: 200,
        createdAt: "2026-03-05T05:08:30.000Z",
        usedTime: "14:08",
      };

      expect(
        sortExpensesByDateDesc([offsetNotationEarlier, utcNotationLater]).map(
          (e) => e.id,
        ),
      ).toEqual(["utc-later", "offset-earlier"]);
      expect(
        sortExpensesByDateDesc([utcNotationLater, offsetNotationEarlier]).map(
          (e) => e.id,
        ),
      ).toEqual(["utc-later", "offset-earlier"]);
    });

    it("同じ日付・同じusedTimeでcreatedAtが両方ともパース不能な場合は、createdAt文字列の降順で並ぶ", () => {
      const invalidA = {
        id: "invalid-a",
        date: "2026-03-05",
        amount: 100,
        createdAt: "not-a-date-1",
        usedTime: "14:08",
      };
      const invalidB = {
        id: "invalid-b",
        date: "2026-03-05",
        amount: 200,
        createdAt: "not-a-date-2",
        usedTime: "14:08",
      };

      expect(
        sortExpensesByDateDesc([invalidA, invalidB]).map((e) => e.id),
      ).toEqual(["invalid-b", "invalid-a"]);
      expect(
        sortExpensesByDateDesc([invalidB, invalidA]).map((e) => e.id),
      ).toEqual(["invalid-b", "invalid-a"]);
    });

    it("同じ日付・同じusedTime・同じcreatedAtの支出同士は、配列の後方（後からpushされた方）が上に来る", () => {
      const pushedFirst = {
        id: "pushed-first",
        date: "2026-03-05",
        amount: 100,
        createdAt: "2026-03-05T05:08:10.000Z",
        usedTime: "14:08",
      };
      const pushedSecond = {
        id: "pushed-second",
        date: "2026-03-05",
        amount: 200,
        createdAt: "2026-03-05T05:08:10.000Z",
        usedTime: "14:08",
      };

      expect(
        sortExpensesByDateDesc([pushedFirst, pushedSecond]).map((e) => e.id),
      ).toEqual(["pushed-second", "pushed-first"]);
    });

    it("元の配列を破壊（ミューテート）しない", () => {
      const original = [
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
      ];
      const snapshot = [...original];

      const sorted = sortExpensesByDateDesc(original);

      expect(original).toEqual(snapshot);
      expect(sorted).not.toBe(original);
    });
  });
});
