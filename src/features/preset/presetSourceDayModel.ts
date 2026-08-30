import { HOLIDAY_DAY_VALUE, type Routine } from "@/types/routine";
import { DAY_LABELS } from "./presetConstants";
import { selectRoutinesForPresetSourceDay } from "./presetSourceRoutineSelection";

export type PresetSourceDayOption = {
  day: number;
  label: string;
  hasRoutines: boolean;
  isSelected: boolean;
  isHoliday: boolean;
};

export type PresetSourceDayModel = {
  selectedDay: number | null;
  options: PresetSourceDayOption[];
  selectedRoutines: Routine[];
};

export const createPresetSourceDayModel = (
  routines: Routine[],
  sourceDay: number | null,
): PresetSourceDayModel => {
  const routinesByDay = DAY_LABELS.map((_, day) =>
    selectRoutinesForPresetSourceDay(routines, day),
  );

  return {
    selectedDay: sourceDay,
    options: DAY_LABELS.map((label, day) => ({
      day,
      label,
      hasRoutines: routinesByDay[day].length > 0,
      isSelected: sourceDay === day,
      isHoliday: day === HOLIDAY_DAY_VALUE,
    })),
    selectedRoutines:
      sourceDay === null ? [] : (routinesByDay[sourceDay] ?? []),
  };
};
