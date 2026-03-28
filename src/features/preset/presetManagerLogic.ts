import type { Routine, RoutinePreset, RoutineTemplate } from "@/types/routine";

type ToggleCreateFilterDayParams = {
  currentRoutines: Routine[];
  createFilterDays: Set<number>;
  selectedRoutines: Set<string>;
  day: number;
};

export const buildRoutineTemplatesFromRoutines = (
  routines: Routine[],
): RoutineTemplate[] => {
  return routines.map((routine) => ({
    title: routine.title,
    startTime: routine.startTime,
    duration: routine.duration,
    category: routine.category,
    description: routine.description,
    notificationMinutes: routine.notificationMinutes,
  }));
};

export const buildUpdatedPreset = (params: {
  preset: RoutinePreset;
  name: string;
  description: string;
  routinesToSave: Routine[];
}): RoutinePreset => {
  const { preset, name, description, routinesToSave } = params;
  const newTemplates = buildRoutineTemplatesFromRoutines(routinesToSave);

  return {
    ...preset,
    name: name.trim(),
    description: description.trim() || undefined,
    routineTemplates:
      newTemplates.length > 0 ? newTemplates : preset.routineTemplates,
  };
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

  if (isAddingDay) {
    nextFilterDays.add(day);
    currentRoutines.forEach((routine) => {
      if (routine.daysOfWeek.includes(day)) {
        nextSelectedRoutines.add(routine.id);
      }
    });

    return { nextFilterDays, nextSelectedRoutines };
  }

  nextFilterDays.delete(day);
  currentRoutines.forEach((routine) => {
    if (!routine.daysOfWeek.includes(day)) {
      return;
    }

    const stillCovered = routine.daysOfWeek.some(
      (value) => value !== day && nextFilterDays.has(value),
    );

    if (!stillCovered) {
      nextSelectedRoutines.delete(routine.id);
    }
  });

  return { nextFilterDays, nextSelectedRoutines };
};
