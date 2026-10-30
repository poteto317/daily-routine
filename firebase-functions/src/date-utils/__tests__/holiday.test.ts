/** @jest-environment node */
import {
  getAutumnEquinoxDay,
  getSpringEquinoxDay,
} from "../equinox-calculator";
import { isEquinoxHoliday } from "../equinox-holiday";
import { isFixedHoliday } from "../fixed-holiday";
import { isHappyMondayHoliday } from "../happy-monday-holiday";
import { isJapaneseHoliday } from "../holiday";

const MONDAY = 1;
const TUESDAY = 2;

describe("春分・秋分の日の計算", () => {
  it.each([
    [2024, 20, 22],
    [2025, 20, 23],
    [2026, 20, 23],
    [2027, 21, 23],
  ])("%i 年は春分が 3/%i、秋分が 9/%i", (year, spring, autumn) => {
    expect(getSpringEquinoxDay(year)).toBe(spring);
    expect(getAutumnEquinoxDay(year)).toBe(autumn);
  });
});

describe("isEquinoxHoliday", () => {
  it("春分・秋分の日の当日だけ true", () => {
    expect(isEquinoxHoliday(2026, 3, 20)).toBe(true);
    expect(isEquinoxHoliday(2026, 9, 23)).toBe(true);
  });

  it("前後の日は false", () => {
    expect(isEquinoxHoliday(2026, 3, 19)).toBe(false);
    expect(isEquinoxHoliday(2026, 3, 21)).toBe(false);
    expect(isEquinoxHoliday(2026, 9, 22)).toBe(false);
    expect(isEquinoxHoliday(2026, 9, 24)).toBe(false);
  });

  it("日付が一致しても月が違えば false", () => {
    expect(isEquinoxHoliday(2026, 4, 20)).toBe(false);
    expect(isEquinoxHoliday(2026, 10, 23)).toBe(false);
  });
});

describe("isFixedHoliday", () => {
  it.each([
    [1, 1],
    [2, 11],
    [2, 23],
    [4, 29],
    [5, 3],
    [5, 4],
    [5, 5],
    [8, 11],
    [11, 3],
    [11, 23],
  ])("%i/%i は固定祝日", (month, day) => {
    expect(isFixedHoliday(month, day)).toBe(true);
  });

  it.each([
    [1, 2],
    [5, 6],
    [12, 23],
    [12, 31],
  ])("%i/%i は固定祝日ではない", (month, day) => {
    expect(isFixedHoliday(month, day)).toBe(false);
  });
});

describe("isHappyMondayHoliday", () => {
  it.each([
    [1, 8],
    [1, 14],
    [7, 15],
    [7, 21],
    [9, 15],
    [9, 21],
    [10, 8],
    [10, 14],
  ])("%i 月 %i 日の月曜は対象の週に入る", (month, day) => {
    expect(isHappyMondayHoliday(month, day, MONDAY)).toBe(true);
  });

  it.each([
    [1, 7],
    [1, 15],
    [7, 14],
    [7, 22],
    [9, 14],
    [9, 22],
    [10, 7],
    [10, 15],
  ])("%i 月 %i 日の月曜は対象の週から外れる", (month, day) => {
    expect(isHappyMondayHoliday(month, day, MONDAY)).toBe(false);
  });

  it("月曜以外は対象の週でも false", () => {
    expect(isHappyMondayHoliday(1, 12, TUESDAY)).toBe(false);
  });

  it("ハッピーマンデーの無い月は false", () => {
    expect(isHappyMondayHoliday(2, 9, MONDAY)).toBe(false);
  });
});

describe("isJapaneseHoliday", () => {
  it.each([
    ["元日", 2026, 1, 1],
    ["成人の日", 2026, 1, 12],
    ["春分の日", 2026, 3, 20],
    ["海の日", 2026, 7, 20],
    ["敬老の日", 2026, 9, 21],
    ["秋分の日", 2026, 9, 23],
    ["スポーツの日", 2026, 10, 12],
    ["勤労感謝の日", 2026, 11, 23],
  ])("%s（%i/%i/%i）は祝日", (_name, year, month, day) => {
    expect(isJapaneseHoliday(new Date(year, month - 1, day))).toBe(true);
  });

  it("平日は祝日ではない", () => {
    expect(isJapaneseHoliday(new Date(2026, 9, 30))).toBe(false);
  });

  it("成人の日の前週の月曜は祝日ではない", () => {
    expect(isJapaneseHoliday(new Date(2026, 0, 5))).toBe(false);
  });

  // 現状の実装は振替休日と国民の休日を判定しない。対応したらこのテストを更新する
  it("振替休日・国民の休日は判定対象外", () => {
    expect(isJapaneseHoliday(new Date(2026, 4, 6))).toBe(false);
    expect(isJapaneseHoliday(new Date(2026, 8, 22))).toBe(false);
  });
});
