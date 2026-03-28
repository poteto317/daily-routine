import { Routine, RoutinePreset, RoutineTemplate } from "@/types/routine";

const createPresetId = () =>
  `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const createPresetFromRoutines = (
  name: string,
  routines: Routine[],
  description?: string,
): RoutinePreset => {
  const now = new Date().toISOString();
  const routineTemplates: RoutineTemplate[] = routines.map((routine) => ({
    title: routine.title,
    startTime: routine.startTime,
    duration: routine.duration,
    category: routine.category,
    description: routine.description,
    notificationMinutes: routine.notificationMinutes,
  }));

  return {
    id: createPresetId(),
    name,
    description,
    routineTemplates,
    createdAt: now,
    updatedAt: now,
  };
};

export const createRoutinesFromPreset = (
  preset: RoutinePreset,
  daysOfWeek: number[],
): Omit<Routine, "id" | "sortOrder" | "createdAt" | "updatedAt">[] => {
  return preset.routineTemplates.map((template) => ({
    title: template.title,
    startTime: template.startTime,
    duration: template.duration,
    category: template.category,
    description: template.description,
    notificationMinutes: template.notificationMinutes,
    daysOfWeek,
    isCompleted: false,
  }));
};
