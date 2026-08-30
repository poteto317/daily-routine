import { type Routine, type RoutinePreset } from "@/types/routine";
import { buildRoutineTemplatesFromRoutines } from "./presetTemplateConverter";
import { normalizePresetMetadata } from "./presetMetadataNormalization";

const createPresetId = () =>
  `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const createPresetFromRoutines = (
  name: string,
  routines: Routine[],
  description?: string,
): RoutinePreset => {
  const now = new Date().toISOString();
  const metadata = normalizePresetMetadata(name, description);
  return {
    id: createPresetId(),
    ...metadata,
    routineTemplates: buildRoutineTemplatesFromRoutines(routines),
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

export const duplicatePreset = (preset: RoutinePreset): RoutinePreset => {
  const now = new Date().toISOString();
  const metadata = normalizePresetMetadata(preset.name, preset.description);
  return {
    id: createPresetId(),
    name: `${metadata.name}のコピー`,
    description: metadata.description,
    routineTemplates: preset.routineTemplates.map((template) => ({
      ...template,
    })),
    createdAt: now,
    updatedAt: now,
  };
};
