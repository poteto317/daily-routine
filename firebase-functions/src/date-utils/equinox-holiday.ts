import { getSpringEquinoxDay, getAutumnEquinoxDay } from "./equinox-calculator";

/**
 * 春分の日・秋分の日に該当するか判定する
 */
export const isEquinoxHoliday = (
  year: number,
  month: number,
  day: number,
): boolean => {
  if (month === 3 && day === getSpringEquinoxDay(year)) {
    return true;
  }

  if (month === 9 && day === getAutumnEquinoxDay(year)) {
    return true;
  }

  return false;
};
