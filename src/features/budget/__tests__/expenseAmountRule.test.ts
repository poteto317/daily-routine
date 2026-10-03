import {
  isExpenseAmountAllowedOnDate,
  isZeroAmountOnUnavailableDate,
} from "../utils/expenseAmountRule";

describe("isExpenseAmountAllowedOnDate", () => {
  const now = new Date("2026-03-07T12:00:00+09:00");

  it("0 より大きい金額は、過去・今日・未来のどの日付でも有効", () => {
    expect(isExpenseAmountAllowedOnDate(1, "2026-03-06", now)).toBe(true);
    expect(isExpenseAmountAllowedOnDate(100, "2026-03-07", now)).toBe(true);
    expect(isExpenseAmountAllowedOnDate(0.5, "2026-03-08", now)).toBe(true);
  });

  it("0 円は、今日より前の日付だけ有効", () => {
    expect(isExpenseAmountAllowedOnDate(0, "2026-03-06", now)).toBe(true);
    expect(isExpenseAmountAllowedOnDate(0, "2025-12-31", now)).toBe(true);
  });

  it("0 円は、今日と未来の日付では無効", () => {
    expect(isExpenseAmountAllowedOnDate(0, "2026-03-07", now)).toBe(false);
    expect(isExpenseAmountAllowedOnDate(0, "2026-03-08", now)).toBe(false);
    expect(isExpenseAmountAllowedOnDate(0, "2027-01-01", now)).toBe(false);
  });

  it("負の金額は、どの日付でも無効", () => {
    expect(isExpenseAmountAllowedOnDate(-1, "2026-03-06", now)).toBe(false);
    expect(isExpenseAmountAllowedOnDate(-0.01, "2026-03-08", now)).toBe(false);
  });

  it("今日の判定は、深夜 0 時の境界で切り替わる", () => {
    const justBeforeMidnight = new Date("2026-03-07T23:59:59+09:00");
    const justAfterMidnight = new Date("2026-03-08T00:00:00+09:00");
    expect(
      isExpenseAmountAllowedOnDate(0, "2026-03-07", justBeforeMidnight),
    ).toBe(false);
    expect(
      isExpenseAmountAllowedOnDate(0, "2026-03-07", justAfterMidnight),
    ).toBe(true);
  });
});

describe("isZeroAmountOnUnavailableDate（入力中の文字列の判定）", () => {
  const now = new Date("2026-03-07T12:00:00+09:00");

  it("0 円（文字列）で、今日以降の日付なら true", () => {
    expect(isZeroAmountOnUnavailableDate("0", "2026-03-07", now)).toBe(true);
    expect(isZeroAmountOnUnavailableDate("0", "2026-03-08", now)).toBe(true);
    expect(isZeroAmountOnUnavailableDate("0.0", "2026-03-07", now)).toBe(true);
  });

  it("0 円でも、今日より前の日付なら false", () => {
    expect(isZeroAmountOnUnavailableDate("0", "2026-03-06", now)).toBe(false);
  });

  it("0 円以外・空・数値でない入力は、日付に関わらず false（別の理由で扱う）", () => {
    expect(isZeroAmountOnUnavailableDate("100", "2026-03-07", now)).toBe(false);
    expect(isZeroAmountOnUnavailableDate("", "2026-03-07", now)).toBe(false);
    expect(isZeroAmountOnUnavailableDate("abc", "2026-03-07", now)).toBe(false);
    expect(isZeroAmountOnUnavailableDate("-1", "2026-03-07", now)).toBe(false);
  });
});
