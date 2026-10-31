import {
  buildBudgetAllowanceExport,
  getBudgetAllowanceExportFileName,
  parseBudgetAllowanceImport,
} from "../budgetAllowanceTransfer";

const incomeItem = {
  id: "income-1",
  name: "給与",
  amount: 300000,
  createdAt: "2026-05-01T00:00:00.000Z",
};
const fixedItem = {
  id: "expense-1",
  name: "家賃",
  amount: 80000,
  kind: "fixed" as const,
  createdAt: "2026-05-02T00:00:00.000Z",
};
const variableItem = {
  id: "expense-2",
  name: "食費",
  amount: 30000,
  kind: "variable" as const,
  createdAt: "2026-05-03T00:00:00.000Z",
};

const buildFile = (overrides: Record<string, unknown> = {}) => ({
  type: "daily-routine-budget-allowance",
  version: 1,
  exportDate: "2026-10-31T00:00:00.000Z",
  incomeItems: [incomeItem],
  expenseItems: [fixedItem],
  ...overrides,
});

const parse = (overrides: Record<string, unknown> = {}) =>
  parseBudgetAllowanceImport(JSON.stringify(buildFile(overrides)));

/** 成功の結果を取り出す。失敗なら理由つきでテストを落とす */
const parseOk = (overrides: Record<string, unknown> = {}) => {
  const result = parse(overrides);
  if (!result.ok) throw new Error(`読み込みに失敗した: ${result.reason}`);
  return result;
};

describe("buildBudgetAllowanceExport", () => {
  it("種類・版・書き出した時刻を入れる", () => {
    const file = buildBudgetAllowanceExport(
      [incomeItem],
      [fixedItem],
      new Date("2026-10-31T00:00:00.000Z"),
    );

    expect(file).toEqual({
      type: "daily-routine-budget-allowance",
      version: 1,
      exportDate: "2026-10-31T00:00:00.000Z",
      incomeItems: [incomeItem],
      expenseItems: [fixedItem],
    });
  });

  it("書き出した内容を読み戻すと同じ項目が同じ順で返る", () => {
    const secondIncome = { ...incomeItem, id: "income-2", name: "副業" };
    const file = buildBudgetAllowanceExport(
      [secondIncome, incomeItem],
      [variableItem, fixedItem],
    );

    expect(parseBudgetAllowanceImport(JSON.stringify(file))).toEqual({
      ok: true,
      incomeItems: [secondIncome, incomeItem],
      expenseItems: [variableItem, fixedItem],
    });
  });
});

describe("getBudgetAllowanceExportFileName", () => {
  it("日付を入れたファイル名を返す", () => {
    expect(getBudgetAllowanceExportFileName("2026-10-31")).toBe(
      "daily-routine-budget-allowance-2026-10-31.json",
    );
  });
});

describe("parseBudgetAllowanceImport", () => {
  describe("invalidFormat", () => {
    it.each([
      ["JSON でない文字列", "not json"],
      ["null", "null"],
      ["配列", "[]"],
      ["数値", "1"],
    ])("%s は受け付けない", (_label, text) => {
      expect(parseBudgetAllowanceImport(text)).toEqual({
        ok: false,
        reason: "invalidFormat",
      });
    });

    it("type が無いファイルは受け付けない", () => {
      expect(parse({ type: undefined })).toEqual({
        ok: false,
        reason: "invalidFormat",
      });
    });

    it("設定画面のバックアップは受け付けない", () => {
      // 別のファイルを読むと、収入・支出の項目が意図せず置き換わるため
      const backup = {
        version: "3.0",
        exportDate: "2026-10-31T00:00:00.000Z",
        budgetIncomeItems: [incomeItem],
        budgetExpenseItems: [fixedItem],
      };

      expect(parseBudgetAllowanceImport(JSON.stringify(backup))).toEqual({
        ok: false,
        reason: "invalidFormat",
      });
    });

    it.each([
      ["type が違う", { type: "daily-routine-backup" }],
      ["version が 2", { version: 2 }],
      ["version が文字列", { version: "1" }],
      ["incomeItems が配列でない", { incomeItems: {} }],
      ["incomeItems が無い", { incomeItems: undefined }],
      ["expenseItems が配列でない", { expenseItems: "x" }],
      ["expenseItems が無い", { expenseItems: undefined }],
      ["収入項目が文字列", { incomeItems: ["給与"] }],
      ["収入項目が null", { incomeItems: [null] }],
      ["収入項目が配列", { incomeItems: [[]] }],
      ["支出項目が文字列", { expenseItems: ["家賃"] }],
      ["name が数値", { incomeItems: [{ ...incomeItem, name: 1 }] }],
      ["name が空白だけ", { incomeItems: [{ ...incomeItem, name: "  " }] }],
      [
        "支出の name が空白だけ",
        { expenseItems: [{ ...fixedItem, name: " " }] },
      ],
      ["amount が 0", { incomeItems: [{ ...incomeItem, amount: 0 }] }],
      ["amount が負", { incomeItems: [{ ...incomeItem, amount: -1 }] }],
      ["amount が文字列", { incomeItems: [{ ...incomeItem, amount: "1" }] }],
      ["amount が null", { incomeItems: [{ ...incomeItem, amount: null }] }],
      ["支出の amount が 0", { expenseItems: [{ ...fixedItem, amount: 0 }] }],
      ["kind が不正", { expenseItems: [{ ...fixedItem, kind: "other" }] }],
      ["kind が無い", { expenseItems: [{ ...fixedItem, kind: undefined }] }],
    ])("%s", (_label, overrides) => {
      expect(parse(overrides)).toEqual({ ok: false, reason: "invalidFormat" });
    });

    it("正しい項目に不正な項目が 1 件でも混ざれば全体を受け付けない", () => {
      expect(
        parse({ incomeItems: [incomeItem, { ...incomeItem, amount: 0 }] }),
      ).toEqual({ ok: false, reason: "invalidFormat" });
    });

    it("数値に変換すると無限大になる amount は受け付けない", () => {
      // JSON.stringify では作れない値なので、文字列を直接組み立てる
      const text = JSON.stringify(buildFile()).replace("300000", "1e999");

      expect(parseBudgetAllowanceImport(text)).toEqual({
        ok: false,
        reason: "invalidFormat",
      });
    });
  });

  describe("empty", () => {
    it("両方の配列が空なら読み込まない", () => {
      expect(parse({ incomeItems: [], expenseItems: [] })).toEqual({
        ok: false,
        reason: "empty",
      });
    });

    it("片方だけ空なら読み込める", () => {
      expect(parseOk({ incomeItems: [] }).expenseItems).toEqual([fixedItem]);
      expect(parseOk({ expenseItems: [] }).incomeItems).toEqual([incomeItem]);
    });
  });

  it("name を trim する", () => {
    const result = parseOk({
      incomeItems: [{ ...incomeItem, name: "  給与  " }],
      expenseItems: [{ ...fixedItem, name: "\t家賃\n" }],
    });

    expect(result.incomeItems[0].name).toBe("給与");
    expect(result.expenseItems[0].name).toBe("家賃");
  });

  describe("id", () => {
    it.each([
      ["無い", undefined],
      ["空", ""],
      ["数値", 1],
    ])("%s ときは新しい id を作る", (_label, id) => {
      const result = parseOk({
        incomeItems: [{ ...incomeItem, id }],
        expenseItems: [{ ...fixedItem, id }],
      });

      expect(result.incomeItems[0].id).toMatch(/^budget-income-item/);
      expect(result.expenseItems[0].id).toMatch(/^budget-expense-item/);
    });

    it("同じ配列で重複すると 2 件目以降だけ新しくする", () => {
      const result = parseOk({
        incomeItems: [incomeItem, incomeItem, incomeItem],
        expenseItems: [fixedItem, { ...variableItem, id: fixedItem.id }],
      });

      const incomeIds = result.incomeItems.map((item) => item.id);
      expect(incomeIds[0]).toBe("income-1");
      expect(incomeIds[1]).toMatch(/^budget-income-item/);
      expect(incomeIds[2]).toMatch(/^budget-income-item/);
      expect(new Set(incomeIds).size).toBe(3);

      expect(result.expenseItems[0].id).toBe("expense-1");
      expect(result.expenseItems[1].id).toMatch(/^budget-expense-item/);
    });

    it("収入と支出の間で同じ id でも、そのまま使う", () => {
      const result = parseOk({
        incomeItems: [{ ...incomeItem, id: "same" }],
        expenseItems: [{ ...fixedItem, id: "same" }],
      });

      expect(result.incomeItems[0].id).toBe("same");
      expect(result.expenseItems[0].id).toBe("same");
    });
  });

  describe("createdAt", () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date("2026-10-31T12:00:00.000Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it.each([
      ["無い", undefined],
      ["空", ""],
      ["数値", 1],
    ])("%s ときは現在時刻にする", (_label, createdAt) => {
      const result = parseOk({
        incomeItems: [{ ...incomeItem, createdAt }],
        expenseItems: [{ ...fixedItem, createdAt }],
      });

      expect(result.incomeItems[0].createdAt).toBe("2026-10-31T12:00:00.000Z");
      expect(result.expenseItems[0].createdAt).toBe("2026-10-31T12:00:00.000Z");
    });
  });

  it("未知のキーを結果に残さない", () => {
    const result = parseOk({
      unknown: "top",
      incomeItems: [{ ...incomeItem, extra: 1 }],
      expenseItems: [{ ...fixedItem, extra: 1 }],
    });

    expect(Object.keys(result).sort()).toEqual([
      "expenseItems",
      "incomeItems",
      "ok",
    ]);
    expect(Object.keys(result.incomeItems[0]).sort()).toEqual(
      ["amount", "createdAt", "id", "name"].sort(),
    );
    expect(Object.keys(result.expenseItems[0]).sort()).toEqual(
      ["amount", "createdAt", "id", "kind", "name"].sort(),
    );
  });
});
