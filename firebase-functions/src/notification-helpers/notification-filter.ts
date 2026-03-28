import { HOLIDAY_DAY_VALUE } from "../constants";
import { Routine } from "../types";
import { getMigratedDaysOfWeek } from "./day-migration";

/**
 * 指定された曜日・祝日状態に応じてルーティンを通知すべきか判定する
 */
export const shouldNotifyRoutine = (
  routine: Routine,
  currentDayOfWeek: number,
  isHoliday: boolean,
): boolean => {
  const effectiveDaysOfWeek = getMigratedDaysOfWeek(routine);
  const hasHoliday = effectiveDaysOfWeek.includes(HOLIDAY_DAY_VALUE);

  if (isHoliday) return hasHoliday;

  return effectiveDaysOfWeek.includes(currentDayOfWeek);
};
