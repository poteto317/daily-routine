/** @jest-environment node */
import {
  DATE_PATTERN,
  isRealDate,
  isValidDate,
  MONTH_PATTERN,
  TIME_PATTERN,
} from "../../validation/dateFormats";

describe("isRealDate", () => {
  it.each(["2026-02-28", "2024-02-29", "2026-12-31", "2000-02-29"])(
    "%s は実在する",
    (value) => {
      expect(isRealDate(value)).toBe(true);
    },
  );

  it.each([
    "2026-02-30",
    "2025-02-29",
    "2026-04-31",
    "2026-13-01",
    "2026-00-10",
  ])("%s は実在しない", (value) => {
    expect(isRealDate(value)).toBe(false);
  });

  it("西暦 100 年未満でも暦どおりに判定する（Date.UTC の 1900 年補正に引きずられない）", () => {
    expect(isRealDate("0050-01-01")).toBe(true);
    expect(isRealDate("0050-02-30")).toBe(false);
  });
});

describe("isValidDate", () => {
  it("形式と実在性の両方を満たすときだけ true", () => {
    expect(isValidDate("2026-02-28")).toBe(true);
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("20260228")).toBe(false);
    expect(isValidDate("2026-2-8")).toBe(false);
    expect(isValidDate("")).toBe(false);
  });
});

describe("パターン定数", () => {
  it("DATE_PATTERN は 4-2-2 桁のみ", () => {
    expect(DATE_PATTERN.test("2026-02-28")).toBe(true);
    expect(DATE_PATTERN.test("2026-02-28\n")).toBe(false);
  });

  it("MONTH_PATTERN は 01〜12 月のみ", () => {
    expect(MONTH_PATTERN.test("2026-01")).toBe(true);
    expect(MONTH_PATTERN.test("2026-12")).toBe(true);
    expect(MONTH_PATTERN.test("2026-00")).toBe(false);
    expect(MONTH_PATTERN.test("2026-13")).toBe(false);
  });

  it("TIME_PATTERN は 00:00〜23:59 のみ", () => {
    expect(TIME_PATTERN.test("00:00")).toBe(true);
    expect(TIME_PATTERN.test("23:59")).toBe(true);
    expect(TIME_PATTERN.test("24:00")).toBe(false);
    expect(TIME_PATTERN.test("12:60")).toBe(false);
    expect(TIME_PATTERN.test("9:05")).toBe(false);
  });
});
