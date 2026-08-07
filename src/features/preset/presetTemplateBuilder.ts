import type { Routine, RoutinePreset, RoutineTemplate } from "@/types/routine";

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
