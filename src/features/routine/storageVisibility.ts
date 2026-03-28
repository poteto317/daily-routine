import { HOLIDAY_DAY_VALUE, type Routine } from "@/types/routine";
import { isHoliday } from "@/lib/holidays";

export const shouldShowRoutineForDate = (
  routine: Routine,
  date: Date,
): boolean => {
  const dayOfWeek = date.getDay();
  return isHoliday(date)
    ? routine.daysOfWeek.includes(HOLIDAY_DAY_VALUE)
    : routine.daysOfWeek.includes(dayOfWeek);
};

export const shouldShowRoutineToday = (routine: Routine): boolean => {
  return shouldShowRoutineForDate(routine, new Date());
};

export const filterRoutinesByDayOfWeek = (
  routines: Routine[],
  dayOfWeek: number,
): Routine[] => {
  return routines.filter((routine) => routine.daysOfWeek.includes(dayOfWeek));
};
