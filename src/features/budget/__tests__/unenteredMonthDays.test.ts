import type { Expense } from "@/types/routine";
import { calculateUnenteredMonthDays } from "../utils/unenteredMonthDays";

describe("calculateUnenteredMonthDays", () => {
  const currentDate = new Date("2026-03-01T00:00:00+09:00");
  const now = new Date("2026-03-07T12:00:00+09:00");

  it("当月ではない場合（過去月・未来月）は 0 を返す", () => {
    const pastDate = new Date("2026-02-01T00:00:00+09:00");
    const futureDate = new Date("2026-04-01T00:00:00+09:00");

    expect(calculateUnenteredMonthDays(pastDate, [], now)).toBe(0);
    expect(calculateUnenteredMonthDays(futureDate, [], now)).toBe(0);
  });

  it("当月で支出入力が0件の場合、当月の総日数をそのまま返す", () => {
    // 3月は31日間
    expect(calculateUnenteredMonthDays(currentDate, [], now)).toBe(31);
  });

  it("今日以外に入力がある日がある場合、そのユニーク日数分だけ減算される", () => {
    const expenses: Expense[] = [
      { id: "e1", date: "2026-03-01", amount: 1000, createdAt: "" },
      { id: "e2", date: "2026-03-05", amount: 2000, createdAt: "" },
    ];
    // 31 - 2 = 29
    expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(29);
  });

  it("同一日に複数の支出があっても1日分のみ減算される", () => {
    const expenses: Expense[] = [
      { id: "e1", date: "2026-03-01", amount: 1000, createdAt: "" },
      { id: "e2", date: "2026-03-01", amount: 2000, createdAt: "" },
      { id: "e3", date: "2026-03-01", amount: 500, createdAt: "" },
    ];
    // 31 - 1 = 30
    expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(30);
  });

  it("他の月の支出データが混入していても、当月日数から減算されない", () => {
    const expenses: Expense[] = [
      { id: "e1", date: "2026-02-28", amount: 1000, createdAt: "" },
      { id: "e2", date: "2026-03-01", amount: 2000, createdAt: "" },
      { id: "e3", date: "2026-04-01", amount: 3000, createdAt: "" },
    ];
    // 当月(03月)で今日以外の入力日は 03-01 のみ -> 31 - 1 = 30
    expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(30);
  });

  it("今日付の支出があっても今日例外ルールにより未入力日数から引かれない（今日が日数に含まれる）", () => {
    const expenses: Expense[] = [
      { id: "e1", date: "2026-03-01", amount: 1000, createdAt: "" },
      { id: "e2", date: "2026-03-07", amount: 2000, createdAt: "" },
      { id: "e3", date: "2026-03-07", amount: 500, createdAt: "" },
    ];
    // 今日(03-07)は除外対象から外れるため、今日以外の入力日は 03-01 のみ -> 31 - 1 = 30
    expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(30);
  });

  it("今日付のみ支出がある場合、当月の総日数（31日）がそのまま維持される", () => {
    const expenses: Expense[] = [
      { id: "e1", date: "2026-03-07", amount: 1000, createdAt: "" },
    ];
    expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(31);
  });

  it("当月全日に入力がある場合でも、今日例外ルールにより最低1日（今日分）となり0未満にならない", () => {
    // 3月1日〜31日すべてに入力がある場合
    const allDaysExpenses: Expense[] = Array.from({ length: 31 }, (_, i) => ({
      id: `e-${i + 1}`,
      date: `2026-03-${String(i + 1).padStart(2, "0")}`,
      amount: 100,
      createdAt: "",
    }));
    // 今日(03-07)以外の入力日数は30日 -> 31 - 30 = 1
    expect(calculateUnenteredMonthDays(currentDate, allDaysExpenses, now)).toBe(
      1,
    );
  });

  it("月末日（31日）において、今日以外の全日（1〜30日）に入力がある場合、今日例外ルールにより 1 を返す", () => {
    const endOfMonth = new Date("2026-03-31T15:00:00+09:00");
    const expenses: Expense[] = Array.from({ length: 30 }, (_, i) => ({
      id: `e-${i + 1}`,
      date: `2026-03-${String(i + 1).padStart(2, "0")}`,
      amount: 100,
      createdAt: "",
    }));

    // 31日（今日）に入力がなくても 1
    expect(calculateUnenteredMonthDays(currentDate, expenses, endOfMonth)).toBe(
      1,
    );

    // 31日（今日）に入力を追加しても今日例外ルールにより 1 のまま
    const expensesWithToday = [
      ...expenses,
      { id: "e-31", date: "2026-03-31", amount: 200, createdAt: "" },
    ];
    expect(
      calculateUnenteredMonthDays(currentDate, expensesWithToday, endOfMonth),
    ).toBe(1);
  });

  it("月初日（1日）において、今日付に入力があっても当月の総日数を維持する", () => {
    const startOfMonth = new Date("2026-03-01T10:00:00+09:00");
    const expenses: Expense[] = [
      { id: "e1", date: "2026-03-01", amount: 1500, createdAt: "" },
    ];
    expect(
      calculateUnenteredMonthDays(currentDate, expenses, startOfMonth),
    ).toBe(31);
  });

  it("30日の月（4月）や2月（28日）でも各月の総日数に基づいて正しく計算される", () => {
    const aprilDate = new Date("2026-04-01T00:00:00+09:00");
    const aprilNow = new Date("2026-04-10T12:00:00+09:00");
    // 4月は30日。今日(04-10)以外に1日(04-01)入力あり -> 30 - 1 = 29
    expect(
      calculateUnenteredMonthDays(
        aprilDate,
        [{ id: "e1", date: "2026-04-01", amount: 1000, createdAt: "" }],
        aprilNow,
      ),
    ).toBe(29);

    const febDate = new Date("2026-02-01T00:00:00+09:00");
    const febNow = new Date("2026-02-15T12:00:00+09:00");
    // 2026年2月は28日。今日(02-15)以外に入力なし -> 28
    expect(calculateUnenteredMonthDays(febDate, [], febNow)).toBe(28);
  });

  describe("0 円の入力（支出が無かった日）", () => {
    it("今日より前の日付の 0 円は、入力済みの日として未入力日数から引く", () => {
      const expenses: Expense[] = [
        { id: "e1", date: "2026-03-01", amount: 0, createdAt: "" },
        { id: "e2", date: "2026-03-05", amount: 0, createdAt: "" },
      ];
      // 31 - 2 = 29
      expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(29);
    });

    it("同じ日の 0 円と金額ありの入力は、1 日分だけ引く", () => {
      const expenses: Expense[] = [
        { id: "e1", date: "2026-03-01", amount: 0, createdAt: "" },
        { id: "e2", date: "2026-03-01", amount: 500, createdAt: "" },
      ];
      expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(30);
    });

    it("今日の 0 円は、今日例外ルールにより引かない", () => {
      const expenses: Expense[] = [
        { id: "e1", date: "2026-03-07", amount: 0, createdAt: "" },
      ];
      expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(31);
    });

    it("未来の日付の 0 円は、まだ確定していないため引かない", () => {
      const expenses: Expense[] = [
        { id: "e1", date: "2026-03-10", amount: 0, createdAt: "" },
      ];
      expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(31);
    });

    it("未来の日付でも、金額がある入力は従来どおり引く（0 円だけが過去に限られる）", () => {
      const expenses: Expense[] = [
        { id: "e1", date: "2026-03-10", amount: 100, createdAt: "" },
      ];
      expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(30);
    });

    it("他の月の 0 円は、当月の日数から引かない", () => {
      const expenses: Expense[] = [
        { id: "e1", date: "2026-02-28", amount: 0, createdAt: "" },
      ];
      expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(31);
    });
  });

  it("0 円以外の既存データ（負の金額）は、従来どおり入力済みの日として引く（0 円の規則は 0 円にだけ働く）", () => {
    const expenses: Expense[] = [
      { id: "e1", date: "2026-03-03", amount: -500, createdAt: "" },
    ];
    expect(calculateUnenteredMonthDays(currentDate, expenses, now)).toBe(30);
  });
});
