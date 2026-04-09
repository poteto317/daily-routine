import { HOLIDAY_DAY_VALUE } from "../constants";
import type { Routine } from "../types";

/**
 * 旧 holidayMode フィールドを新しい daysOfWeek 形式に変換する（後方互換）
 */
export const getMigratedDaysOfWeek = (routine: Routine): number[] => {
  const hasHolidayDay = routine.daysOfWeek.includes(HOLIDAY_DAY_VALUE);

  if (hasHolidayDay || !routine.holidayMode) return routine.daysOfWeek;

  if (routine.holidayMode === "only") return [HOLIDAY_DAY_VALUE];
  else if (routine.holidayMode === "include") {
    return [...routine.daysOfWeek, HOLIDAY_DAY_VALUE];
  }

  return routine.daysOfWeek;
};
