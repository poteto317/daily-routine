/** @jest-environment node */
import {
  assertAmountRuleForPatch,
  assertZeroAmountOnPastDate,
} from "../../operations/expenses/expenseAmountRule";
import { expectApiError } from "../testUtils";

const NOW = new Date("2026-10-03T00:30:00.000Z"); // JST 2026-10-03 09:30

describe("assertZeroAmountOnPastDate", () => {
  it("0 より大きい金額は、日付に関わらず通す（今日・未来も）", () => {
    expect(() =>
      assertZeroAmountOnPastDate({ date: "2026-10-03", amount: 1 }, NOW),
    ).not.toThrow();
    expect(() =>
      assertZeroAmountOnPastDate({ date: "2030-01-01", amount: 100 }, NOW),
    ).not.toThrow();
  });

  it("0 円は、今日（JST）より前の日付なら通す", () => {
    expect(() =>
      assertZeroAmountOnPastDate({ date: "2026-10-02", amount: 0 }, NOW),
    ).not.toThrow();
    expect(() =>
      assertZeroAmountOnPastDate({ date: "2020-01-01", amount: 0 }, NOW),
    ).not.toThrow();
  });

  it.each(["2026-10-03", "2026-10-04", "2027-01-01"])(
    "0 円は、今日（JST）以降の日付 %s なら 400 invalid_field",
    (date) => {
      expectApiError(
        () => assertZeroAmountOnPastDate({ date, amount: 0 }, NOW),
        400,
        "invalid_field",
      );
    },
  );

  it("エラーのメッセージは、amount のフィールドと、今日（JST）より前の日付に限ることを示す", () => {
    expect(() =>
      assertZeroAmountOnPastDate({ date: "2026-10-03", amount: 0 }, NOW),
    ).toThrow("amount: 0 は、今日（JST）より前の日付にだけ指定できます");
  });
});

describe("assertZeroAmountOnPastDate（今日の判定は JST）", () => {
  it("UTC では前日でも、JST で今日になる日時なら、その日付の 0 円は 400", () => {
    // UTC 2026-10-02 16:00 は JST 2026-10-03 01:00。JST の今日は 10-03
    const justAfterJstMidnight = new Date("2026-10-02T16:00:00.000Z");
    expectApiError(
      () =>
        assertZeroAmountOnPastDate(
          { date: "2026-10-03", amount: 0 },
          justAfterJstMidnight,
        ),
      400,
      "invalid_field",
    );
    expect(() =>
      assertZeroAmountOnPastDate(
        { date: "2026-10-02", amount: 0 },
        justAfterJstMidnight,
      ),
    ).not.toThrow();
  });
});

describe("assertAmountRuleForPatch", () => {
  const todayZero = { date: "2026-10-03", amount: 0 };

  it("金額を変える更新は、更新後の組み合わせを確認する", () => {
    expectApiError(
      () => assertAmountRuleForPatch({ amount: 0 }, todayZero, NOW),
      400,
      "invalid_field",
    );
  });

  it("日付を変える更新は、更新後の組み合わせを確認する", () => {
    expectApiError(
      () => assertAmountRuleForPatch({ date: "2026-10-03" }, todayZero, NOW),
      400,
      "invalid_field",
    );
  });

  it("金額も日付も変えない更新は、確認しない（既存のデータの更新を止めない）", () => {
    expect(() => assertAmountRuleForPatch({}, todayZero, NOW)).not.toThrow();
  });

  it("更新後が 0 円でなければ、通す", () => {
    expect(() =>
      assertAmountRuleForPatch(
        { amount: 100 },
        { date: "2026-10-03", amount: 100 },
        NOW,
      ),
    ).not.toThrow();
  });

  it("更新後が過去の日付の 0 円なら、通す", () => {
    expect(() =>
      assertAmountRuleForPatch(
        { amount: 0, date: "2026-10-01" },
        { date: "2026-10-01", amount: 0 },
        NOW,
      ),
    ).not.toThrow();
  });
});
