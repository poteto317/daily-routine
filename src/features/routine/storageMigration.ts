import { HOLIDAY_DAY_VALUE, type Routine } from "@/types/routine";

type LegacyRoutine = Partial<Routine> & {
  id: string;
  sets?: string[];
  holidayBehavior?: string;
  showOnHoliday?: boolean;
  isHolidayPriority?: boolean;
  holidayMode?: string;
};

const resolveDaysOfWeek = (routine: LegacyRoutine): number[] => {
  let daysOfWeek =
    routine.daysOfWeek ||
    (routine.sets?.includes("weekday")
      ? [1, 2, 3, 4, 5]
      : routine.sets?.includes("weekend")
        ? [0, 6]
        : [0, 1, 2, 3, 4, 5, 6]);

  if (routine.holidayMode) {
    if (routine.holidayMode === "only") {
      daysOfWeek = [HOLIDAY_DAY_VALUE];
    } else if (routine.holidayMode === "include") {
      if (!daysOfWeek.includes(HOLIDAY_DAY_VALUE)) {
        daysOfWeek = [...daysOfWeek, HOLIDAY_DAY_VALUE];
      }
    }
  } else if (routine.isHolidayPriority) {
    daysOfWeek = [HOLIDAY_DAY_VALUE];
  } else if (routine.showOnHoliday) {
    if (!daysOfWeek.includes(HOLIDAY_DAY_VALUE)) {
      daysOfWeek = [...daysOfWeek, HOLIDAY_DAY_VALUE];
    }
  } else if (routine.holidayBehavior === "only") {
    daysOfWeek = [HOLIDAY_DAY_VALUE];
  } else if (
    routine.holidayBehavior === "show" ||
    routine.sets?.includes("holiday")
  ) {
    if (!daysOfWeek.includes(HOLIDAY_DAY_VALUE)) {
      daysOfWeek = [...daysOfWeek, HOLIDAY_DAY_VALUE];
    }
  }

  return daysOfWeek;
};

export const migrateRoutineRecord = (routine: LegacyRoutine): Routine => {
  const migrated: Routine = {
    ...routine,
    category: routine.category || "other",
    daysOfWeek: resolveDaysOfWeek(routine),
    sortOrder: routine.sortOrder ?? 0,
  } as Routine;

  const result = { ...migrated } as LegacyRoutine;
  delete result.sets;
  delete result.holidayBehavior;
  delete result.showOnHoliday;
  delete result.isHolidayPriority;
  delete result.holidayMode;

  return result as Routine;
};
