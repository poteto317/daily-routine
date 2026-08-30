import type { RoutinePreset, RoutineTemplate } from "@/types/routine";
import { buildRoutineIdentityKey } from "./presetRoutineIdentity";
import { hasPresetRoutineCoreFields } from "./presetRoutineValidation";
import { isStoredPreset } from "./presetStorageValidation";

const LEGACY_PRESET_TIMESTAMP = "1970-01-01T00:00:00.000Z";

const normalizePresetTimestamps = (
  createdAt: unknown,
  updatedAt: unknown,
): { createdAt: string; updatedAt: string } => {
  const validCreatedAt = typeof createdAt === "string" ? createdAt : null;
  const validUpdatedAt = typeof updatedAt === "string" ? updatedAt : null;
  const fallback = validCreatedAt ?? validUpdatedAt ?? LEGACY_PRESET_TIMESTAMP;

  return {
    createdAt: validCreatedAt ?? fallback,
    updatedAt: validUpdatedAt ?? fallback,
  };
};

const normalizeRoutineTemplates = (value: unknown): RoutineTemplate[] => {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const normalized: RoutineTemplate[] = [];

  for (const template of value) {
    if (!hasPresetRoutineCoreFields(template)) continue;

    const key = buildRoutineIdentityKey(template.title, template.startTime);
    if (seen.has(key)) continue;

    seen.add(key);
    normalized.push(template);
  }

  return normalized;
};

export const normalizeStoredPresets = (value: unknown): RoutinePreset[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(isStoredPreset).map((preset) => {
    const timestamps = normalizePresetTimestamps(
      preset.createdAt,
      preset.updatedAt,
    );

    return {
      id: preset.id,
      name: preset.name,
      ...(preset.description === undefined
        ? {}
        : { description: preset.description }),
      routineTemplates: normalizeRoutineTemplates(preset.routineTemplates),
      ...timestamps,
    };
  });
};
