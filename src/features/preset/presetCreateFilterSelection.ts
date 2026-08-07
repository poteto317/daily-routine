import type { Routine } from "@/types/routine";
import { groupRoutinesForSelection } from "./presetRoutineGrouping";

type ToggleCreateFilterDayParams = {
  currentRoutines: Routine[];
  createFilterDays: Set<number>;
  selectedRoutines: Set<string>;
  day: number;
};

export const resolveCreateFilterSelection = ({
  currentRoutines,
  createFilterDays,
  selectedRoutines,
  day,
}: ToggleCreateFilterDayParams): {
  nextFilterDays: Set<number>;
  nextSelectedRoutines: Set<string>;
} => {
  const nextFilterDays = new Set(createFilterDays);
  const nextSelectedRoutines = new Set(selectedRoutines);
  const isAddingDay = !createFilterDays.has(day);
  const groups = groupRoutinesForSelection(currentRoutines);

  if (isAddingDay) {
    nextFilterDays.add(day);
    groups.forEach((group) => {
      if (group.daysOfWeek.includes(day)) {
        nextSelectedRoutines.add(group.routine.id);
      }
    });

    return { nextFilterDays, nextSelectedRoutines };
  }

  nextFilterDays.delete(day);
  groups.forEach((group) => {
    if (!group.daysOfWeek.includes(day)) {
      return;
    }

    const stillCovered = group.daysOfWeek.some(
      (value) => value !== day && nextFilterDays.has(value),
    );

    if (!stillCovered) {
      group.routineIds.forEach((id) => nextSelectedRoutines.delete(id));
    }
  });

  return { nextFilterDays, nextSelectedRoutines };
};
