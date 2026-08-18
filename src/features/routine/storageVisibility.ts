import { HOLIDAY_DAY_VALUE, type Routine } from "@/types/routine";
import { isHoliday } from "@/lib/holidays";
import { getJstToday } from "@/lib/storage/core";

export const shouldShowRoutineForDate = (
  routine: Routine,
  date: Date,
): boolean => {
  const dayOfWeek = date.getDay();
  return isHoliday(date)
    ? routine.daysOfWeek.includes(HOLIDAY_DAY_VALUE)
    : routine.daysOfWeek.includes(dayOfWeek);
};

/**
 * 今日そのルーティンを出すか。
 *
 * 曜日も祝日も JST の「今日」で判定する。端末ローカルのままだと、
 * 表示する曜日と進捗を記録する日付キーが別の日を指すことになる。
 */
export const shouldShowRoutineToday = (routine: Routine): boolean => {
  return shouldShowRoutineForDate(routine, getJstToday());
};

export const filterRoutinesByDayOfWeek = (
  routines: Routine[],
  dayOfWeek: number,
): Routine[] => {
  return routines.filter((routine) => routine.daysOfWeek.includes(dayOfWeek));
};
